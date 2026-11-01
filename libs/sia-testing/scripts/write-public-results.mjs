/**
 * Writes the CI artifact that is safe to publish. Only recognized suite outcomes
 * are accepted; missing or unexpected values become unknown instead of carrying
 * arbitrary text into the artifact.
 *
 * Private SDK logs and recovery credentials are never read. The output directory
 * is replaced so a failed or skipped suite cannot inherit an earlier summary.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const output = join(process.cwd(), "public-real-results");
await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
const outcomes = new Set(["cancelled", "failure", "skipped", "success"]);
const suites = Object.fromEntries(
  ["browser", "metadata", "native"].map((suite) => {
    const value = process.env[`SIA_RESULT_${suite.toUpperCase()}`];
    return [suite, outcomes.has(value) ? value : "unknown"];
  }),
);
await writeFile(
  join(output, "summary.json"),
  `${JSON.stringify({ schema: 1, suites }, null, 2)}\n`,
);
