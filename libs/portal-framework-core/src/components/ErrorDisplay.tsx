import { AlertCircle } from "lucide-react";
import React from "react";

import type { CategoryError, InitializationResult } from "../types/api";

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
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="space-y-6 p-6 max-w-2xl w-full flex flex-col items-center text-center">
        <div className="w-full space-y-2" role="alert">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-red-600">
            Framework Initialization Failed
          </h2>
          {!hasCategories && (
            <p className="text-gray-600">
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
                <h3 className="font-medium text-gray-900">
                  {categoryLabels[category]}
                </h3>
                {errors.map((error) => (
                  <div
                    className="p-4 bg-red-50 rounded-lg border border-red-200"
                    key={error.id}
                  >
                    <div className="font-medium text-red-900">{error.error.originalId || error.id}</div>
                    <div className="mt-1 text-sm text-red-800">
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
            className="mt-6 px-6 py-2.5 bg-red-50 hover:bg-red-100
                      text-red-600 font-medium rounded-lg transition-colors duration-200"
            onClick={onRetry}>
            Retry Initialization
          </button>
        )}
      </div>
    </div>
  );
}
