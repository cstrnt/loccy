import {
  DEFAULT_FILE_NAME,
  getLoccyRemoteUrl,
  LocaleFile,
  localeFileSchema,
} from "@loccy/shared";
import chalk from "chalk";
import { Command } from "commander";
import { build } from "esbuild";
import fs from "fs/promises";
import path from "path";
import { getBranchName } from "@loccy/shared";
import { fetch } from "undici";
import jsum from "jsum";
import { deepmergeCustom } from "deepmerge-ts";

const getConfigRegexp = /asConfig\(([\s\S]*)\)/gm;

const customDeepMerge = deepmergeCustom({
  mergeArrays: ([a, b]) => b,
});

export const pullCommand = new Command("pull")
  .description("Pull from remote")
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

      const res = await fetch(
        `${getLoccyRemoteUrl()}/api/config/pull?branchName=${branchName}`,
        {
          headers: {
            Authorization: options.token,
          },
        }
      );

      if (!res.ok) {
        console.log(chalk.redBright("Error pulling config"));
        return;
      }

      const body = (await res.json()) as LocaleFile;

      const currentHash = jsum.digest(config, "SHA1", "hex");
      const incomingHash = jsum.digest(body, "SHA1", "hex");

      if (currentHash === incomingHash) {
        console.log(chalk.green("No changes to pull"));
        return;
      }

      const newConfig = customDeepMerge(config, body);
      const originalFileContent = await fs.readFile(filePath, "utf-8");

      await fs.writeFile(
        filePath,
        originalFileContent.replace(
          getConfigRegexp,
          `asConfig(${JSON.stringify(newConfig, null, 2)})`
        )
      );

      console.log(chalk.green("Pull Complete"));
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
