import { Config, PLUGIN_TYPE } from "@lumeweb/portal-framework-core/vite";

import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  dir: config.dir,
  entryFile: "src/index.ts",
  exposes: config.exposes,
  name: config.name,
  sharedModules: sharedModules.getSharedModules(),
  type: PLUGIN_TYPE,
});