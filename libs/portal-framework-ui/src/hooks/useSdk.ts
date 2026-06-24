import { Sdk } from "@lumeweb/portal-sdk";
import { useEffect, useRef } from "react";

import { useApiUrl } from "@/hooks/useApiUrl"; // Import the updated useApiUrl hook
import { useAppStore } from "@/store/appStore";

// Global flag to ensure SDK is initialized only once across all instances
let isGloballyInitialized = false;

// For testing purposes only
export const resetGloballyInitialized = () => {
  isGloballyInitialized = false;
};

export function useSdk() {
  // Use the useApiUrl hook to get the API base URL
  const apiUrl = useApiUrl();
  const sdk = useAppStore((state) => state.sdk);
  const setSdk = useAppStore((state) => state.setSdk);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    // Initialize SDK only when apiUrl is available (non-empty string)
    if (apiUrl && !isGloballyInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;
      const initializeSdk = () => {
        if (!isGloballyInitialized) {
          isGloballyInitialized = true;
          // Pass the determined apiUrl to the Sdk constructor
          const newSdk = new Sdk(apiUrl);
          setSdk(newSdk);
        }
      };

      initializeSdk();
    }
  }, [apiUrl, setSdk]); // Update dependency array to depend on apiUrl

  return sdk;
}
