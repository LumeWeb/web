import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useRouteError } from "react-router";

import { RouteErrorBoundaryFallback } from "./RouteErrorBoundaryFallback";

interface RouteErrorBoundaryProps {
  children?: React.ReactNode;
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  let routerError: null | unknown = null;
  let useRouteErrorAttempted = false;

  try {
    useRouteErrorAttempted = true;
    const potentialRouterError = useRouteError();
    if (potentialRouterError !== null && potentialRouterError !== undefined) {
      routerError = potentialRouterError;
    } else {
      console.info(
        "RouteErrorBoundary: useRouteError() succeeded but returned null/undefined. No router error available.",
      );
    }
  } catch (e) {
    console.info(
      "RouteErrorBoundary: useRouteError() failed. Assuming standard Error Boundary usage.",
    );
  }

  if (useRouteErrorAttempted && routerError !== null) {
    return (
      <RouteErrorBoundaryFallback
        error={routerError}
        resetErrorBoundary={undefined}
      />
    );
  }

  if (children) {
    const reactErrorBoundaryFallback = ({
      error,
      resetErrorBoundary,
    }: FallbackProps) => {
      return (
        <RouteErrorBoundaryFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
        />
      );
    };

    return (
      <ErrorBoundary FallbackComponent={reactErrorBoundaryFallback}>
        {children}
      </ErrorBoundary>
    );
  }

  console.warn(
    "RouteErrorBoundary: Rendered without children and no router error available. Rendering null.",
  );
  return null;
}
