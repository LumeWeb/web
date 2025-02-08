import { useAccountSubdomain } from "@/hooks/useAccountSubdomain";

export function useResetPasswordUrl() {
  const accountSubdomain = useAccountSubdomain();
  return `https://${accountSubdomain}/reset-password`;
}
