import { Config, PLUGIN_TYPE } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default Config({
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./CaseAccess": "./src/ui/routes/case/access",
    "./CaseView": "./src/ui/routes/case/view",
    "./Index": "./src/ui/routes/index",
    "./Report": "./src/ui/routes/report",
    "./Layout": "./src/ui/routes/layout",
  },
  name: "core:abuse-report",
  sharedModules: sharedModules.getSharedModules(),
});
