import { useAppStore } from "@/store/appStore";

export function useMenuItems() {
  const menuItems = useAppStore((state) => state.menuItems);
  const addMenuItem = useAppStore((state) => state.addMenuItem);
  const removeMenuItem = useAppStore((state) => state.removeMenuItem);

  return {
    addMenuItem,
    getMenuItems: () => menuItems,
    menuItems,
    removeMenuItem,
  };
}
