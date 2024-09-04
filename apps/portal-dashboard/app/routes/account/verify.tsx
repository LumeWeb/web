import type { MetaFunction } from "@remix-run/node";
import VerifyAccount from "./components/VerifyAccount";

export const meta: MetaFunction = () => {
  return [{ title: "Verify Email" }];
};

export default function Verify() {
  return <VerifyAccount />;
}
