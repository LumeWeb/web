import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:core",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./NotFound": "./src/ui/routes/NotFound",
  },
} satisfies PluginConfig;
