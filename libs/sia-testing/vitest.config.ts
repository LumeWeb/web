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
      {
        test: {
          name: "real-host-fixtures",
          include: ["tests/e2e/native/host-fixtures.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "real-native-token-expiry",
          include: ["tests/e2e/native/token-expiry.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "real-native",
          include: ["tests/e2e/native/{payload,metadata,sharing,accounting,reference}.test.ts"],
          fileParallelism: false,
          environment: "node",
        },
      },
    ],
  },
});
