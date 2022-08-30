import { str, envsafe, port, url } from "envsafe";

export const env = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }),
  ENCRYPTION_SECRET: str({
    desc: "The port the app is running on",
  }),
});
