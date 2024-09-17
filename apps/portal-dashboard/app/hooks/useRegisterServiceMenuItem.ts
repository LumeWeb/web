import { useAppStore } from "@/stores/app.js";
import BaseService from "@/services/base.js";
import { SERVICE_MENU_KEY } from "@/menuConfig.js";

export function useRegisterServiceMenuItem() {
  const addMenuItem = useAppStore((state) => state.addMenuItem);

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
