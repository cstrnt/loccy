import { asConfig } from "@loccy/client";

export default asConfig({
  defaultLocale: "en",
  locales: ["en", "de"],
  projectId: "cl8ctopzn003009mm306vq6t1",
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
