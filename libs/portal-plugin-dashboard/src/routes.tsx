import type { RouteDefinition } from "@lumeweb/portal-framework-core";

import {
  Activity,
  Folder,
  Key,
  LayoutDashboard,
  Shield,
  User,
  UserCog,
} from "lucide-react";

const routes = [
  {
    component: "index",
    id: "root",
    path: "/",
  },
  {
    component: "dashboard",
    id: "dashboard",
    navigation: {
      icon: LayoutDashboard,
      label: "Dashboard",
      order: 0,
    },
    path: "/dashboard",
  },
  {
    component: "operations",
    id: "operations",
    navigation: {
      icon: Activity,
      label: "Operations",
      order: 2,
    },
    path: "/operations",
  },
  {
    children: [
      {
        component: "account/profile",
        id: "account_index",
        index: true,
        navigation: {
          forceShowInNavigation: true,
          icon: User,
          label: "Profile",
        },
        path: "",
      },
      {
        component: "account/security",
        id: "account_security",
        navigation: {
          icon: Shield,
          label: "Security",
        },
        path: "security",
      },
      {
        component: "account/api-keys",
        id: "account_api_keys",
        navigation: {
          icon: Key,
          label: "API Keys",
        },
        path: "api-keys",
      },
    ],
    component: "account/layout",
    id: "account_layout",
    navigation: {
      icon: UserCog,
      label: "My Account",
      linkable: false,
      order: 3,
    },
    path: "/account",
  },
  {
    component: "account/verify",
    id: "account_verify",
    path: "account/verify",
  },
  {
    component: "loginIndex",
    id: "login_index",
    path: "login",
  },
  {
    component: "registerIndex",
    id: "register_index",
    path: "register",
  },
  {
    children: [
      {
        component: "resetPassword/reset",
        id: "reset_password_index",
        index: true,
        path: "",
      },
      {
        component: "resetPassword/confirm",
        id: "reset_password_confirm",
        path: "confirm",
      },
    ],
    component: "resetPassword/layout",
    id: "reset_password_layout",
    path: "reset-password",
  },
  {
    component: "loginOtp",
    id: "otp_login",
    path: "otp",
  },
] satisfies RouteDefinition[];

export default routes;
