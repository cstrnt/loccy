// @ts-check
import { asConfig } from "@loccy/next-i18next";

export default asConfig({
  projectId: "clagxvo6200279jmfx2b8znzo",
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
      title: {
        description: "The title of the home page",
      },
      description: {
        description: "The description of the home page",
      },
    },
  },
});
