import type { BaseRecord } from "@refinedev/core";
import type { UseFormReturn } from "react-hook-form";

import type { FormConfig } from "../types";

export interface SubmissionHandlerOptions<TRequest, TResponse> {
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
  currentDialog?: any;
  formMethods: UseFormReturn<TRequest>;
  isStep?: boolean;
  onError?: (error: Error) => Promise<void> | void;
  onSubmit?: (data: TRequest) => Promise<TResponse>;
  onSuccess?: (response: TResponse, values: TRequest) => Promise<void> | void;
}

export async function handleFormSubmission<
  TRequest extends BaseRecord,
  TResponse extends BaseRecord,
>(options: SubmissionHandlerOptions<TRequest, TResponse>): Promise<void> {
  const {
    closeDialog,
    config,
    currentDialog,
    formMethods,
    isStep,
    onError,
    onSubmit,
    onSuccess,
  } = options;

  try {
    return await formMethods.handleSubmit(async (data: TRequest) => {
      const submitResponse = onSubmit
        ? await onSubmit(data)
        : await config.onSubmit?.(data);

      // Unwrap nested response data if present
      const responseData =
        typeof submitResponse === "object" &&
        submitResponse !== null &&
        "data" in submitResponse
          ? (submitResponse as Record<string, unknown>).data
          : submitResponse;

      if (!isStep) {
        if (config.closeOnSubmit ?? true) {
          await closeDialog?.();
        }
        if (config.onSuccess) {
          await config.onSuccess(responseData as TResponse, data);
        } else if (currentDialog?.type === "form" && currentDialog.onSuccess) {
          await currentDialog.onSuccess(responseData, data);
        }
      }

      if (onSuccess) {
        await onSuccess(responseData as TResponse, data);
      }

      return responseData;
    })();
  } catch (error) {
    const err = error as Error;
    try {
      if (onError) {
        await onError(err);
      } else if (config.onError) {
        await config.onError(err);
      } else if (currentDialog?.type === "form" && currentDialog.onError) {
        await currentDialog.onError(err);
      }
    } catch (innerError) {
      // If error handler itself throws, preserve original error
      console.error("Error in form error handler:", innerError);
    }
    throw err;
  }
}
