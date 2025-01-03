import { r as reactExports } from "./jsx-runtime-CzXAEjbZ.js";
import { d as usePortalUrl, u as useBaseStore, f as fetchPortalMeta } from "./usePortalUrl-CWejBXEP.js";
function usePortalMeta() {
  const portalUrl = usePortalUrl();
  const portalMeta = useBaseStore((state) => state.meta);
  const setPortalMeta = useBaseStore((set) => set.setMeta);
  reactExports.useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      setPortalMeta(data);
    });
  }, [portalUrl]);
  return portalMeta;
}
export {
  usePortalMeta as u
};
