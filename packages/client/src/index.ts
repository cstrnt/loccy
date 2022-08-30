import type { LocaleFile } from "@loccy/shared";
export { inferLocales, asConfig } from "@loccy/shared";

export function generateLocales(config: LocaleFile) {
  return config.locales.reduce<Record<string, any>>((acc, localeKey) => {
    acc[localeKey] = () =>
      fetch(
        // TODO: add branch name to path
        `http://localhost:3000/api/locales/${config.projectId}/${localeKey}`
      )
        .then((r) => r.json())
        .then((e) => ({ default: e }));
    return acc;
  }, {});
}
