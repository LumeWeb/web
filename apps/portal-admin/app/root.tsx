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
import { Refine } from "@refinedev/core";
import { Toaster } from "~/components/ui/toaster";
import usePortalUrl from "~/hooks/usePortalUrl.js";
import { IndeterminateProgressBar } from "~/components/ui/indeterminate-progress-bar";
import useSdk from "~/hooks/useSdk.js";
import { createPortalAuthProvider } from "~/dataProviders/authProvider";
import routerProvider from "@refinedev/remix-router";

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

export default function Root() {
  const portalUrl = usePortalUrl();
  const sdk = useSdk();

  if (!portalUrl || !sdk) {
    return <IndeterminateProgressBar indeterminate={true} />;
  }

  return (
    <Refine
      authProvider={createPortalAuthProvider(sdk)}
      routerProvider={routerProvider}
      options={{ disableTelemetry: true }}>
      <App />
    </Refine>
  );
}

export function HydrateFallback() {
  return <IndeterminateProgressBar indeterminate={true} />;
}
