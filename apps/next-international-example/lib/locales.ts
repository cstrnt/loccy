import { createI18n } from "next-international";
import { getConfig, inferLocales } from "@loccy/next-international";
import Config from "../loccy.config";

export const { useI18n, I18nProvider, getLocaleProps } = createI18n<
  inferLocales<typeof Config>
>(getConfig({ ...Config, loccyRemoteUrl: "http://localhost:3000" }));
