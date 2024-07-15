import BaseService from "@/services/base.js";
import { SERVICE_MENU_KEY } from "@/menuConfig.js";
import { useBaseStore } from "portal-shared/store/baseStore";

export function useRegisterServiceMenuItem() {
  const addMenuItem = useBaseStore((state) => state.addMenuItem);

  return (svc: BaseService) => {
    addMenuItem(
      {
        key: `service-${svc.id()}`,
        label: svc.name(),
        path: `/service/${svc.id()}`,
      },
      SERVICE_MENU_KEY,
    );
  };
}
