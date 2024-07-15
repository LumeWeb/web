import { Authenticated } from "@refinedev/core";
import { Navigate } from "@remix-run/react";

export default function Index() {
  return (
    <Authenticated
      key={"index"}
      loading={<>Checking Login Status</>}
      v3LegacyAuthProviderCompatible>
      <Navigate to="/dashboard" replace />
    </Authenticated>
  );
}
