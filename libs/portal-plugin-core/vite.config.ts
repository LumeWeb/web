import { Config } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default Config({
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./NotFound": "./src/ui/routes/NotFound",
  },
  name: "core:core",
  sharedModules: sharedModules.getSharedModules(),
});
