/** Serves the consumer page and its production-composition worker. */
import { defineConfig } from "vite";

export default defineConfig({
  root: "tests/playback",
  server: { host: "127.0.0.1", port: 4193, strictPort: true },
});
