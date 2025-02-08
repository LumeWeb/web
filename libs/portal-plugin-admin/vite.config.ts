import { Config } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default Config({
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./Dashboard": "./src/ui/routes/dashboard",
    "./Index": "./src/ui/routes/index",
    "./Login": "./src/ui/routes/login",
  },
  name: "core:admin",
  sharedModules: sharedModules.getSharedModules(),
});
