import { MenuItem } from "portal-shared/types";
import { ClockIcon } from "portal-shared/components/icons";
import { LayoutDashboardIcon, SettingsIcon } from "lucide-react";

export const menuConfig: MenuItem[] = [
  {
    key: "main",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    path: "/",
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
    path: "/settings",
  },
  {
    key: "cron",
    label: "Cron",
    icon: ClockIcon,
    path: "/cron",
  },
];
