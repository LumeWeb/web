import { Config, PLUGIN_TYPE } from "@lumeweb/portal-framework-core/vite";
import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  dir: config.dir,
  name: config.name,
  type: PLUGIN_TYPE,
  exposes: config.exposes,
  sharedModules: sharedModules.getSharedModules(),
});
