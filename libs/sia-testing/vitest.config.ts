import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/{fixtures,model,msw,http,package,harness}/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "native-helpers",
          include: ["tests/sdk/native/helpers.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "native-control",
          include: ["tests/sdk/native/{hosts,events}.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
