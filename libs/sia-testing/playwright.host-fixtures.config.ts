/** Requires separate database mutation consent before starting controlled browser host checks. */
import { defineConfig } from "@playwright/test";
import metadata from "./playwright.metadata.config.js";
import { readHostFixtureDatabase } from "./tests/e2e/support/host-fixture-database.js";

readHostFixtureDatabase();
export default defineConfig({
  ...metadata,
  testMatch: ["browser-host-fixtures.spec.ts"],
});
