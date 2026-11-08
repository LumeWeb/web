/** Shared fixtures retain their declared native SDK without changing the access adapter's release. */
import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { findPackageJSON } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

void test("access and shared testing resolve their own supported SDK versions", () => {
  const testing = findPackageJSON("@lumeweb/sia-testing", import.meta.url);
  assert.ok(testing);
  assert.equal(sdkVersion(import.meta.url), "0.2.0");
  assert.equal(sdkVersion(pathToFileURL(realpathSync(testing)).href), "0.1.4");
});

function sdkVersion(base: string): string {
  const path = findPackageJSON("@siafoundation/sia-storage", base);
  assert.ok(path);
  const metadata: unknown = JSON.parse(readFileSync(path, "utf8"));
  assert.ok(metadata && typeof metadata === "object" && "version" in metadata);
  assert.ok(typeof metadata.version === "string");
  return metadata.version;
}
