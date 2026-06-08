import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:onboarding",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./widgets/onboarding/checklist": "./src/ui/widgets/onboarding/checklist",
  },
} satisfies PluginConfig;
