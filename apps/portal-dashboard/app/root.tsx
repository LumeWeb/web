import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";
import type { LinksFunction } from "@remix-run/node";

// Supports weights 200-800
import "@fontsource-variable/manrope";
import { NotificationProvider, Refine } from "@refinedev/core";
import { Toaster } from "~/components/ui/toaster";
import usePortalUrl from "~/hooks/usePortalUrl.js";
import { IndeterminateProgressBar } from "~/components/ui/indeterminate-progress-bar";
import useSdk from "~/hooks/useSdk.js";
import { createPortalAuthProvider } from "~/dataProviders/authProvider";
import routerProvider from "@refinedev/remix-router";
import { notificationProvider } from "~/dataProviders/notificationProvider";
import { IPFS } from "~/services/ipfs/index.js";
import BaseService from "~/services/base";
import { useEffect, useRef } from "react";
import { AppActions, useAppStore } from "~/stores/app";
import { withTheme } from "~/hooks/useTheme";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="max-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export function Root() {
  const portalUrl = usePortalUrl();
  const sdk = useSdk();
  const servicesRegistered = useRef(false);
  const addService = useAppStore((state) => state.addService);

  useEffect(() => {
    if (sdk && !servicesRegistered.current) {
      registerServices(addService);
      servicesRegistered.current = true;
    }
  }, [sdk]);

  if (!portalUrl || !sdk) {
    return <IndeterminateProgressBar indeterminate={true} />;
  }

  return (
    <Refine
      authProvider={createPortalAuthProvider(sdk)}
      routerProvider={routerProvider}
      notificationProvider={
        notificationProvider as unknown as NotificationProvider
      }
      options={{ disableTelemetry: true }}>
      <App />
    </Refine>
  );
}

export default withTheme(Root);

export function HydrateFallback() {
  return <IndeterminateProgressBar indeterminate={true} />;
}

function registerServices(addFunc: AppActions["addService"]) {
  [new IPFS()].forEach((svc: BaseService) => addFunc(svc));
}
