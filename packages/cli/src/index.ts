#!/usr/bin/env node
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import { program } from "commander";
import path from "path";
import { fetch } from "undici";
import { DEFAULT_FILE_NAME, localeFileSchema } from "@loccy/shared";

clear();
console.log(chalk.red(figlet.textSync("loccy", { horizontalLayout: "full" })));

program.name("loccy").description("The offical loccy cli").version("0.0.1");

program
  .command("sync")
  .description("Sync your current loccy config")
  .option("-f, --file <string>", "path to loccy config file")
  .option("-t, --token <string>", "your loccy auth token")
  .action(async (options: { token?: string; file?: string }) => {
    console.log(options.file, options.token);
    try {
      const data = (
        await import(
          path.join(process.cwd(), options.file || DEFAULT_FILE_NAME)
        )
      ).default;
      const config = await localeFileSchema.parseAsync(data);
      const { status } = await fetch("http://localhost:3000/api/config/push", {
        method: "POST",
        body: JSON.stringify(config),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(status);
    } catch (e) {
      console.error(e);
      console.log(chalk.red("Invalid Config File"));
    }
  });

program.parse();
