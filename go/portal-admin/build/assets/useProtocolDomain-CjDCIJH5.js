import { F as usePortalMeta } from "./createLucideIcon-BCL4v026.js";
function useProtocolDomain(proto) {
  const portalMeta = usePortalMeta();
  return `${proto}.${portalMeta == null ? void 0 : portalMeta.domain}`;
}
export {
  useProtocolDomain as u
};
