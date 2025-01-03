import type { MetaFunction } from "@remix-run/node";
import ConfirmResetPasswordForm from "./components/ConfirmResetPasswordForm";

export const meta: MetaFunction = () => {
  return [{ title: "Confirm Reset Password" }];
};

export default function Confirm() {
  return <ConfirmResetPasswordForm />;
}
