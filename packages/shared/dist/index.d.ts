import { z } from 'zod';

declare const localeFileSchema: z.ZodObject<{
    projectId: z.ZodString;
    locales: z.ZodArray<z.ZodString, "many">;
    defaultLocale: z.ZodString;
    keys: z.ZodObject<{}, "strip", z.ZodObject<{
        description: z.ZodOptional<z.ZodString>;
        params: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodString, {
            [x: string]: string;
        }, {
            [x: string]: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        params?: {
            [x: string]: string;
        } | undefined;
        description?: string | undefined;
    }, {
        params?: {
            [x: string]: string;
        } | undefined;
        description?: string | undefined;
    }>, {
        [x: string]: {
            params?: {
                [x: string]: string;
            } | undefined;
            description?: string | undefined;
        };
    }, {
        [x: string]: {
            params?: {
                [x: string]: string;
            } | undefined;
            description?: string | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    locales: string[];
    keys: {
        [x: string]: {
            params?: {
                [x: string]: string;
            } | undefined;
            description?: string | undefined;
        };
    };
    defaultLocale: string;
}, {
    projectId: string;
    locales: string[];
    keys: {
        [x: string]: {
            params?: {
                [x: string]: string;
            } | undefined;
            description?: string | undefined;
        };
    };
    defaultLocale: string;
}>;
declare type LocaleFile = z.infer<typeof localeFileSchema>;
declare type inferLocales<T extends LocaleFile> = {
    [K in keyof T["keys"]]: `{${keyof T["keys"][K]["params"] extends infer Keyname extends string ? Keyname : never}}`;
};
declare const asConfig: <T extends {
    projectId: string;
    locales: string[];
    keys: {
        [x: string]: {
            params?: {
                [x: string]: string;
            } | undefined;
            description?: string | undefined;
        };
    };
    defaultLocale: string;
}>(config: T) => T;
declare const DEFAULT_FILE_NAME = "loccy.config.mjs";

export { DEFAULT_FILE_NAME, LocaleFile, asConfig, inferLocales, localeFileSchema };
