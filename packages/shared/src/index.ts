import { z } from "zod";

const localeKeySchema = z.object({
  description: z.string().optional(),
  params: z.object({}).catchall(z.string()).optional(),
});

export type LocaleKey = z.infer<typeof localeKeySchema>;

export const localeFileSchema = z.object({
  projectId: z.string(),
  locales: z.array(z.string()),
  defaultLocale: z.string(),
  keys: z
    .object({})
    // allow one possible level of nesting
    .catchall(z.object({}).catchall(localeKeySchema).or(localeKeySchema)),
});

export type LocaleFile = z.infer<typeof localeFileSchema>;

export type inferLocales<T extends LocaleFile> = {
  [K in keyof T["keys"]]: `{${keyof T["keys"][K]["params"] extends infer Keyname extends string
    ? Keyname
    : never}}`;
};

export const asConfig = <T extends LocaleFile>(config: T): T => config;

export const DEFAULT_FILE_NAME = "loccy.config.js";

export const getLoccyRemoteUrl = () =>
  process.env.LOCCY_REMOTE_URL ?? "https://www.loccy.app";

export function getBranchName(): string | undefined {
  if (process.env.VERCEL_GIT_COMMIT_REF) {
    return process.env.VERCEL_GIT_COMMIT_REF;
  }

  /// @ts-expect-error - this is a hacky way to get the branch name
  const child_process = __non_webpack_require__("child_process");
  try {
    return child_process
      .execSync("git branch --show-current")
      .toString()
      .replace(/\n/g, "");
  } catch (e) {
    return;
  }
}

export const DEFAULT_NAMESPACE_NAME = "common";

export function isNamespaceObject(obj: LocaleKey | Record<string, LocaleKey>) {
  return (
    // empty object -> not a namespace because a localekey can be just an empty obj
    Object.keys(obj).length !== 0 &&
    Object.entries(obj).every(([, value]) => typeof value === "object")
  );
}
