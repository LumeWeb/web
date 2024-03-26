import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "./tailwind.css?url";
import type { LinksFunction } from "@remix-run/node";

// Supports weights 200-800
import "@fontsource-variable/manrope";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/remix-router";
import { notificationProvider } from "~/data/notification-provider";
import { SdkContextProvider, useSdk } from "~/components/lib/sdk-context";
import { Toaster } from "~/components/ui/toaster";
import { getProviders } from "~/data/providers.js";
import { Sdk } from "@lumeweb/portal-sdk";
import resources from "~/data/resources.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {useEffect, useMemo, useState} from "react";
import {PinningProcess} from "~/data/pinning.js";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="overflow-hidden">
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const sdk = useSdk();
  const providers = useMemo(() => getProviders(sdk as Sdk), [sdk]);
    useMemo(() => PinningProcess.setupSdk(sdk as Sdk), [sdk]);
  return (
    <QueryClientProvider client={queryClient}>
      <Refine
        authProvider={providers.auth}
        routerProvider={routerProvider}
        notificationProvider={notificationProvider}
        dataProvider={{
          default: providers.default,
          files: providers.files,
        }}
        resources={resources}
        options={{ disableTelemetry: true }}>
        <Outlet />
      </Refine>
    </QueryClientProvider>
  );
}

export default function Root() {
    const [portalUrl, setPortalUrl] = useState(import.meta.env.VITE_PORTAL_URL);

    useEffect(() => {
        if (!portalUrl) {
            fetch('/api/meta')
                .then(response => response.json())
                .then(data => {
                    setPortalUrl(data.domain);
                })
                .catch((error: any) => {
                    console.error('Failed to fetch portal url:', error);
                });
        }
    }, [portalUrl]);

    if (!portalUrl) {
        return <p>Loading...</p>;
    }

  const sdk = Sdk.create(portalUrl);
  return (
    <SdkContextProvider sdk={sdk}>
      <App />
    </SdkContextProvider>
  );
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
