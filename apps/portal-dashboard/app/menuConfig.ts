import { MenuItem } from "./types";
import {
  ClockIcon,
  CircleLockIcon,
  CloudUploadSolidIcon,
} from "./components/icons";

export const SERVICE_MENU_KEY = "service";

export const menuConfig: MenuItem[] = [
  {
    key: "main",
    label: "Dashboard",
    icon: ClockIcon,
    path: "/",
  },
  {
    key: SERVICE_MENU_KEY,
    label: "Services",
    icon: ClockIcon,
  },
  {
    key: "account",
    label: "My Account",
    icon: CircleLockIcon,
    path: "/account",
    children: [
      {
        key: "subscription",
        label: "Subscription",
        path: "/account/subscription",
      },
      {
        key: "api-keys",
        label: "API Keys",
        path: "/account/api-keys",
      },
    ],
  },
  {
    key: "uploads",
    label: "Uploads",
    icon: CloudUploadSolidIcon,
    path: "/uploads",
  },
];
