import { exec } from "child_process";

export async function getBranchName() {
  return new Promise<string>((resolve, reject) => {
    exec("git branch --show-current", (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout.trim().replace(/\n/g, ""));
    });
  });
}
