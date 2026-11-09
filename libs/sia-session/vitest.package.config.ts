/** Archive tests install emitted code outside the checkout. */
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    hookTimeout: 60000,
    include: ["tests/package/*.test.ts"],
    maxWorkers: 1,
    testTimeout: 60000,
  },
});
