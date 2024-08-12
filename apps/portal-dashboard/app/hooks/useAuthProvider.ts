import { createPortalAuthProvider } from "~/dataProviders/authProvider";
import { useMemo } from "use-memo-one";
import { Sdk } from "@lumeweb/portal-sdk";

export function useAuthProvider(sdk?: Sdk) {
  return useMemo(() => {
    if (!sdk) return undefined;
    return createPortalAuthProvider(sdk);
  }, [sdk]);
}
