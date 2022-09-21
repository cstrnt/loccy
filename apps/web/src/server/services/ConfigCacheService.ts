import { LocaleFile } from "@loccy/shared";
import { BaseCacheService, redisInstance } from "./BaseCacheService";
import jsum from "jsum";

class ConfigCacheService extends BaseCacheService {
  constructor() {
    super(redisInstance, "config");
  }

  private getConfigKey(projectId: string, branchName: string) {
    return `${projectId}:${branchName}:configHash`;
  }

  async getFileHash(projectId: string, branchName: string) {
    return this.get(this.getConfigKey(projectId, branchName));
  }

  async setFileHash(projectId: string, branchName: string, hash: string) {
    return this.set(this.getConfigKey(projectId, branchName), hash);
  }
}

export const configCacheService = new ConfigCacheService();
