import "next-i18next";
import loccyConfig from "./loccy.config";
import { inferLocales } from "@loccy/next-i18next";

declare module "next-i18next" {
  interface Resources extends inferLocales<typeof loccyConfig> {}
  // interface Resources {
  //   common: {
  //     name: string;
  //   };
  //   home: {
  //     title: string;
  //   };
  // }
}
