import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:admin",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./Dashboard": "./src/ui/routes/dashboard",
    "./Index": "./src/ui/routes/index",
    "./Login": "./src/ui/routes/login",
  },
} satisfies PluginConfig;
