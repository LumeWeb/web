import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

const resolveConfig = {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
};

export default defineConfig({
  test: {
    // Configure projects for different environments (isomorphic testing)
    projects: [
      // All .spec.ts tests run in Node.js environment (exclude browser/integration specific tests)
      {
        test: {
          name: "node",
          include: ["src/**/__tests__/*.spec.ts"],
          exclude: [
            "src/**/__tests__/*.browser.spec.ts",
            "src/**/__tests__/*.integration.browser.spec.ts",
          ],
          setupFiles: ["./src/__tests__/setup.node.ts"],
          environment: "node",
        },
        resolve: resolveConfig,
      },
      // All .browser.spec.ts and .integration.browser.spec.ts tests run in browser environment with MSW
      {
        test: {
          name: "browser",
          fileParallelism: false,
          include: [
            "src/**/__tests__/*.browser.spec.ts",
            "src/**/__tests__/*.integration.browser.spec.ts",
          ],

          setupFiles: ["./src/__tests__/setup.browser.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [
              {
                browser: "chromium",
                headless: true,
              },
            ],
          },
        },
        resolve: resolveConfig,
      },
    ],
  },
});
