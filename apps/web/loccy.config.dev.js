// @ts-check
import { asConfig } from "@loccy/next-international";

export default asConfig({
  projectId: "cl9kaa9ux0022t3mfk7d4q6f4",
  defaultLocale: "en",
  locales: ["en", "de"],
  keys: {
    "landing.title": {
      description: "The title of the landing page",
    },
    name: {
      description: "jeff",
      params: {
        name: "?",
      },
    },
    justMyBranch: {
      description: "Translations Heading :-)",
    },
    home: {
      test: {},
    },
  },
});
