import usePortalMeta from "@/hooks/usePortalMeta.js";

export default function useProtocolDomain(proto: string): string {
  const portalMeta = usePortalMeta();

  return `${proto}.${portalMeta?.domain}`;
}
