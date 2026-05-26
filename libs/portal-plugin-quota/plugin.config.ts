import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:quota",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./widgets/quota": "./src/ui/widgets/quota",
  },
} satisfies PluginConfig;