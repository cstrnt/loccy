import { LoccyOptions } from "./index";

declare module "i18next" {
  interface PluginOptions {
    backend?: LoccyOptions;
  }
}
