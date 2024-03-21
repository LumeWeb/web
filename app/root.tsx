import {Links, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";

import stylesheet from "./tailwind.css?url";
import type {LinksFunction} from "@remix-run/node";

// Supports weights 200-800
import '@fontsource-variable/manrope';
import {Refine} from "@refinedev/core";
import routerProvider from "@refinedev/remix-router";
import { notificationProvider } from "~/data/notification-provider";
import {SdkContextProvider} from "~/components/lib/sdk-context";
import { Toaster } from "~/components/ui/toaster";
import {getProviders} from "~/data/providers.js";
import {Sdk} from "@lumeweb/portal-sdk";
import resources from "~/data/resources.js";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        {children}
        <Toaster />
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function App() {
    console.log(import.meta.env.VITE_PORTAL_URL);
    const sdk = Sdk.create(import.meta.env.VITE_PORTAL_URL)
    const providers = getProviders(sdk);
    return (
        <Refine
            authProvider={providers.auth}
            routerProvider={routerProvider}
            notificationProvider={notificationProvider}
            dataProvider={{
                default: providers.default,
                files: providers.files,
                pinning: providers.pinning
            }}
            resources={resources}
            options={{disableTelemetry: true}}
        >
            <SdkContextProvider sdk={sdk}>
                <Outlet/>
            </SdkContextProvider>
        </Refine>
    );
}

export function HydrateFallback() {
    return <p>Loading...</p>;
}
