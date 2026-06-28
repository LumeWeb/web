import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";

import type { CategoryError, InitializationResult } from "../types/api";
const AlertCircle = lazyIcon("AlertCircle");


interface ErrorDisplayProps {
  error: Error | InitializationResult;
  onRetry?: () => void;
}

const categoryLabels = {
  capability: "Capability Error",
  feature: "Feature Error",
  plugin: "Plugin Error",
  system: "System Error",
} as const;

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const hasCategories = "errors" in error && Array.isArray(error.errors);

  const groupedErrors = hasCategories
    ? error.errors?.reduce(
        (groups, err) => {
          const category = err.category;
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(err);
          return groups;
        },
        {} as Record<keyof typeof categoryLabels, CategoryError[]>,
      )
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="space-y-6 p-6 max-w-2xl w-full flex flex-col items-center text-center">
        <div className="w-full space-y-2" role="alert">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold text-destructive">
            Framework Initialization Failed
          </h2>
          {!hasCategories && (
            <p className="text-muted-foreground">
              {(error as Error).message ||
                "An unexpected error occurred during initialization"}
            </p>
          )}
        </div>

        {groupedErrors && (
          <div className="w-full space-y-6 text-left" role="alert">
            {(
              Object.entries(groupedErrors) as [
                keyof typeof categoryLabels,
                CategoryError[],
              ][]
            ).map(([category, errors]) => (
              <div className="space-y-3" key={category}>
                <h3 className="font-medium text-foreground">
                  {categoryLabels[category]}
                </h3>
                {errors.map((error) => (
                  <div
                    className="p-4 rounded-lg border border-destructive/50 bg-destructive/10"
                    key={error.id}
                  >
                    <div className="font-medium text-destructive-foreground">
                      {error.error.originalId || error.id}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {error.error.message}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {onRetry && (
          <button
            className="mt-6 px-6 py-2.5 rounded-lg border border-destructive/50 bg-destructive/10
                      text-destructive font-medium transition-colors duration-200
                      hover:bg-destructive/20"
            onClick={onRetry}
          >
            Retry Initialization
          </button>
        )}
      </div>
    </div>
  );
}
