import { useGo, useIsAuthenticated } from "@refinedev/core";

export default function Index() {
  const { isLoading, data } = useIsAuthenticated();

  const go = useGo();

  if (isLoading) {
    return <>Checking Login Status</>;
  }

  if (data?.authenticated) {
    go({ to: "/dashboard", type: "replace" });
  } else {
    go({ to: "/login", type: "replace" });
  }

  return <>Redirecting</>;
}
