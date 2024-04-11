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
import { useEffect, useMemo, useState } from "react";
import { PinningProcess } from "~/data/pinning.js";
import { env } from "~/env.js";

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
  const [portalUrl, setPortalUrl] = useState(env.VITE_PORTAL_URL);
  const [sdk, setSdk] = useState<Sdk | undefined>(
    portalUrl ? Sdk.create(portalUrl) : undefined,
  );
  useEffect(() => {
    if (!portalUrl) {
      fetch("/api/meta")
        .then((response) => response.json())
        .then((data) => {
          setPortalUrl(`https://${data.domain}`);
        })
        .catch((error) => {
          console.error("Failed to fetch portal url:", error);
        });
    }
  }, [portalUrl]);

  useEffect(() => {
    if (portalUrl) {
      setSdk(Sdk.create(portalUrl));
    }
  }, [portalUrl]);

  if (!portalUrl) {
    return <p>Loading...</p>;
  }

  return (
    <SdkContextProvider sdk={sdk as Sdk}>
      <SdkWrapper />
    </SdkContextProvider>
  );
}

function SdkWrapper() {
  const sdk = useSdk();
  PinningProcess.setupSdk(sdk as Sdk);

  const providers = useMemo(() => getProviders(sdk as Sdk), [sdk]);

  if (!sdk) {
    return <p>Loading...</p>;
  }

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
        <App />
      </Refine>
    </QueryClientProvider>
  );
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
