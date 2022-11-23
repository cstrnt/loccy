import { LocaleKey } from "@prisma/client";

export abstract class LocaleService {
  static isValidJSON(json: unknown): json is Record<string, string> {
    return typeof json === "object" && json !== null;
  }

  static isValidLocaleValue(newValue: string, keyDefinition: LocaleKey) {
    const allParams = Object.keys(keyDefinition.params ?? {});
    const missingParams: Array<string> = [];

    if (allParams.length === 0) {
      return {
        isValid: true,
        missingParams,
      };
    }
    allParams.forEach((param) => {
      const includesParam = newValue.includes(`{${param}}`);
      if (!includesParam) {
        missingParams.push(param);
      }
    });

    return {
      isValid: missingParams.length === 0,
      missingParams,
    };
  }

  static cleanLocaleKeyName(key: string): string {
    return key.replace(/\./g, "");
  }
}
