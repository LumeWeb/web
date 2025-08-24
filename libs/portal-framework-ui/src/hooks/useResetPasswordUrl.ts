import { useAccountUrl } from "@/hooks/useAccountUrl";

export function useResetPasswordUrl() {
  return useAccountUrl("/reset-password");
}
