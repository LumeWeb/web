import { MenuItem } from "portal-shared/types";
import { ClockIcon } from "portal-shared/components/icons";

export const SERVICE_MENU_KEY = "service";

export const menuConfig: MenuItem[] = [
  {
    key: "main",
    label: "Dashboard",
    icon: ClockIcon,
    path: "/",
  },
];
