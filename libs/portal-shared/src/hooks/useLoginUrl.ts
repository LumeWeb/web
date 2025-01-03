import useAccountSubdomain from "@/hooks/useAccountSubdomain";

export default function useLoginUrl() {
  const accountSubdomain = useAccountSubdomain();
  return `https://${accountSubdomain}/login`;
}
