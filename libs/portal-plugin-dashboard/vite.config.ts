import { Config } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default Config({
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./Account": "./src/ui/routes/Account",
    "./AccountLayout": "./src/ui/routes/AccountLayout",
    "./AccountVerify": "./src/ui/routes/AccountVerify",
    "./ApiKeys": "./src/ui/routes/ApiKeys",
    "./Dashboard": "./src/ui/routes/Dashboard",
    "./Index": "./src/ui/routes/Index",
    "./LoginIndex": "./src/ui/routes/LoginIndex",
    "./NotFound": "./src/ui/routes/NotFound",
    "./RegisterIndex": "./src/ui/routes/RegisterIndex",
    "./ResetPasswordConfirm": "./src/ui/routes/ResetPasswordConfirm",
    "./ResetPasswordLayout": "./src/ui/routes/ResetPasswordLayout",
    "./ResetPasswordReset": "./src/ui/routes/ResetPasswordReset",
    "./Security": "./src/ui/routes/Security",
    "./UploadsIndex": "./src/ui/routes/UploadsIndex",
  },
  name: "core:dashboard",
  sharedModules: sharedModules.getSharedModules(),
});
