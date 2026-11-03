/** Documentation checks reject missing shipped pages and incomplete executable recipes. */
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { checkDocumentation, recipes } from "../../scripts/documentation.mjs";

test("a packed README cannot link to an absent guide", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-doc-links-"));
  try {
    await writeFile(
      join(directory, "README.md"),
      "[Live runs](docs/live-runs.md)",
    );
    await expect(checkDocumentation(directory)).rejects.toThrow(
      "docs/live-runs.md",
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("every documented recipe must be selected for execution", () => {
  expect(() =>
    recipes("```ts recipe=unknown\nthrow new Error();\n```"),
  ).toThrow("unknown");
  expect(() => recipes("```ts recipe=ordinary\nconst value = 1;\n```")).toThrow(
    "fixture",
  );
});

test.each(["plain", "with spaces", "hash#and%percent", "unicode-é"])(
  "standalone documentation checks execute from %s paths",
  async (checkout) => {
    const directory = await mkdtemp(join(tmpdir(), "sia-doc-cli-"));
    try {
      const root = join(directory, checkout);
      const scripts = join(root, "scripts");
      await mkdir(scripts, { recursive: true });
      for (const file of [
        "check-vitest-docs.mjs",
        "documentation.mjs",
        "workspace.mjs",
      ])
        await cp(
          new URL(`../../scripts/${file}`, import.meta.url),
          join(scripts, file),
        );
      await writeFile(
        join(root, "package.json"),
        JSON.stringify({
          files: ["README.md"],
          name: "sia-doc-checker-fixture",
          private: true,
          type: "module",
          version: "0.0.0",
        }),
      );
      await writeFile(join(root, "README.md"), "[Missing guide](missing.md)");
      const child = spawnSync(
        process.execPath,
        [join(scripts, "check-vitest-docs.mjs")],
        {
          cwd: directory,
          encoding: "utf8",
          env: {
            ...process.env,
            NODE_OPTIONS: "",
            NODE_PATH: "",
            npm_config_cache: join(directory, "npm-cache"),
            npm_config_update_notifier: "false",
          },
          timeout: 15_000,
        },
      );
      expect(child.error).toBeUndefined();
      expect(child.signal).toBeNull();
      expect(child.status).toBe(1);
      expect(child.stderr).toContain(
        "Missing packed documentation: README.md: missing.md",
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  },
);

test("a relative Markdown link must name an existing heading", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sia-doc-heading-"));
  try {
    await writeFile(
      join(directory, "README.md"),
      "# Setup\n\n[Setup](README.md#missing)",
    );
    await expect(checkDocumentation(directory)).rejects.toThrow("#missing");
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
