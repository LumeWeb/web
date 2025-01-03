import { useCallback } from "use-memo-one";
import { AuthProvider } from "@refinedev/core";

export function useCheckAuth(authProvider?: AuthProvider) {
  return useCallback(async () => {
    if (!authProvider) return false;
    try {
      const ret = await authProvider.check();
      return ret.authenticated;
    } catch {
      return false;
    }
  }, [authProvider]);
}
