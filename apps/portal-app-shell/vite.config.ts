import { Config } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.VITE_PORTAL_APP_NAME) {
  throw new Error(
    "Missing required environment variable: VITE_PORTAL_APP_NAME",
  );
}

export default Config({
  dir: __dirname,
  name: process.env.VITE_PORTAL_APP_NAME,
  pluginRegistryConfigFile: "plugin.config.json",
  portalServer: process.env.PORTAL_SERVER,
  sharedModules: sharedModules.getSharedModules(),
  type: "host",
});
