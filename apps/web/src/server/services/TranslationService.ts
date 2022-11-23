import { SourceLanguageCode, TargetLanguageCode, Translator } from "deepl-node";
import { env } from "~/utils/env";
import { translationCacheService } from "./cache/TranslationCacheService";

class TranslationService {
  private translator: Translator;
  constructor() {
    this.translator = new Translator(env.DEEPL_API_KEY);
  }

  private getVarsFromText(text: string) {
    return Array.from(text.matchAll(/(\{.+?\})/g))
      .map(([el]) => el)
      .filter(Boolean) as string[];
  }
  private replacePlaceholders(text: string, vars: string[]) {
    return vars.reduce(
      (acc, cur, index) => acc.replace(cur, `_${index}_`),
      text
    );
  }

  private getText(text: string, vars: string[]) {
    return vars.reduce(
      (acc, cur, index) => acc.replace(`_${index}_`, cur),
      text
    );
  }
  async translate(
    text: string,
    sourceLang: string,
    targetLanguage: string
  ): Promise<string> {
    const textVars = this.getVarsFromText(text);

    const encodedText = this.replacePlaceholders(text, textVars);

    const cachedTranslation = await translationCacheService.getTranslation(
      text,
      sourceLang,
      targetLanguage
    );

    if (cachedTranslation) {
      return cachedTranslation;
    }

    const result = await this.translator.translateText(
      encodedText,
      sourceLang as SourceLanguageCode,
      targetLanguage as TargetLanguageCode,
      {
        formality: "prefer_less",
      }
    );

    const decodedText = this.getText(result.text, textVars);

    await translationCacheService.setTranslation(
      text,
      sourceLang,
      targetLanguage,
      decodedText
    );

    return decodedText;
  }
}

export const translationService = new TranslationService();
