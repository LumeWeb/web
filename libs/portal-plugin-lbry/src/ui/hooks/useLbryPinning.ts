import { useCustomMutation, useNotification } from "@refinedev/core";
import { useCallback } from "react";
import { DATA_PROVIDER_NAME } from "@/capabilities/refineConfig";

export interface UseLbryPinningReturn {
  pinStreams: (sdHashes: string[]) => Promise<void>;
  isMutating: boolean;
}

export function useLbryPinning(): UseLbryPinningReturn {
  const { mutateAsync: customMutate, mutation } = useCustomMutation();
  const { open } = useNotification();
  const isMutating = mutation.isPending;

  const pinStreams = useCallback(
    async (sdHashes: string[]) => {
      if (sdHashes.length === 0) {
        open?.({
          type: "error",
          message: "No Streams to Pin",
          description: "Please provide at least one SD hash to pin.",
        });
        return;
      }

      try {
        const success: string[] = [];
        const failed: string[] = [];

        // Show progress for bulk operations
        if (sdHashes.length > 1) {
          open?.({
            type: "progress",
            message: "Pinning Streams",
            description: `Processing ${sdHashes.length} stream(s)...`,
          });
        }

        // Pin each SD hash using Refine's custom method with operation to append /pin
        for (const sdHash of sdHashes) {
          try {
            await customMutate({
              url: "pin",
              method: "post",
              values: { sd_hash: sdHash },
              meta: {
                resource: "streams",
              },
              dataProviderName: DATA_PROVIDER_NAME,
              successNotification: false,
              errorNotification: false,
            });
            success.push(sdHash);

            // Individual notification for single operations
            if (sdHashes.length === 1) {
              open?.({
                type: "success",
                message: "Stream Pinned",
                description: `Stream ${sdHash.slice(0, 8)}...${sdHash.slice(-8)} has been pinned.`,
              });
            }
          } catch (error) {
            failed.push(sdHash);
          }
        }

        // Bulk summary for batch operations
        if (sdHashes.length > 1) {
          const failedList = failed
            .map((h) => `${h.slice(0, 8)}...${h.slice(-8)}`)
            .join(", ");
          open?.({
            type: failed.length === 0 ? "success" : "error",
            message:
              failed.length === 0
                ? "All Streams Pinned"
                : "Pinning Partially Complete",
            description:
              failed.length === 0
                ? `Successfully pinned ${success.length} streams.`
                : `Successfully pinned ${success.length} of ${sdHashes.length} streams. Failed: ${failedList}`,
          });
        }
      } catch (error) {
        // Only show error notification if not already shown by bulk summary
        if (sdHashes.length === 1) {
          open?.({
            type: "error",
            message: "Pinning Failed",
            description: "An error occurred while pinning the stream.",
          });
        }
      }
    },
    [customMutate, open],
  );

  return {
    pinStreams,
    isMutating,
  };
}
