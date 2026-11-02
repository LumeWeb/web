/** Serves the consumer page and its production-composition worker. */
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "@lumeweb/sia-video-source/testing/player",
      "@lumeweb/sia-video-source/testing/reader",
      "@lumeweb/sia-testing/client",
    ],
    // Late dependency discovery reloads an armed player and discards its worker.
    noDiscovery: true,
  },
  root: "tests/playback",
  server: { host: "127.0.0.1", port: 4193, strictPort: true },
});
