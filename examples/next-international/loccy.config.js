// @ts-check
import { asConfig } from "@loccy/next-international";

export default asConfig({
  projectId: "cl8sgursb002230mf2qryd46s",
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
  },
});
