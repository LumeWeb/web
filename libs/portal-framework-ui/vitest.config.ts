import react from "@vitejs/plugin-react";
import * as path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react() as any],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts", "fake-indexeddb/auto"],
  },
});
