import { asConfig } from "@loccy/client";
import nextConfig from "./next.config.js";

export default asConfig({
  defaultLocale: nextConfig.i18n?.defaultLocale!,
  locales: nextConfig.i18n?.locales!,
  projectId: "cl7cyhkyr002209jtsjcm4nr0",
  keys: {
    translations: {
      description: "Translations Heading",
    },
    secrets: {
      description: "Secrets Heading",
    },
    settings: {},
    home: {},
    help: {},
    saved: {
      description: "Message that is shown when a locale is saved",
    },
    apiKeyRevokeSuccess: {},
    localeSaveError: {},
    createApiKey: {
      description: "CTA used to create a new api key",
    },
    revokeApikey: {
      description: "CTA used to revoke an api key",
    },
  },
});
