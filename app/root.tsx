import {Links, Meta, Outlet, Scripts, ScrollRestoration,} from "@remix-run/react";

import stylesheet from "./tailwind.css?url";
import type {LinksFunction} from "@remix-run/node";

// Supports weights 200-800
import '@fontsource-variable/manrope';
import {Refine} from "@refinedev/core";
import routerProvider from "@refinedev/remix-router";
import {notificationProvider} from "~/data/notification-provider";
import {SdkContextProvider, useSdk} from "~/components/lib/sdk-context";
import {Toaster} from "~/components/ui/toaster";
import {getProviders} from "~/data/providers.js";
import {Sdk} from "@lumeweb/portal-sdk";
import resources from "~/data/resources.js";
import {useMemo} from "react";

export const links: LinksFunction = () => [
    {rel: "stylesheet", href: stylesheet},
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
        <Toaster/>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

function App() {
    const sdk = useSdk();
    const providers = useMemo(() => getProviders(sdk as Sdk), [sdk]);
    return (
        <Refine
            authProvider={providers.auth}
            routerProvider={routerProvider}
            notificationProvider={notificationProvider}
            dataProvider={providers}
            resources={resources}
            options={{disableTelemetry: true}}
        >
            <Outlet/>
        </Refine>
    );
}

export default function Root() {
    const sdk = Sdk.create(import.meta.env.VITE_PORTAL_URL)
    return (
        <SdkContextProvider sdk={sdk}>
            <App/>
        </SdkContextProvider>
    );
}

export function HydrateFallback() {
    return <p>Loading...</p>;
}
