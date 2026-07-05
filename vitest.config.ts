import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    projects: [
      path.join(__dirname, "libs/*/vitest.config.{e2e,unit}.ts"),
      path.join(__dirname, "apps/*/vitest.config.{e2e,unit}.ts"),
    ],
  },
});
