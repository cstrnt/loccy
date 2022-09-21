import { asConfig } from "@loccy/client";
import { ApiKeyAlert } from "~/components/ApiKeyAlert.jsx";
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
    close: {},
    documentation: {},
    saved: {
      description: "Message that is shown when a locale is saved",
    },
    apiKeyRevokeSuccess: {},
    localeSaveError: {},
    selectLocale: {},
    createApiKey: {
      description: "CTA used to create a new api key",
    },
    "apiKeyAlert.copied": {},
    "ApiKeyAlert.body": {},
    revokeApikey: {
      description: "CTA used to revoke an api key",
    },
  },
});
