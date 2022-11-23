import io, { Redis } from "ioredis";
import { env } from "~/utils/env";

export const redisInstance = new io({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
});

export abstract class BaseCacheService {
  constructor(private client: Redis, private prefix?: string) {}

  private getKey(key: string) {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  get(key: string) {
    return this.client.get(this.getKey(key));
  }

  set(key: string, value: string) {
    return this.client.set(this.getKey(key), value);
  }
}
