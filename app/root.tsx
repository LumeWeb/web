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
import '@fontsource-variable/manrope';
import {Refine} from "@refinedev/core";
import {PortalAuthProvider} from "~/data/auth-provider.js";
import routerProvider from "@refinedev/remix-router";
import { defaultProvider } from "./data/file-provider";
import {SdkContextProvider} from "~/components/lib/sdk-context.js";

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
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export default function App() {
    const auth = PortalAuthProvider.create("https://alpha.pinner.xyz")
    return (
        <Refine
            authProvider={auth}
            routerProvider={routerProvider}
            dataProvider={defaultProvider}
            resources={[
                { name: 'files' },
                { name: 'users' }
            ]}
            options={{disableTelemetry: true}}
        >
            <SdkContextProvider sdk={(auth as PortalAuthProvider).sdk}>
                <Outlet/>
            </SdkContextProvider>
        </Refine>
    );
}

export function HydrateFallback() {
    return <p>Loading...</p>;
}
