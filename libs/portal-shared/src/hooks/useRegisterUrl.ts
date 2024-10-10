import useAccountSubdomain from "@/hooks/useAccountSubdomain";

export default function useRegisterUrl() {
  const accountSubdomain = useAccountSubdomain();
  return `https://${accountSubdomain}/register`;
}
