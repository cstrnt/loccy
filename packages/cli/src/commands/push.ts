import {
  DEFAULT_FILE_NAME,
  getLoccyRemoteUrl,
  localeFileSchema,
} from "@loccy/shared";
import chalk from "chalk";
import { Command } from "commander";
import { build } from "esbuild";
import fs from "fs/promises";
import path from "path";
import { getBranchName } from "@loccy/shared/dist/server";
import { fetch } from "undici";

export const pushCommand = new Command("push")
  .description("Push your current loccy config")
  .option("-f, --file <string>", "path to loccy config file")
  .requiredOption("-t, --token <string>", "your loccy auth token")
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

      const branchName = await getBranchName();

      // TODO: add overview of changed data -> Added, updated, deleted keys and values
      await fetch(`${getLoccyRemoteUrl()}/api/config/push`, {
        method: "POST",
        body: JSON.stringify({ ...config, branchName }),
        headers: {
          "Content-Type": "application/json",
          Authorization: options.token,
        },
      });
      console.log(chalk.green("Push Complete"));
    } catch (e) {
      console.error(e);
      console.log(chalk.red("Invalid Config File"));
    } finally {
      try {
        await fs.stat(tempFilePath);
        await fs.unlink(tempFilePath);
      } catch (e) {}
    }
  });
