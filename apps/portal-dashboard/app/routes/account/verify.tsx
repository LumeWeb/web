import type { MetaFunction } from "@remix-run/node";
import { Authenticated } from "@refinedev/core";
import VerifyAccount from "./components/VerifyAccount";

export const meta: MetaFunction = () => {
  return [{ title: "Verify Email" }];
};

export default function Verify() {
  return (
    <Authenticated v3LegacyAuthProviderCompatible key={""}>
      <VerifyAccount />
    </Authenticated>
  );
}
