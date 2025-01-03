import usePortalMeta from "@/hooks/usePortalMeta";

export default function useProtocolDomain(proto: string): string {
  const portalMeta = usePortalMeta();

  return `${proto}.${portalMeta?.domain}`;
}
