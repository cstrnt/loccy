import { asConfig } from "@loccy/client";
import nextConfig from "./next.config.js";

export default asConfig({
  defaultLocale: nextConfig.i18n?.defaultLocale!,
  locales: nextConfig.i18n?.locales!,
  projectId: "cl8bo0vu2002709mh1je66z7f",
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
    "apiKeyAlert.body": {},
    revokeApikey: {
      description: "CTA used to revoke an api key",
    },
  },
});
