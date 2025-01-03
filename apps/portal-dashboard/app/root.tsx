import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useMemo } from "react";

import type { LinksFunction } from "@remix-run/node";
import stylesheet from "portal-shared/tailwind.css?url";

// Supports weights 200-800
import "@fontsource-variable/manrope";
import { createServiceProvider } from "@/dataProviders/serviceProvider";
import useUploader from "@/features/uploadManager/hooks/useUploader";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { SERVICE_ROUTE } from "@/routeConfig";
import { getResetServices } from "@/services/index";
import {
  type AuthProvider,
  type NotificationProvider,
  Refine,
  type ResourceProps,
} from "@refinedev/core";
import routerProvider from "@refinedev/remix-router";
import restDataProvider from "@refinedev/simple-rest";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import { Toaster } from "portal-shared/components/ui/toaster";
import { createAccountProvider } from "portal-shared/dataProviders/accountProvider";
import { notificationProvider } from "portal-shared/dataProviders/notificationProvider";
import { useAuthProvider } from "portal-shared/hooks/useAuthProvider";
import useSdk from "portal-shared/hooks/useSdk";
import { withTheme } from "portal-shared/hooks/useTheme";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.svg" },
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
  const resetServices = getResetServices();
  const uploader = useUploader();

  const authProvider = useAuthProvider(sdk);

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
        resetServices();
        uploader.reset();
        return result;
      },
    };
  }, [authProvider, setIsInitialized, resetServices, uploader]);

  if (!isInitialized) {
    return <SkeletonLoader />;
  }

  const resourceAuthHeaders = {
    Authorization: `Bearer ${sdk?.account()?.jwtToken}`,
  };

  const allResources: ResourceProps[] = [
    ...resources,
    {
      name: "account/keys",
      meta: {
        headers: resourceAuthHeaders,
      },
    },
    {
      name: "account",
    },
    {
      name: SERVICE_ROUTE,
      show: "/service/:id",
    },
    {
      name: "account/subscription/billing/countries",
      meta: {
        headers: resourceAuthHeaders,
      },
    },
    {
      name: "account/subscription/billing/states",
      meta: {
        headers: resourceAuthHeaders,
      },
    },
    {
      name: "account/subscription/billing/cities",
      meta: {
        headers: resourceAuthHeaders,
      },
    },
  ];

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

        // @ts-ignore
        service: createServiceProvider(),
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
