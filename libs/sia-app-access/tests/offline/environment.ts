import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { findPackageJSON, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import type { TestContext } from "node:test";

export enum Facade {
  Absent = "absent",
  Browser = "browser",
  Node = "node",
}
interface EnvironmentOptions {
  readonly facade: Facade;
  readonly failAsset?: boolean;
}

// SDK 0.2.0 lists Node before browser. Select its declared browser facade explicitly;
// --conditions=browser alone still selects Node. All remaining layout assumptions live here.
export function sdkEnvironment(t: TestContext, options: EnvironmentOptions) {
  const manifestPath = findPackageJSON(
    "@siafoundation/sia-storage",
    import.meta.url,
  );
  assert.ok(manifestPath, "Installed SDK package metadata is required");
  const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.ok(manifest && typeof manifest === "object" && "version" in manifest);
  assert.ok(
    "exports" in manifest &&
      manifest.exports &&
      typeof manifest.exports === "object",
  );
  const entries = manifest.exports;
  assert.ok("." in entries && entries["."] && typeof entries["."] === "object");
  const root = entries["."];
  assert.ok(
    "browser" in root && root.browser && typeof root.browser === "object",
  );
  assert.ok(
    "default" in root.browser && typeof root.browser.default === "string",
  );
  assert.equal(
    manifest.version,
    "0.2.0",
    "Review fixture layout for a new SDK version",
  );
  assert.equal(root.browser.default, "./dist/index.js");
  assert.equal(
    "./wasm" in entries ? entries["./wasm"] : undefined,
    "./wasm/sia_storage_wasm.js",
  );
  assert.equal(
    "./wasm/*" in entries ? entries["./wasm/*"] : undefined,
    "./wasm/*",
  );
  const base = pathToFileURL(realpathSync(manifestPath));
  const browser = new URL(root.browser.default, base).href;
  const asset = new URL("./wasm/sia_storage_wasm_bg.wasm", base);
  const bytes = readFileSync(asset);
  let loads = 0;
  let failAsset = options.failAsset ?? false;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (specifier === "@siafoundation/sia-storage") {
        if (options.facade === Facade.Absent)
          throw Error("simulated missing native addon");
        if (options.facade === Facade.Browser)
          return { shortCircuit: true, url: browser };
      }
      return next(specifier, context);
    },
  });
  t.after(() => hooks.deregister());
  t.mock.method(globalThis, "fetch", async (input: Request | string | URL) => {
    assert.equal(
      input instanceof Request ? input.url : String(input),
      asset.href,
      "Unexpected asset request; network is forbidden",
    );
    loads++;
    if (failAsset) {
      await barrier;
      throw Error("offline asset failure");
    }
    return new Response(bytes, {
      headers: { "Content-Type": "application/wasm" },
    });
  });
  return {
    set failAsset(value: boolean) {
      failAsset = value;
    },
    get loads() {
      return loads;
    },
    releaseFailure() {
      release();
    },
  };
}
