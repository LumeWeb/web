/** Checks copied playback startup without opening a browser or a server. */
import { spawnSync } from "node:child_process";
import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";
import { withTemporaryDirectory } from "../../scripts/workspace.mjs";

it("runs playback startup without invoking the retired live command", async () => {
  await withTemporaryDirectory("sia-consumer-build-test-", async (root) => {
    await writeFile(join(root, "package.json"), '{"type":"module"}');
    await cp(
      "scripts/package-consumer/playback-build.mjs.fixture",
      join(root, "check-build.mjs"),
    );
    const command = `${JSON.stringify(process.execPath)} -e ${JSON.stringify(
      "require('node:fs').writeFileSync('started', 'playback')",
    )}`;
    await writeFile(
      join(root, "playwright.mock.config.ts"),
      `export default { webServer: { command: ${JSON.stringify(command)} } };`,
    );
    await writeFile(
      join(root, "playwright.e2e.config.ts"),
      `export default { webServer: { command: ${JSON.stringify(
        `${JSON.stringify(process.execPath)} -e "throw Error('retired live startup')"`,
      )} } };`,
    );
    const result = spawnSync(process.execPath, ["check-build.mjs"], {
      cwd: root,
      encoding: "utf8",
      timeout: 10_000,
    });
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
    expect(await readFile(join(root, "started"), "utf8")).toBe("playback");
  });
});
