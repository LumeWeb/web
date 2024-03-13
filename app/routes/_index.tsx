import Login from "./login";
import { useGo, useIsAuthenticated } from "@refinedev/core";
import { useEffect } from "react";

export default function Index() {
  const { isLoading, data } = useIsAuthenticated();

  const go = useGo();

  useEffect(() => {
    if (!isLoading && data?.authenticated) {
      go({ to: "/dashboard", type: "replace" });
    }
  }, [isLoading, data]);

  if (isLoading) {
    return <>Checking Login Status</> || null;
  }

  if (data?.authenticated) {
    return <>Redirecting</> || null;
  }

  return <Login />;
}
