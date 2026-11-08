/** Browser fixtures resolve access source without a package build. */
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "node_modules/.cache/browser-build",
    rollupOptions: { input: "tests/browser/fixture.html" },
  },
  resolve: { tsconfigPaths: true },
});
