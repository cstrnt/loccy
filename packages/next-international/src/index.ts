import {
  getLoccyRemoteUrl,
  LocaleFile,
  getBranchName,
  LocaleKey,
} from "@loccy/shared";
export { asConfig } from "@loccy/shared";

declare global {
  const __non_webpack_require__: any;
}

export type inferLocales<T extends LocaleFile> = {
  [K in keyof T["keys"] as T["keys"][K] extends LocaleKey
    ? K
    : `${K extends string ? K : ""}.${keyof T["keys"][K] extends string
        ? keyof T["keys"][K]
        : ""}`]: `{${keyof T["keys"][K]["params"] extends infer Keyname extends string
    ? Keyname
    : never}}`;
};

export function generateLocales(config: LocaleFile) {
  return config.locales.reduce<Record<string, any>>((acc, localeKey) => {
    acc[localeKey] = async () => {
      let branchName;
      if (
        typeof window === "undefined" &&
        // https://stackoverflow.com/questions/54274912/webpack-using-node-modules-in-an-isomorphic-package/54276108?ref=hackernoon.com#54276108
        typeof __non_webpack_require__ !== "undefined"
      ) {
        branchName = getBranchName();
      }

      const url = new URL(
        `${getLoccyRemoteUrl()}/api/locales/${config.projectId}/${localeKey}`
      );

      url.searchParams.set("nesting", "true");

      if (branchName != null) {
        url.searchParams.set("branchName", branchName);
      }

      console.log({ url: url.toString() });

      return fetch(url)
        .then((r) => r.json())
        .then((e) => ({ default: e }))
        .catch(() => ({ default: {} }));
    };
    return acc;
  }, {});
}

export function getConfig(options: LocaleFile & { loccyRemoteUrl?: string }) {
  // we need to cache the branch name because it's not available in the browser
  // but it is called on the server and then on the client seconds after
  let lastRequestTime = Date.now();
  let lastBranchName: string | undefined;

  return {
    ...options.locales.reduce<Record<string, any>>((acc, localeKey) => {
      acc[localeKey] = async () => {
        if (
          typeof window === "undefined" &&
          // https://stackoverflow.com/questions/54274912/webpack-using-node-modules-in-an-isomorphic-package/54276108?ref=hackernoon.com#54276108
          typeof __non_webpack_require__ !== "undefined"
        ) {
          lastBranchName = getBranchName();
          lastRequestTime = Date.now();
        }

        // reset cache after 1 minute
        if (lastRequestTime + 1000 * 60 < Date.now()) {
          lastBranchName = undefined;
        }

        const url = new URL(
          `${options.loccyRemoteUrl ?? getLoccyRemoteUrl()}/api/locales/${
            options.projectId
          }/${localeKey}`
        );

        url.searchParams.set("nesting", "false");

        if (lastBranchName != null) {
          url.searchParams.set("branchName", lastBranchName);
        }

        return fetch(url)
          .then((r) => r.json())
          .then((e) => ({ default: e }))
          .catch(() => ({ default: {} }));
      };
      return acc;
    }, {}),
  };
}
