import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Header from "@/components/LayoutHeader"; // Adjust the import path as needed
import Footer from "@/components/LayoutFooter"; // Adjust the import path as needed
import "../styles/global.scss";
import { cssBundleHref } from "@remix-run/css-bundle"; // Adjust the import path as needed

import "unfonts.css";
import initTracking from "@/lib/analytics.js";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
  },
  { viewport: "width=device-width,initial-scale=1" },
];

export default function Root() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      initTracking();
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className={`font-main bg-gray-900 flex`}>
        <main className="dark flex w-full min-h-screen flex-col md:px-40 items-center py-16 mx-auto">
          <Header />
          <Outlet />
          <Footer />
        </main>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
