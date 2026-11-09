/** Separate Vite projects must not overwrite each other's optimized dependency files. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

void test("the example and library fixtures use separate dependency caches", async () => {
  const library = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
  });
  try {
    const example = await createServer({
      root: fileURLToPath(
        new URL("../examples/react-onboarding/", import.meta.url),
      ),
    });
    try {
      assert.notEqual(example.config.cacheDir, library.config.cacheDir);
    } finally {
      await example.close();
    }
  } finally {
    await library.close();
  }
});
