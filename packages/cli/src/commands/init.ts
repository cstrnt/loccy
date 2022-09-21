import { Command } from "commander";
import chalk from "chalk";
import fs from "fs/promises";
import {
  LocaleFile,
  DEFAULT_FILE_NAME,
  getLoccyRemoteUrl,
} from "@loccy/shared";
import { fetch } from "undici";

async function createLoccyConfig(
  config: Pick<LocaleFile, "locales" | "defaultLocale" | "projectId">
) {
  const fileContent = `import { asConfig } from "@loccy/shared";
  export default asConfig(${JSON.stringify({ ...config, keys: {} }, null, 2)});
  `;

  await fs.writeFile(DEFAULT_FILE_NAME, fileContent);
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
    await createLoccyConfig({
      projectId,
      defaultLocale: "",
      locales: [],
    });
  });
