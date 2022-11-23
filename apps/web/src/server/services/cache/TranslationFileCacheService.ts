import { BaseCacheService, redisInstance } from "./BaseCacheService";

export class TranslationFileCacheService extends BaseCacheService {
  constructor() {
    super(redisInstance, "translation");
  }

  private getCacheKey(
    projectId: string,
    branchName: string,
    locale: string,
    namespace: string
  ) {
    return `${projectId}:${branchName}:${locale}:${namespace}`;
  }

  async getTranslations(
    projectId: string,
    branchName: string,
    locale: string,
    namespace: string
  ) {
    return this.get(this.getCacheKey(projectId, branchName, locale, namespace));
  }

  async setTranslations(
    projectId: string,
    branchName: string,
    locale: string,
    namespace: string,
    translations: string
  ) {
    return this.set(
      this.getCacheKey(projectId, branchName, locale, namespace),
      translations
    );
  }

  async updateTranslationKey(
    projectId: string,
    branchName: string,
    locale: string,
    key: string,
    newValue: string,
    namespace: string
  ) {
    const translations = await this.getTranslations(
      projectId,
      branchName,
      locale,
      namespace
    );

    if (!translations) return;
    const parsedTranslations = JSON.parse(translations);
    parsedTranslations[key] = newValue;
    return this.setTranslations(
      projectId,
      branchName,
      locale,
      namespace,
      JSON.stringify(parsedTranslations)
    );
  }
}

export const translationFileCacheService = new TranslationFileCacheService();
