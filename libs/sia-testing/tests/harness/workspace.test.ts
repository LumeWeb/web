import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, it } from "vitest";
import {
  linkDirectory,
  withTemporaryDirectory,
} from "../../scripts/workspace.mjs";

it("removes a temporary workspace after its callback finishes", async () => {
  let directory = "";
  const result = await withTemporaryDirectory(
    "sia-workspace-test-",
    async (path) => {
      directory = path;
      await writeFile(join(path, "result"), "data");
      return 42;
    },
  );
  expect(result).toBe(42);
  await expect(stat(directory)).rejects.toMatchObject({ code: "ENOENT" });
});

it("removes a temporary workspace when its callback rejects", async () => {
  let directory = "";
  const error = new Error("callback failed");
  await expect(
    withTemporaryDirectory("sia-workspace-test-", (path) => {
      directory = path;
      throw error;
    }),
  ).rejects.toBe(error);
  await expect(stat(directory)).rejects.toMatchObject({ code: "ENOENT" });
});

it("links a directory through a parent that does not exist yet", async () => {
  await withTemporaryDirectory("sia-workspace-test-", async (path) => {
    const source = join(path, "source");
    await mkdir(source);
    await writeFile(join(source, "value"), "linked data");
    const destination = join(path, "nested/target");
    await linkDirectory(source, destination);
    expect(await readFile(join(destination, "value"), "utf8")).toBe(
      "linked data",
    );
    await writeFile(join(destination, "value"), "updated data");
    expect(await readFile(join(source, "value"), "utf8")).toBe("updated data");
  });
});
