import { defineConfig } from "vitest/config";
import path from "path";

const pnpmDir = path.resolve(__dirname, "../../node_modules/.pnpm");
const reactTableEntry = pnpmDir
  ? fs.readdirSync(pnpmDir).find((e) => e.startsWith("@refinedev+react-table@"))
  : null;
const reactTablePath = reactTableEntry
  ? path.resolve(pnpmDir, reactTableEntry, "node_modules/@refinedev/react-table/dist/index.cjs")
  : "";

import fs from "fs";

export default defineConfig({
  test: {
    name: "node",
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    setupFiles: ["./src/__tests__/setup.node.ts"],
    environment: "happy-dom",
    passWithNoTests: true,
    deps: {
      inline: [/@refinedev\/react-table/],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lodash/isEqual": path.resolve(
        __dirname,
        "./src/__tests__/mocks/lodash-isEqual.ts",
      ),
      "@refinedev/react-table": reactTablePath,
      "@lumeweb/portal-framework-auth": path.resolve(
        __dirname,
        "../portal-framework-auth/dist/esm/index.js",
      ),
      "@lumeweb/portal-framework-core": path.resolve(
        __dirname,
        "../portal-framework-core/dist/esm/index.js",
      ),
      "@lumeweb/portal-framework-ui": path.resolve(
        __dirname,
        "../portal-framework-ui/dist/esm/index.js",
      ),
      "@lumeweb/portal-framework-ui-core": path.resolve(
        __dirname,
        "../portal-framework-ui-core/dist/esm/index.js",
      ),
      "@lumeweb/portal-plugin-quota": path.resolve(
        __dirname,
        "../portal-plugin-quota/lib-dist/index.js",
      ),
    },
  },
});
