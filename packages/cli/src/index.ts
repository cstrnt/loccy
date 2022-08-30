#!/usr/bin/env node
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import { program } from "commander";
import path from "path";
import fs from "fs/promises";
import { fetch } from "undici";
import {
  DEFAULT_FILE_NAME,
  localeFileSchema,
  getLoccyRemoteUrl,
} from "@loccy/shared";
import { transformFile } from "@swc/core";
import { build } from "esbuild";

clear();
console.log(chalk.red(figlet.textSync("loccy", { horizontalLayout: "full" })));

program.name("loccy").description("The offical loccy cli").version("0.0.1");

program
  .command("sync")
  .description("Sync your current loccy config")
  .option("-f, --file <string>", "path to loccy config file")
  .option("-t, --token <string>", "your loccy auth token")
  .action(async (options: { token?: string; file?: string }) => {
    if (!options.token) {
      chalk.redBright("Invalid Token");
      return;
    }

    const filePath = path.resolve(
      options.file ?? path.join(process.cwd(), DEFAULT_FILE_NAME)
    );

    // create a temp file in node_modules
    const tempFilePath = path.join(
      path.dirname(filePath),
      "node_modules",
      "@loccy/client",
      "loccy.config.js"
    );

    try {
      await build({
        bundle: true,
        entryPoints: [filePath],
        outfile: tempFilePath,
        platform: "node",
        target: "node12",
      });

      const data = require(tempFilePath).default;

      const config = await localeFileSchema.parseAsync(data);
      const { status } = await fetch(`${getLoccyRemoteUrl()}/api/config/push`, {
        method: "POST",
        body: JSON.stringify(config),
        headers: {
          "Content-Type": "application/json",
          Authorization: options.token,
        },
      });
      console.log(status);
    } catch (e) {
      console.error(e);
      console.log(chalk.red("Invalid Config File"));
    } finally {
      await fs.unlink(tempFilePath);
    }
  });

program.parse();
