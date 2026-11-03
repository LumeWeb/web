/** Documentation checks reject missing shipped pages and incomplete executable recipes. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
