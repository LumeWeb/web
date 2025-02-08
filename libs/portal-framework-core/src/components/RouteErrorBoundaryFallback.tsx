import React from "react";

interface RouteErrorBoundaryFallbackProps {
  error: Error | unknown;
  resetErrorBoundary?: () => void;
}

interface RouterLikeError {
  data?: any;
  message?: string;
  status?: number;
  statusText?: string;
}

export function RouteErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: RouteErrorBoundaryFallbackProps) {
  if (error === undefined || error === null) {
    console.warn("RouteErrorBoundaryFallback: Received null/undefined error");
    return null;
  }

  let errorMessage: string;
  let statusCode: number | undefined;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    const routerError = error as RouterLikeError;
    statusCode = routerError.status;

    if (routerError.statusText) {
      errorMessage = routerError.statusText;
    } else if (routerError.data?.message) {
      errorMessage = routerError.data.message;
    } else if (routerError.message) {
      errorMessage = routerError.message;
    } else {
      errorMessage = "An unknown error occurred";
      console.error(
        "RouteErrorBoundaryFallback received an unhandled error format:",
        error,
      );
    }
  }

  const lowerCaseMessage = errorMessage.toLowerCase();
  const isResolutionError =
    lowerCaseMessage.includes("component") ||
    lowerCaseMessage.includes("export") ||
    lowerCaseMessage.includes("plugin") ||
    lowerCaseMessage.includes("module");

  return (
    <div
      className="p-4 route-error-boundary"
      data-testid="route-error-boundary-fallback">
      <div role="alert">
        <h2 className="text-lg font-semibold mb-2">
          {statusCode
            ? `Error ${statusCode}`
            : isResolutionError
              ? "Failed to load resource"
              : "An error occurred"}
        </h2>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        {typeof resetErrorBoundary === 'function' && (
          <button
            aria-label="Retry loading"
            className="px-4 py-2 bg-red-100 rounded hover:bg-red-200 retry-button"
            onClick={resetErrorBoundary}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
