import { Config, PLUGIN_TYPE } from "@lumeweb/portal-framework-core/vite";

import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  devPort: 4177,
  dir: config.dir,
  exposes: config.exposes,
  name: config.name,
  sharedModules: sharedModules.getSharedModules(),
  type: PLUGIN_TYPE,
  minifyMangle: false,
});
