import { exec } from "child_process";

const getBranch = () =>
  new Promise<string>((resolve, reject) => {
    return exec("git branch --show-current", (err, stdout, stderr) => {
      if (err) reject(`getBranch Error: ${err}`);
      else if (typeof stdout === "string") resolve(stdout.trim());
    });
  });

export { getBranch };
