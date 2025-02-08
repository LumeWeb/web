import {
  BaseKey,
  HttpError,
  useCustomMutation,
  useGo,
} from "@refinedev/core";
import { useCallback } from "react";
import type { TokenRefreshRequest } from "@/client/index.schemas";

interface ValidationResponse {
  reference: BaseKey;
  valid: boolean;
}

export const useValidateToken = () => {
  const { mutateAsync, isPending } = useCustomMutation<
    ValidationResponse,
    HttpError,
    TokenRefreshRequest
  >();
  const go = useGo();

  const validateToken = useCallback(
    async (token: string): Promise<boolean> => {
      const payload = { token };
      try {
        const result = await mutateAsync({
          url: "/api/abuse/tokens/validate",
          method: "post",
          values: payload,
        });

        // Type guard to ensure data exists
        if (!result?.data) {
          throw new Error("No data received from server");
        }

        const responseData = result.data;
        if (responseData.valid) {
          localStorage.setItem("caseAccessToken", token);
          go({
            to: `/case/${responseData.reference}`,
            type: "push",
          });
          return true;
        }
        throw new Error("Invalid access token");
      } catch (error) {
        console.error("Token validation failed:", error);
        throw error instanceof Error ? error : new Error("Token validation failed");
      }
    },
    [mutateAsync, go],
  );

  return {
    isLoading: isPending,
    validateToken,
  };
};
