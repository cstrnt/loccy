// @ts-check
const loccyConfig = require("./loccy.config").default;
const LoccyBackend = require("@loccy/next-i18next").default;

module.exports = {
  debug: process.env.NODE_ENV === "development",
  use: [LoccyBackend],
  ...LoccyBackend.getRequiredOptions({
    ...loccyConfig,
    loccyRemoteUrl:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : undefined,
  }),
  reloadOnPrerender: true,
};
