/** Serves only the consumer-owned page and the SDK streaming worker. */
import { defineConfig } from "vite";
import { siaStorage } from "@siafoundation/sia-storage/vite";
export default defineConfig({
  build: { emptyOutDir: true, outDir: "../../dist-e2e" },
  plugins: [siaStorage()],
  root: "tests/e2e",
  server: { host: "127.0.0.1", port: 4193, strictPort: true },
});
