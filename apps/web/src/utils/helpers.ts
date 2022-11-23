import { LocaleKey } from "@prisma/client";

export function groupTranslationsByNS(
  translations: LocaleKey[]
): Record<string, LocaleKey[]> {
  return translations.reduce((acc, translation) => {
    const ns = translation.namespace;

    acc[ns] ??= [];
    acc[ns]!.push(translation);

    return acc;
  }, {} as Record<string, LocaleKey[]>);
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
