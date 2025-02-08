import { useAccountSubdomain } from "@/hooks/useAccountSubdomain";
import { getCurrentLocation } from "@lumeweb/portal-framework-core";

export function useRegisterUrl() {
  const accountSubdomain = useAccountSubdomain();
  const { protocol } = getCurrentLocation();
  return `${protocol}//${accountSubdomain}/register`;
}
