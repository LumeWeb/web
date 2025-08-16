import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./account/api-keys": "./src/ui/routes/account.api-keys",
    "./account/layout": "./src/ui/routes/account.layout",
    "./account/profile": "./src/ui/routes/account.profile",
    "./account/security": "./src/ui/routes/account.security",
    "./AccountVerify": "./src/ui/routes/AccountVerify",
    "./Dashboard": "./src/ui/routes/Dashboard",
    "./EmailVerificationBanner": "./src/ui/components/EmailVerificationBanner",
    "./Index": "./src/ui/routes/Index",
    "./LoginIndex": "./src/ui/routes/LoginIndex",
    "./RegisterIndex": "./src/ui/routes/RegisterIndex",
    "./ResetPasswordConfirm": "./src/ui/routes/ResetPasswordConfirm",
    "./ResetPasswordLayout": "./src/ui/routes/ResetPasswordLayout",
    "./ResetPasswordReset": "./src/ui/routes/ResetPasswordReset",
    "./widgets/account/2fa": "./src/ui/widgets/account/2fa",
    "./widgets/account/bio": "./src/ui/widgets/account/bio",
    "./widgets/account/password": "./src/ui/widgets/account/password",
    "./widgets/account/profile": "./src/ui/widgets/account/profile",
  },
  name: "core:dashboard",
} satisfies PluginConfig;
