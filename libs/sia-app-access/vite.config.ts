/** Browser fixtures resolve access source without a package build. */
import { defineConfig } from "vite";
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "node_modules/.cache/browser-build",
    rollupOptions: {
      input: [
        "tests/browser/fixture.html",
        "tests/browser/react-observation.html",
        "tests/browser/react-components.html",
        "tests/browser/react-interactions.html",
        "tests/browser/react-task-hydration.html",
        "tests/browser/onboarding-races.html",
      ],
    },
  },
  resolve: { tsconfigPaths: true },
});
