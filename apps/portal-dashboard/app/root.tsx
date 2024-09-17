import { useMemo } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from "@/tailwind.css?url";
import type { LinksFunction } from "@remix-run/node";

// Supports weights 200-800
import "@fontsource-variable/manrope";
import {
  AuthProvider,
  NotificationProvider,
  Refine,
  ResourceProps,
} from "@refinedev/core";
import { Toaster } from "@/components/ui/toaster";
import useSdk from "@/hooks/useSdk.js";
import routerProvider from "@refinedev/remix-router";
import { notificationProvider } from "@/dataProviders/notificationProvider";
import { getResetServices } from "@/services/index";
import useUploader from "@/features/uploadManager/hooks/useUploader";
import { createAccountProvider } from "@/dataProviders/accountProvider";
import { useAuthProvider } from "@/hooks/useAuthProvider.js";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { withTheme } from "@/hooks/useTheme";
import { Skeleton } from "@/components/ui/skeleton";
import restDataProvider from "@refinedev/simple-rest";
import { createServiceProvider } from "@/dataProviders/serviceProvider";

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

  const allResources: ResourceProps[] = [
    ...resources,
    {
      name: "account/keys",
      meta: {
        headers: {
          Authorization: `Bearer ${sdk?.account()?.jwtToken}`,
        },
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
