import { useCustomMutation, useNotification } from "@refinedev/core";
import { useState } from "react";
import useApiUrl from "portal-shared/hooks/useApiUrl";

export default function useCreatePaymentEncryptionKey() {
  const apiUrl = useApiUrl();
  const { open } = useNotification();
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);

  const { mutate, isLoading } = useCustomMutation<{ key: string }>();

  const generateEncryptionKey = () => {
    mutate(
      {
        url: `${apiUrl}/api/account/subscription/ephemeral-key`,
        method: "post",
        values: {},
      },
      {
        onSuccess(data) {
          setEphemeralKey(data.data.key);
        },
        onError(error) {
          open?.({
            type: "error",
            message: `Failed to generate payment encryption key: ${error.message}`,
          });
        },
      },
    );
  };

  return { ephemeralKey, isLoading, generateEncryptionKey };
}
