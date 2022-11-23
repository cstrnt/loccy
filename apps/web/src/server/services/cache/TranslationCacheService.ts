import { BaseCacheService, redisInstance } from "./BaseCacheService";

export class TranslationCacheService extends BaseCacheService {
  constructor() {
    super(redisInstance, "deeplTranslations");
  }

  private getCacheKey(input: string, sourceLang: string, targetLang: string) {
    return `${input}:${sourceLang}:${targetLang}`;
  }

  async getTranslation(input: string, sourceLang: string, targetLang: string) {
    return this.get(this.getCacheKey(input, sourceLang, targetLang));
  }

  async setTranslation(
    input: string,
    sourceLang: string,
    targetLang: string,
    translation: string
  ) {
    return this.set(
      this.getCacheKey(input, sourceLang, targetLang),
      translation
    );
  }
}

export const translationCacheService = new TranslationCacheService();
