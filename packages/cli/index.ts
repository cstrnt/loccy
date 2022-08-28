type LocaleFile<T extends string = string> = {
  locales: string[];
  defaultLocale?: string;
  keys: Record<string, Record<string, string>>;
};

function params<D extends { name: string }>(items: ReadonlyArray<D>) {
  return items.map((item) => item.name);
}

const asConfig = <T extends LocaleFile>(config: T): T => config;

const localeFile = asConfig({
  locales: ["en", "de"],
  defaultLocale: "en",
  keys: {
    a: {},
    b: {},
    c: {},
    "landing.title": { world: "", name: "tim" },
    lele: {},
  },
});

function stringLiteralArray<T extends string>(a: T[]) {
  return a;
}

type inferLocale<T extends LocaleFile> = {
  [K in keyof T["keys"]]: `{${keyof T["keys"][K] extends infer Keyname extends string
    ? Keyname
    : string}}`;
};

// function toLocaleType(config: LocaleFile) {
//   let file = "export type Locale = {\n";
//   Object.entries(config.keys).forEach(([key, value]) => {
//     if (value.length > 0) {
//       file += `  ${key}: \`${value.map((v) => `{${v}}`).join(" ")}\`;\n`;
//     } else {
//       file += `  ${key}: string;\n`;
//     }
//   });

//   file += "}";
//   return file;
// }

export type LLL = inferLocale<typeof localeFile>;

// const fileContent = toLocaleType(localeFile);
// console.log(fileContent);
