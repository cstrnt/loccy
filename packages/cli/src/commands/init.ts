import { Command } from "commander";
import chalk from "chalk";
import fs from "fs/promises";
import inquirer from "inquirer";
import { register } from "esbuild-register/dist/node";
import {
  LocaleFile,
  DEFAULT_FILE_NAME,
  getLoccyRemoteUrl,
} from "@loccy/shared";
import { fetch } from "undici";
import { isNext18NextProject, readLocales } from "../helpers";
import path from "path";

async function createLoccyConfig(
  config: Pick<LocaleFile, "locales" | "defaultLocale" | "projectId" | "keys">
) {
  const fileContent = `import { asConfig } from "@loccy/shared";
  export default asConfig(${JSON.stringify(config, null, 2)});
  `;

  await fs.writeFile(DEFAULT_FILE_NAME, fileContent);
  console.log(chalk.green("Config created"));
}

export const initCommand = new Command("init")
  .option("-t, --token <string>", "your loccy auth token")
  .action(async (options: { token?: string }) => {
    if (!options.token) {
      console.log(chalk.red("Your token is required"));
      return;
    }

    const res = await fetch(`${getLoccyRemoteUrl()}/api/config/getProject`, {
      headers: { authorization: options.token },
    });

    if (!res.ok) {
      console.log(chalk.red(`Error: Invalid Token`));
      return;
    }

    const projectId = ((await res.json()) as { id: string }).id;

    const rootFiles = await fs.readdir(process.cwd());
    if (isNext18NextProject(rootFiles)) {
      console.log(chalk.green("We found a next-i18next project!"));
      console.log(chalk.yellow("Do you want to migrate your data to loccy?"));
      const { migrate } = await inquirer.prompt([
        {
          type: "confirm",
          name: "migrate",
          message: "Migrate?",
          default: true,
        },
      ]);
      if (migrate) {
        const { translationPath } = await inquirer.prompt([
          {
            type: "input",
            name: "translationPath",
            message: "Where are your translations stored?",
            default: "public/locales",
          },
        ]);

        const { unregister } = register({
          target: "node12",
        });
        const config = (
          await import(path.join(process.cwd(), "next-i18next.config.js"))
        ).default as { i18n: { locales: string[]; defaultLocale: string } };

        const { defaultLocaleKeys, translations } = await readLocales(
          translationPath,
          config.i18n.locales,
          config.i18n.defaultLocale
        );

        const newConfig = {
          projectId,
          defaultLocale: config.i18n.defaultLocale,
          locales: config.i18n.locales,
          keys: defaultLocaleKeys.reduce((acc, { key, namespace }) => {
            acc[namespace] = acc[namespace] ?? {};
            // @ts-ignore
            acc[namespace][key] = {};
            return acc;
          }, {} as LocaleFile["keys"]),
        };
        await createLoccyConfig(newConfig);

        const res = await fetch(`${getLoccyRemoteUrl()}/api/config/push`, {
          method: "POST",
          body: JSON.stringify({ ...newConfig, branchName: "main" }),
          headers: {
            "Content-Type": "application/json",
            Authorization: options.token,
          },
        });

        console.log(res.status);

        await fetch(`${getLoccyRemoteUrl()}/api/translations/push`, {
          method: "POST",
          body: JSON.stringify(translations),
          headers: {
            "Content-Type": "application/json",
            Authorization: options.token,
          },
        });

        unregister();
      }
    } else {
      await createLoccyConfig({
        projectId,
        defaultLocale: "",
        locales: [],
        keys: {},
      });
    }
  });
