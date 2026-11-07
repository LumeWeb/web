/** Serves the demo with managed auth/read ports and synthetic native stream URLs. */
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig, type Plugin, searchForWorkspaceRoot } from "vite";
import applicationConfig from "../../vite.config";

const workerEntry = fileURLToPath(
  import.meta.resolve("@lumeweb/sia-video-source/worker"),
);
const fixtureWorker = fileURLToPath(new URL("./worker.ts", import.meta.url));
const fixtureBackend = fileURLToPath(new URL("./backend.ts", import.meta.url));
const phraseWasm = fileURLToPath(
  import.meta.resolve("@siafoundation/sia-storage/wasm/sia_storage_wasm_bg.wasm"),
);

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
    resolve: {
      alias: [
        {
          find: /^(?:.*\/)?storageBackend(?:\.ts)?$/,
          replacement: fixtureBackend,
        },
        {
          find: /^(?:.*\/)?streamService(?:\.ts)?$/,
          replacement: fileURLToPath(new URL("./nativeService.ts", import.meta.url)),
        },
      ],
    },
    server: {
      forwardConsole: false,
      // Linked dependencies can put the phrase parser outside the worktree.
      fs: {
        allow: [
          searchForWorkspaceRoot(fileURLToPath(new URL("../../", import.meta.url))),
          phraseWasm,
        ],
      },
      host: "127.0.0.1",
      port: 4195,
      strictPort: true,
    },
    worker: { plugins: () => [payloadWorker()] },
  });
});
