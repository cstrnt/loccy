import { asConfig } from "@loccy/client";

export default asConfig({
  projectId: "cl7cyhkyr002209jtsjcm4nr0",
  locales: ["en", "de", "es"],
  defaultLocale: "en",
  keys: {
    "landing.title": {
      params: {
        name: "Some name",
      },
    },
    myName: {},
    myNameIs: {
      description: "Text used to display the user's name",
      params: {
        name: "Name",
      },
    },
  },
});
