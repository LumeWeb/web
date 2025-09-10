import { Config } from "@lumeweb/portal-framework-core/vite";

import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  devPort: 4175,
  dir: config.dir,
  entryFile: "src/plugin.ts",
  exposes: config.exposes,
  name: config.name,
  sharedModules: sharedModules.getSharedModules(),
  type: "plugin",
});
