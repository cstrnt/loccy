import {
  getBranchName,
  getLoccyRemoteUrl,
  isNamespaceObject,
  LocaleFile,
  LocaleKey,
} from "@loccy/shared";
import { stringify } from "querystring";
export { asConfig, getBranchName } from "@loccy/shared";

export type LoccyOptions = {
  loccyRemoteUrl?: string;
} & LocaleFile;

class LoccyBackend {
  type = "backend";
  options: LoccyOptions | undefined;

  init(_services: any, backendOptions: LoccyOptions, _i18nextOptions: any) {
    /* use services and options */
    this.options = backendOptions;
  }
  async read(
    language: string,
    namespace: string,
    callback: (error: Error | null, data?: Record<string, string>) => void
  ) {
    if (!this.options) {
      throw new Error("LoccyBackend not initialized");
    }

    const { projectId, loccyRemoteUrl = getLoccyRemoteUrl() } = this.options;

    if (!projectId) {
      throw new Error("LoccyBackend projectId not provided");
    }

    let branchName;
    if (typeof window === "undefined") {
      branchName = getBranchName();
    }

    const query = {
      branchName,
      ns: namespace,
    };

    const res = await fetch(
      `
        ${loccyRemoteUrl}/api/locales/${projectId}/${language}?${stringify(
        query
      )}`
    );

    if (res.status === 200) {
      callback(null, await res.json());
      return;
    }

    callback(new Error("Could not connect with the Loccy backend"));
  }

  // only used in backends acting as cache layer
  save() {
    // store the translations
  }

  create() {
    /* save the missing translation */
  }

  static getRequiredOptions({
    projectId,
    loccyRemoteUrl,
    locales,
    defaultLocale,
    keys,
  }: LoccyOptions) {
    return {
      i18n: {
        defaultLocale,
        locales,
      },
      ns: [
        "common",
        // preload all namespaces
        ...Object.entries(keys).flatMap(([key, value]) =>
          isNamespaceObject(value) ? key : []
        ),
      ],
      serializeConfig: false,
      backend: {
        projectId,
        loccyRemoteUrl,
      },
    };
  }
}

/// @ts-expect-error - We need to add this to the i18next namespace
LoccyBackend.type = "backend";

type ExtractCommonKeys<T> = {
  [K in keyof T as T[K] extends LocaleKey ? K : never]: T[K];
};

export type inferLocales<T extends LocaleFile> = {
  [K in keyof T["keys"] as T["keys"][K] extends LocaleKey
    ? "common"
    : K]: T["keys"][K] extends LocaleKey
    ? {
        [K in keyof ExtractCommonKeys<T["keys"]>]: string;
      }
    : {
        [LK in keyof T["keys"][K]]: T["keys"][K][LK] extends LocaleKey
          ? string
          : never;
      };
};

export default LoccyBackend;
