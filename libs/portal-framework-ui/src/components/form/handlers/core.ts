import type { BaseRecord, OnErrorResponse } from "@refinedev/core";
import type { UseFormReturn } from "react-hook-form";

import type { FormConfig } from "../types";

const isErrorResponse = (response: unknown): response is OnErrorResponse => {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
};

const processErrorResponse = (response: OnErrorResponse): Error => {
  if (response.error) {
    return toSafeError(response.error);
  }
  return new Error("Unknown error occurred");
};

const toSafeError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  // If error is object-like and has a message property, use it
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return new Error(message, { cause: error });
    }
  }
  
  return new Error(String(error), { cause: error });
};

const handleError = async <TRequest extends BaseRecord>(
  error: unknown,
  options: SubmissionHandlerOptions<TRequest, any>,
): Promise<void> => {
  const { config, currentDialog, onError } = options;
  const err = toSafeError(error);

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
};

export interface SubmissionHandlerOptions<TRequest, TResponse> {
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
  currentDialog?: any;
  formMethods: UseFormReturn<TRequest>;
  isStep?: boolean;
  onError?: (error: unknown) => Promise<void> | void;
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
    onSubmit,
    onSuccess,
  } = options;

  try {
    return await formMethods.handleSubmit(async (data: TRequest) => {
      const submitResponse = onSubmit
        ? await onSubmit(data)
        : await config.onSubmit?.(data);

      // Check if response is an error response and throw if it is
      if (isErrorResponse(submitResponse)) {
        throw processErrorResponse(submitResponse);
      }

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
    await handleError(error, options);
  }
}
