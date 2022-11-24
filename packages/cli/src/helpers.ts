import glob from "fast-glob";
import path from "path";

export function isNext18NextProject(rootFileNames: string[]) {
  return rootFileNames.includes("next-i18next.config.js");
}

export async function readLocales(
  filePath: string,
  locales: string[],
  defaultLocale: string
) {
  // 1. get all locales +
  // 2. get all .json files for each locale (each file -> namespace)
  // 3. get all keys from defaultLocale +
  const files = await Promise.all(
    locales.map((locale) => glob(`${filePath}/${locale}/*.json`))
  );

  const localeMap = files.reduce((acc, files, index) => {
    const locale = locales[index];
    acc[locale] = files;
    return acc;
  }, {} as Record<string, string[]>);

  const defaultLocaleFiles = localeMap[defaultLocale];

  const defaultLocaleKeys = defaultLocaleFiles
    .map((file) => ({
      namespace: path.basename(file, ".json"),
      keys: Object.entries(require(file)),
    }))
    .flatMap((locale) =>
      locale.keys.flatMap(([key, value]) => {
        if (typeof value === "string") {
          return { namespace: locale.namespace, key };
        }
        if (typeof value === "object") {
          return Object.keys(value as Record<string, string>).map((subKey) => ({
            namespace: locale.namespace,
            key: `${key}.${subKey}`,
          }));
        }
        return [];
      })
    );

  const translations = locales.flatMap((locale) => {
    const files = localeMap[locale];
    return files.map((file) => ({
      locale,
      namespace: path.basename(file, ".json"),
      data: toDotNotationObject(require(file)),
    }));
  });

  return { defaultLocaleKeys, translations };
}

export function toDotNotationObject(obj: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      const flatObject = toDotNotationObject(obj[key]);
      for (const x in flatObject) {
        result[key + "." + x] = flatObject[x];
      }
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}
