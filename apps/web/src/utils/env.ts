import { str, envsafe, port, url } from "envsafe";

export const env = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }),
  ENCRYPTION_SECRET: str({
    desc: "The port the app is running on",
  }),
  REDIS_HOST: str({
    desc: "The host of the redis server",
    devDefault: "localhost",
  }),
  REDIS_PORT: port({
    desc: "The port of the redis server",
    devDefault: 6379,
  }),
  REDIS_PASSWORD: str({
    desc: "The password of the redis server",
    allowEmpty: true,
    default: "",
  }),
  DEEPL_API_KEY: str({
    desc: "The API key for DeepL",
    allowEmpty: false,
  }),
  GOOGLE_CLIENT_ID: str({
    desc: "The client id for Google",
    allowEmpty: false,
  }),
  GOOGLE_CLIENT_SECRET: str({
    desc: "The client secret for Google",
    allowEmpty: false,
  }),
});
