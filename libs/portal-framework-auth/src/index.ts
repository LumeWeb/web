export {
  type AuthFormRequest,
  type AuthProviderWithEmitter,
  createAuthProvider,
  DATA_PROVIDER_NAME,
  type ForgotPasswordConfirmRequest,
  type ForgotPasswordRequest,
  type OTPFormRequest,
  type OTPGenerateResponse,
  type RegisterFormRequest,
  type UpdatePasswordFormRequest,
} from "./dataProviders/auth";
import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import { Capability as SdkCapability } from "./capabilities/sdk";
import AppLoginIndex from "./ui/components/app-login/AppLoginIndex";
import AuthedIndex from "./ui/components/index/AuthedIndex";
import LoginIndex from "./ui/components/login/LoginIndex";
import OtpForm from "./ui/components/login/OtpForm";
import RegisterIndex from "./ui/components/register/RegisterIndex";
import ResetPasswordConfirm from "./ui/components/reset-password/ResetPasswordConfirm";
import ResetPasswordLayout from "./ui/components/reset-password/ResetPasswordLayout";
import ResetPasswordReset from "./ui/components/reset-password/ResetPasswordReset";

export { RefineConfigCapability, SdkCapability };

export {
  AppLoginIndex,
  AuthedIndex,
  LoginIndex,
  OtpForm,
  RegisterIndex,
  ResetPasswordConfirm,
  ResetPasswordLayout,
  ResetPasswordReset,
};

export {
  emitAuthCheckSuccess,
  isAbsoluteRedirect,
  isExternalRedirect,
  sanitizeRedirectUrl,
  storeAuthToken,
} from "./dataProviders/auth";
export {
  useNavigateToRedirect,
} from "./hooks/useNavigateToRedirect";
export { useRedirectIfAuthenticated } from "./hooks/useRedirectIfAuthenticated";
export { useSafeLogin } from "./hooks/useSafeLogin";
export {
  type SafeRedirectTarget,
  useSafeRedirectTarget,
} from "./hooks/useSafeRedirectTarget";
export { useSsoUrl } from "./hooks/useSsoUrl";
export {
  type AppIdentity,
  AppIdentityCard,
} from "./ui/components/common/AppIdentityCard";
export { AuthConsentNotice } from "./ui/components/common/AuthConsentNotice";
export { AuthProviders } from "./ui/components/common/AuthProviders";
export {
  SafeAuthenticated,
  type SafeAuthenticatedProps,
} from "./ui/components/common/SafeAuthenticated";

// NOTE: the wallet modules (src/wallet/*, hooks/useWalletLogin, the
// WalletLogin UI component) are not re-exported from the entry — they pull
// viem/@wagmi/core into the bundle. They are reachable only via the
// dynamically imported WalletLogin chunk, so prod (flag off) never loads
// them.
