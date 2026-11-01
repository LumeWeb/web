/** Live collection requires private inputs and explicit approval; importing the config alone never opens a connection. */
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { authorizeContractRun, readContractFile } from "./config.ts";

const checkout = fileURLToPath(new URL("../../../../", import.meta.url));
const commonGit = execFileSync(
  "git",
  ["rev-parse", "--path-format=absolute", "--git-common-dir"],
  { cwd: checkout, encoding: "utf8" },
).trim();
const path = process.env.SIA_VIDEO_CONTRACT_FILE;
if (!path) throw new Error("A private contract fixture file is required");
export const contract = await readContractFile(path, [
  checkout,
  dirname(commonGit),
]);
authorizeContractRun(contract, process.env);
