import { AppComponent, AppComponentProps } from "@lumeweb/portal-framework-ui";
import "@fontsource-variable/manrope";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import React from "react";

import { env } from "./env";

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
