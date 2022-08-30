import { createI18n } from "next-international";
import { generateLocales, inferLocales } from "@loccy/client";
import Config from "../loccy.config.mjs";

export const {
  useI18n,
  I18nProvider,
  useChangeLocale,
  defineLocale,
  getLocaleProps,
} = createI18n<inferLocales<typeof Config>>(generateLocales(Config));
