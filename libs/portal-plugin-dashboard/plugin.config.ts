import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:dashboard",
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./widgets/account/profile": "./src/ui/widgets/account/profile",
    "./widgets/account/password": "./src/ui/widgets/account/password",
    "./widgets/account/bio": "./src/ui/widgets/account/bio",
    "./account/profile": "./src/ui/routes/account.profile",
    "./account/security": "./src/ui/routes/account.security",
    "./account/layout": "./src/ui/routes/account.layout",
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
