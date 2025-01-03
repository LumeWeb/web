import type { MetaFunction } from "@remix-run/node";
import ResetPasswordForm from "@/routes/reset-password/components/ResetPasswordForm";

export const meta: MetaFunction = () => {
  return [{ title: "Reset Password" }];
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
