import { LocaleFile } from '@loccy/shared';
export { asConfig, inferLocales } from '@loccy/shared';

declare function generateLocales(config: LocaleFile): Record<string, any>;

export { generateLocales };
