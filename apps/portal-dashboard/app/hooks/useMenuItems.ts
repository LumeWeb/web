import { useAppStore } from "@/stores/app.js";

export default function useMenuItems() {
  const menuItems = useAppStore((state) => state.menuItems);
  const addMenuItem = useAppStore((state) => state.addMenuItem);
  const removeMenuItem = useAppStore((state) => state.removeMenuItem);
  const getMenuItems = useAppStore((state) => state.getMenuItems);

  return {
    menuItems,
    addMenuItem,
    removeMenuItem,
    getMenuItems,
  };
}
