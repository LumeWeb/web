import { useCustomMutation } from "@refinedev/core";
import { useRef, useState } from "react";

import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

import type {
  ManagementOperation,
  ManagementResultResponse,
} from "@/types/subscription";
import { ManagementAction, isCheckoutRequiredResponse, isManagementOperation } from "@/types/subscription";

export type ManagementActionResultType =
  | ManagementAction.Redirect
  | ManagementAction.ApiRequired
  | ManagementAction.ShowUI
  | ManagementAction.CheckoutRequired
  | ManagementAction.Complete
  | ManagementAction.Unsupported
  | ManagementAction.Error;

export type ManagementActionResult =
  | { type: ManagementAction.Redirect; url: string }
  | { type: ManagementAction.ApiRequired; data: ManagementResultResponse }
  | { type: ManagementAction.ShowUI; data: ManagementResultResponse }
  | { type: ManagementAction.CheckoutRequired; data: Record<string, unknown> }
  | { type: ManagementAction.Complete; data: ManagementResultResponse }
  | { type: ManagementAction.Unsupported }
  | { type: ManagementAction.Error; message: string };

export interface OperationState {
  isLoading: boolean;
  result: ManagementActionResult | null;
  error: Error | null;
}

export type OperationStates = Record<string, OperationState>;

interface UseManagementActionResult {
  execute: (operation: ManagementOperation, body?: Record<string, unknown>) => Promise<ManagementActionResult>;
  getOperationState: (operation: ManagementOperation) => OperationState;
  isLoading: boolean;
  error: Error | null;
}

const defaultOperationState: OperationState = { isLoading: false, result: null, error: null };

function errorResult(message: string): ManagementActionResult {
  return { type: ManagementAction.Error, message };
}

export interface UseManagementActionConfig {
  onSuccess?: (operation: ManagementOperation) => void;
}

export function useManagementAction(config: UseManagementActionConfig = {}): UseManagementActionResult {
  const { mutateAsync } = useCustomMutation<ManagementResultResponse>();
  const [operationStates, setOperationStates] = useState<OperationStates>({});
  const [globalError, setGlobalError] = useState<Error | null>(null);
  const onSuccessRef = useRef(config.onSuccess);
  onSuccessRef.current = config.onSuccess;

  function getOperationState(operation: ManagementOperation): OperationState {
    return operationStates[operation] ?? defaultOperationState;
  }

  function setOperationResult(
    operation: ManagementOperation,
    result: ManagementActionResult,
    error?: Error
  ): ManagementActionResult {
    setOperationStates(prev => ({
      ...prev,
      [operation]: { ...defaultOperationState, result, error: error ?? null },
    }));
    return result;
  }

  function finishWithError(
    operation: ManagementOperation,
    message: string,
    isGlobal = false
  ): ManagementActionResult {
    const result = errorResult(message);
    const error = new Error(message);
    if (isGlobal) setGlobalError(error);
    return setOperationResult(operation, result, error);
  }

  async function execute(
    operation: ManagementOperation,
    body?: Record<string, unknown>,
  ): Promise<ManagementActionResult> {
    if (!isManagementOperation(operation)) {
      return finishWithError(operation, "Unsupported management operation", true);
    }

    setOperationStates(prev => ({ ...prev, [operation]: { ...defaultOperationState, isLoading: true } }));
    setGlobalError(null);

    try {
      const response = await mutateAsync({
        url: "/account/billing/management",
        method: "post",
        values: { operation },
        dataProviderName: DATA_PROVIDER_NAME,
      });

      const result = response.data;

      if (!result) {
        return finishWithError(operation, "No data received from management endpoint");
      }

      const { action, url, api_endpoint, error_message, ...rest } = result;

      switch (action) {
        case ManagementAction.Redirect:
          return setOperationResult(operation, { type: ManagementAction.Redirect, url: url ?? "" });

        case ManagementAction.ApiRequired: {
          if (!api_endpoint) {
            return finishWithError(operation, "api_required action missing api_endpoint");
          }
          const normalizedPath = api_endpoint.path.replace(/^\/api\/?/, "/");
          const apiResponse = await mutateAsync({
            url: normalizedPath,
            method: api_endpoint.method as "post" | "put" | "patch" | "delete",
            values: body ?? {},
            dataProviderName: DATA_PROVIDER_NAME,
          });

          const apiResultData = apiResponse.data;

          if (
            apiResultData &&
            typeof apiResultData === "object" &&
            "action" in apiResultData &&
            apiResultData.action === ManagementAction.CheckoutRequired
          ) {
            return setOperationResult(operation, {
              type: ManagementAction.CheckoutRequired,
              data: apiResultData as unknown as Record<string, unknown>,
            });
          }

          if (
            apiResultData &&
            typeof apiResultData === "object" &&
            "action" in apiResultData &&
            apiResultData.action === ManagementAction.Complete
          ) {
            const actionResult = setOperationResult(operation, {
              type: ManagementAction.Complete,
              data: apiResultData as ManagementResultResponse,
            });
            onSuccessRef.current?.(operation);
            return actionResult;
          }

          const actionResult = setOperationResult(operation, {
            type: ManagementAction.ApiRequired,
            data: apiResultData as ManagementResultResponse,
          });
          onSuccessRef.current?.(operation);
          return actionResult;
        }

        case ManagementAction.ShowUI: {
          const actionResult = setOperationResult(operation, { type: ManagementAction.ShowUI, data: result });
          onSuccessRef.current?.(operation);
          return actionResult;
        }

        case ManagementAction.Complete: {
          const actionResult = setOperationResult(operation, { type: ManagementAction.Complete, data: result });
          onSuccessRef.current?.(operation);
          return actionResult;
        }

        case ManagementAction.CheckoutRequired:
          return setOperationResult(operation, { type: ManagementAction.CheckoutRequired, data: result as unknown as Record<string, unknown> });

        case ManagementAction.Unsupported:
          return setOperationResult(operation, { type: ManagementAction.Unsupported });

        case ManagementAction.Error:
          return finishWithError(operation, error_message ?? "Management operation failed", true);

        default:
          return finishWithError(operation, `Unhandled action: ${action}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setGlobalError(err instanceof Error ? err : new Error(message));
      return finishWithError(operation, message);
    }
  }

  const isLoading = Object.values(operationStates).some(state => state.isLoading);

  return { execute, getOperationState, isLoading, error: globalError };
}
