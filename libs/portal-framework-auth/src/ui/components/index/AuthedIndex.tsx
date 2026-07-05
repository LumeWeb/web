import { Loading, withTheme } from "@lumeweb/portal-framework-ui";
import { Authenticated } from "@refinedev/core";
import React from "react";
import { useSearchParams } from "react-router";

import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

const Component: React.FC = () => {
  const [searchParams] = useSearchParams();
  const to = searchParams.get("to") ?? undefined;

  useRedirectIfAuthenticated("/dashboard", to);

  return (
    <Authenticated key="authed" fallback={<Loading />}>
      {/* Render nothing once authenticated — useRedirectIfAuthenticated
          will navigate away. fallback handles the auth-checking state. */}
      {null}
    </Authenticated>
  );
};

export default withTheme(Component);
