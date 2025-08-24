import { useAccountUrl } from "@/hooks/useAccountUrl";

export function useRegisterUrl() {
  return useAccountUrl("/register");
}
