import type { MetaFunction } from "@remix-run/node";
import LoginComponent from "portal-shared/components/routes/login";

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    { name: "description", content: "Welcome to Lume!" },
  ];
};

export default function Login() {
  return <LoginComponent socialLoginEnabled />;
}
