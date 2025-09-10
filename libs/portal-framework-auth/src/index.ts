export {
  type AuthFormRequest,
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
import AuthedIndex from "./ui/components/index/AuthedIndex";
import LoginIndex from "./ui/components/login/LoginIndex";
import OtpForm from "./ui/components/login/OtpForm";
import RegisterIndex from "./ui/components/register/RegisterIndex";
import ResetPasswordConfirm from "./ui/components/reset-password/ResetPasswordConfirm";
import ResetPasswordLayout from "./ui/components/reset-password/ResetPasswordLayout";
import ResetPasswordReset from "./ui/components/reset-password/ResetPasswordReset";

export { RefineConfigCapability, SdkCapability };

export {
  AuthedIndex,
  LoginIndex,
  OtpForm,
  RegisterIndex,
  ResetPasswordConfirm,
  ResetPasswordLayout,
  ResetPasswordReset,
};
