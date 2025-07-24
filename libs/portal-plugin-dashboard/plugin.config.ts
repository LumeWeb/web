import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:dashboard",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./Account": "./src/ui/routes/Account",
    "./AccountVerify": "./src/ui/routes/AccountVerify",
    "./Dashboard": "./src/ui/routes/Dashboard",
    "./Index": "./src/ui/routes/Index",
    "./LoginIndex": "./src/ui/routes/LoginIndex",
    "./RegisterIndex": "./src/ui/routes/RegisterIndex",
    "./ResetPasswordConfirm": "./src/ui/routes/ResetPasswordConfirm",
    "./ResetPasswordLayout": "./src/ui/routes/ResetPasswordLayout",
    "./ResetPasswordReset": "./src/ui/routes/ResetPasswordReset",
    "./EmailVerificationBanner": "./src/ui/components/EmailVerificationBanner",
  },
} satisfies PluginConfig;
