/** Serves the SDK-owned streaming worker with the real-SDK check's page. */
import { siaStorage } from "@siafoundation/sia-storage/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: { emptyOutDir: true, outDir: "../../dist-contract" },
  plugins: [siaStorage()],
  root: "tests/contract",
  server: { host: "127.0.0.1", port: 4194, strictPort: true },
});
