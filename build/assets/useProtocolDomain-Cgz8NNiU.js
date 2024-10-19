import { H as usePortalMeta } from "./createLucideIcon-eCGisUfw.js";
function useProtocolDomain(proto) {
  const portalMeta = usePortalMeta();
  return `${proto}.${portalMeta == null ? void 0 : portalMeta.domain}`;
}
export {
  useProtocolDomain as u
};
