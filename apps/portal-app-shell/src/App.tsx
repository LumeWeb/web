import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import { AppComponent, AppComponentProps } from "@lumeweb/portal-framework-ui";
import "@fontsource-variable/manrope";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import {
  AuthBindingsContext,
  DataContext,
  LegacyAuthContext,
  NotificationContext,
  RefineContext,
  ResourceContext,
  RouterContext,
} from "@refinedev/core";
import { defaultContext as QueryClientContext } from "@tanstack/react-query";
import React from "react";
import { HookFormContext } from "react-hook-form";
import {
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
  UNSAFE_FetchersContext,
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  UNSAFE_RouteContext,
} from "react-router";

import { env } from "./env";

[
  [RefineContext, "RefineContext"],
  [QueryClientContext, "QueryClientContext"],
  [UNSAFE_DataRouterContext, "DataRouterContext"],
  [UNSAFE_DataRouterStateContext, "DataRouterStateContext"],
  [UNSAFE_FetchersContext, "FetchersContext"],
  [UNSAFE_LocationContext, "LocationContext"],
  [UNSAFE_NavigationContext, "NavigationContext"],
  [UNSAFE_RouteContext, "RouteContext"],
  [LegacyAuthContext, "LegacyAuthContext"],
  [AuthBindingsContext, "AuthBindingsContext"],
  [RouterContext, "RouterContext"],
  [HookFormContext, "HookFormContext"],
  [ResourceContext, "ResourceContext"],
  [DataContext, "DataContext"],
  [NotificationContext, "NotificationContext"],
].forEach((item) => registerBridgedContext(item[0], item[1]));

function App() {
  const opts: Partial<AppComponentProps> = {
    name: env.VITE_PORTAL_APP_NAME,
  };

  if (env.VITE_PORTAL_APP_DISABLE_NAV) {
    opts.loadNavigation = false;
  }

  if (env.VITE_PORTAL_APP_DISABLE_ROUTING) {
    opts.loadNavigation = false;
  }

  return <AppComponent {...opts} />;
}

export default App;
