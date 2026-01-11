import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./devices": "./src/ui/routes/devices",
    "./streams": "./src/ui/routes/streams",
  },
  name: "core:lbry",
} satisfies PluginConfig;
