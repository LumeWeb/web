import { Config, PLUGIN_TYPE } from "@lumeweb/portal-framework-core/vite";

import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  dir: config.dir,
  exposes: config.exposes,
  minifyMangle: false,
  name: config.name,
  sharedModules: sharedModules.getSharedModules(),
  type: PLUGIN_TYPE,
});
