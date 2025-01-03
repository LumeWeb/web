import useAccountSubdomain from "@/hooks/useAccountSubdomain";

export default function useResetPasswordUrl() {
  const accountSubdomain = useAccountSubdomain();
  return `https://${accountSubdomain}/reset-password`;
}
