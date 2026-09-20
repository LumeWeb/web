import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./sites": "./src/ui/routes/sites",
    "./sites/new": "./src/ui/routes/sites.new",
    "./sites/workspace": "./src/ui/routes/sites.workspace",
  },
  name: "core:ipfs",
} satisfies PluginConfig;
