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

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  // Add your Google font links here
  // Example: { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400&display=swap" },
  // Example: { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Jaldi:wght@400&display=swap" },
];

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
  },
  { viewport: "width=device-width,initial-scale=1" },
];

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="font-main bg-gray-900 flex">
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
