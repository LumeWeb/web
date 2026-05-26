import { defineConfig } from "vitest/config";
import path from "path";

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
      "lodash/isEqual": path.resolve(__dirname, "./src/__tests__/mocks/lodash-isEqual.ts"),
      "@refinedev/react-table": path.resolve(
        __dirname,
        "../../node_modules/.pnpm/@refinedev+react-table@6.0.1_@refinedev+core@5.0.12_@tanstack+react-query@5.100.10_reac_6b2fa63708308f224bce6b91254105bc/node_modules/@refinedev/react-table/dist/index.cjs"
      ),
    },
  },
});
