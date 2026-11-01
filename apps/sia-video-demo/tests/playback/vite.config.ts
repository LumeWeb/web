/** Serves the production demo entry; playback fixtures replace only its worker SDK factory. */
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import applicationConfig from "../../vite.config";

const workerEntry = fileURLToPath(
  import.meta.resolve("@lumeweb/sia-video-source/worker"),
);
const fixtureWorker = fileURLToPath(new URL("./worker.ts", import.meta.url));

function payloadWorker(): Plugin {
  return {
    enforce: "pre",
    load(id) {
      if (id.split("?")[0] === workerEntry)
        return `import ${JSON.stringify(fixtureWorker)};`;
    },
    name: "demo-payload-worker",
  };
}

export default defineConfig((environment) => {
  return mergeConfig(applicationConfig(environment), {
    build: { outDir: "dist-playback" },
    plugins: [payloadWorker()],
    server: {
      forwardConsole: false,
      host: "127.0.0.1",
      port: 4195,
      strictPort: true,
    },
    worker: { plugins: () => [payloadWorker()] },
  });
});
