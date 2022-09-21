import { z } from "zod";

export const localeFileSchema = z.object({
  projectId: z.string(),
  locales: z.array(z.string()),
  defaultLocale: z.string(),
  keys: z.object({}).catchall(
    z.object({
      description: z.string().optional(),
      params: z.object({}).catchall(z.string()).optional(),
    })
  ),
});

export type LocaleFile = z.infer<typeof localeFileSchema>;

export type inferLocales<T extends LocaleFile> = {
  [K in keyof T["keys"]]: `{${keyof T["keys"][K]["params"] extends infer Keyname extends string
    ? Keyname
    : never}}`;
};

export const asConfig = <T extends LocaleFile>(config: T): T => config;

export const DEFAULT_FILE_NAME = "loccy.config.ts";

export const getLoccyRemoteUrl = () =>
  process.env.LOCCY_REMOTE_URL ?? "https://www.loccy.app";
