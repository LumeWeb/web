import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:template",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./dashboard": "./src/ui/routes/dashboard",
    "./settings": "./src/ui/routes/settings",
  },
} satisfies PluginConfig;