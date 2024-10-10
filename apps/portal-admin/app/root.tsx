import { useMemo } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "portal-shared/tailwind.css?url";
import type { LinksFunction } from "@remix-run/node";

// Supports weights 200-800
import "@fontsource-variable/manrope";
import {
  AuthProvider,
  NotificationProvider,
  Refine,
  ResourceProps,
} from "@refinedev/core";
import { Toaster } from "portal-shared/components/ui/toaster";
import useSdk from "portal-shared/hooks/useSdk";
import routerProvider from "@refinedev/remix-router";
import { notificationProvider } from "portal-shared/dataProviders/notificationProvider";
import { createAccountProvider } from "portal-shared/dataProviders/accountProvider";
import { useAuthProvider } from "portal-shared/hooks/useAuthProvider";
import { withTheme } from "portal-shared/hooks/useTheme";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import restDataProvider from "@refinedev/simple-rest";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import useProtocolDomain from "portal-shared/hooks/useProtocolDomain";

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
  const sdk = useSdk();

  const authProvider = useAuthProvider(sdk);
  const adminDomain = useProtocolDomain("admin");

  const { isInitialized, providers, resources, setIsInitialized } =
    useAppInitialization(sdk, authProvider);

  const wrappedAuthProvider = useMemo(() => {
    if (!authProvider) return null;
    return {
      ...authProvider,
      login: async (params: any) => {
        const result = await authProvider.login(params);
        setIsInitialized(false); // Trigger re-initialization after login
        return result;
      },
      logout: async (params: any) => {
        const result = await authProvider.logout(params);
        setIsInitialized(false); // Trigger re-initialization after logout
        return result;
      },
    };
  }, [authProvider, setIsInitialized]);

  if (!isInitialized) {
    return <SkeletonLoader />;
  }

  const resourceAuthHeaders = {
    Authorization: `Bearer ${sdk?.account()?.jwtToken}`,
  };

  const allResources: ResourceProps[] = [
    ...resources,
    {
      name: "cron/jobs",
      meta: {
        dataProviderName: "admin",
        authHeaders: resourceAuthHeaders,
      },
    },
    {
      name: "settings",
      list: "settings",
      show: "settings/:id",
      meta: {
        dataProviderName: "admin",
        authHeaders: resourceAuthHeaders,
      },
    },
  ];

  const adminDataProvider = restDataProvider(`https://${adminDomain}/api`);

  return (
    <Refine
      authProvider={wrappedAuthProvider as AuthProvider}
      routerProvider={routerProvider}
      dataProvider={{
        ...providers,
        default: createAccountProvider(
          sdk!,
          restDataProvider(
            // @ts-ignore
            sdk!.account()?.apiUrl?.replace(/\/+$/, "") + "/api",
          ),
        ),
        admin: adminDataProvider,
      }}
      notificationProvider={
        notificationProvider as unknown as NotificationProvider
      }
      resources={allResources}
      options={{ disableTelemetry: true, warnWhenUnsavedChanges: true }}>
      <App />
    </Refine>
  );
}

export default withTheme(Root);

export function HydrateFallback() {
  return <SkeletonLoader />;
}

const SkeletonLoader = () => {
  return (
    <div className="flex items-start justify-center min-h-screen p-4 pt-60">
      <div className="w-full max-w-md space-y-2">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <Skeleton className="h-4 w-2/3 mx-auto" />
      </div>
    </div>
  );
};
