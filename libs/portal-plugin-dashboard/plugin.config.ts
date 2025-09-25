import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  dir: __dirname,
  exposes: {
    ".": "./src/plugin",
    "./account/api-keys": "./src/ui/routes/account.api-keys",
    "./account/layout": "./src/ui/routes/account.layout",
    "./account/profile": "./src/ui/routes/account.profile",
    "./account/security": "./src/ui/routes/account.security",
    "./account/verify": "./src/ui/routes/account.verify",
    "./dashboard": "./src/ui/routes/dashboard",
    "./index": "./src/ui/routes/index",
    "./loginIndex": "./src/ui/routes/loginIndex",
    "./loginOtp": "./src/ui/routes/otp",
    "./registerIndex": "./src/ui/routes/registerIndex",
    "./resetPassword/confirm": "./src/ui/routes/resetPassword.confirm",
    "./resetPassword/layout": "./src/ui/routes/resetPassword.layout",
    "./resetPassword/reset": "./src/ui/routes/resetPassword.reset",
    "./widgets/account/2fa": "./src/ui/widgets/account/2fa",
    "./widgets/account/bio": "./src/ui/widgets/account/bio",
    "./widgets/account/delete": "./src/ui/widgets/account/delete",
    "./widgets/account/emailVerificationBanner":
      "./src/ui/widgets/account/emailVerificationBanner",
    "./widgets/account/password": "./src/ui/widgets/account/password",
    "./widgets/account/profile": "./src/ui/widgets/account/profile",
    "./widgets/upload/button": "./src/ui/widgets/upload/button",
    "./operations": "./src/ui/routes/operations",
  },
  name: "core:dashboard",
} satisfies PluginConfig;
