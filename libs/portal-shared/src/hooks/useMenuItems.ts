import { useBaseStore } from "@/store/baseStore";

export default function useMenuItems() {
  const menuItems = useBaseStore((state) => state.menuItems);
  const addMenuItem = useBaseStore((state) => state.addMenuItem);
  const removeMenuItem = useBaseStore((state) => state.removeMenuItem);
  const getMenuItems = useBaseStore((state) => state.getMenuItems);

  return {
    menuItems,
    addMenuItem,
    removeMenuItem,
    getMenuItems,
  };
}
