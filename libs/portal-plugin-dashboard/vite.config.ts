import { Config } from "@lumeweb/portal-framework-core/vite";

import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  dir: config.dir,
  name: config.name,
  type: "plugin",
  devPort: 4175,
  exposes: config.exposes,
  sharedModules: sharedModules.getSharedModules(),
});
