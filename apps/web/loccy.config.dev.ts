import { asConfig } from "@loccy/client";
import nextConfig from "./next.config.js";

export default asConfig({
  defaultLocale: nextConfig.i18n?.defaultLocale!,
  locales: nextConfig.i18n?.locales!,
  projectId: "cl77hcrg20357f3mf0fbhzuft",
  keys: {
    justMyBranch: {
      description: "Translations Heading",
    },
  },
});
