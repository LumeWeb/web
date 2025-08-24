import { useAccountUrl } from "@/hooks/useAccountUrl";

export function useLoginUrl() {
  return useAccountUrl("/login");
}
