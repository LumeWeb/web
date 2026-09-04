import { Loading, withTheme } from "@lumeweb/portal-framework-ui";
import React from "react";
import { useSearchParams } from "react-router";

import { SafeAuthenticated } from "@/ui/components/common/SafeAuthenticated";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";

const Component: React.FC = () => {
  const [searchParams] = useSearchParams();
  const to = searchParams.get("to") ?? undefined;

  useRedirectIfAuthenticated("/dashboard", to);

  return (
    <SafeAuthenticated key="authed" loading={<Loading />}>
      {/* loading shows <Loading /> while auth check is in-flight.
          SafeAuthenticated (appendCurrentPathToQuery=false) means the
          unauthenticated bounce targets check() redirectTo verbatim —
          exactly /login?to=<single-encoded E1>, so the `to` query is not
          appended a second time. */}
      {null}
    </SafeAuthenticated>
  );
};

export default withTheme(Component);
