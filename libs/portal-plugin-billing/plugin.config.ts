import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./account/subscription": "./src/ui/routes/account.subscription",
    "./account/credits": "./src/ui/routes/account.credits",
  },
  name: "core:billing",
} satisfies PluginConfig;
