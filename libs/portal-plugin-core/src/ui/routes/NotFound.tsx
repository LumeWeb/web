import { withTheme } from "@lumeweb/portal-framework-ui";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind-plugin.css";
import { Link } from "react-router";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">404 Not Found</h1>
      <p className="text-gray-600 mb-4">
        Sorry, the page you requested could not be found.
      </p>
      <Link className="text-blue-500 hover:underline" to="/">
        Go to Home Page
      </Link>
    </div>
  );
}

export default withTheme(NotFound);
