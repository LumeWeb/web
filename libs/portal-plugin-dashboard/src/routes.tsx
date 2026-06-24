import {
  CORE_NS,
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

import {
  Activity,
  Key,
  LayoutDashboard,
  Shield,
  User,
  UserCog,
} from "lucide-react";

const routes: RouteDefinition[] = [
  {
    component: "index",
    id: createNamespacedId(CORE_NS, "root"),
    path: "/",
  },
  {
    component: "dashboard",
    id: createNamespacedId(CORE_NS, "dashboard"),
    navigation: {
      icon: LayoutDashboard,
      label: "Dashboard",
      order: 0,
    },
    path: "/dashboard",
  },
  {
    component: "operations",
    id: createNamespacedId(CORE_NS, "operations"),
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
        id: createNamespacedId(CORE_NS, "account-index"),
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
        id: createNamespacedId(CORE_NS, "account-security"),
        navigation: {
          icon: Shield,
          label: "Security",
        },
        path: "security",
      },
      {
        component: "account/api-keys",
        id: createNamespacedId(CORE_NS, "account-api-keys"),
        navigation: {
          icon: Key,
          label: "API Keys",
        },
        path: "api-keys",
      },
    ],
    component: "account/layout",
    id: createNamespacedId(CORE_NS, "account-layout"),
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
    id: createNamespacedId(CORE_NS, "account-verify"),
    path: "account/verify",
  },
  {
    component: "loginIndex",
    id: createNamespacedId(CORE_NS, "login-index"),
    path: "login",
  },
  {
    component: "registerIndex",
    id: createNamespacedId(CORE_NS, "register-index"),
    path: "register",
  },
  {
    children: [
      {
        component: "resetPassword/reset",
        id: createNamespacedId(CORE_NS, "reset-password-index"),
        index: true,
        path: "",
      },
      {
        component: "resetPassword/confirm",
        id: createNamespacedId(CORE_NS, "reset-password-confirm"),
        path: "confirm",
      },
    ],
    component: "resetPassword/layout",
    id: createNamespacedId(CORE_NS, "reset-password-layout"),
    path: "reset-password",
  },
  {
    component: "loginOtp",
    id: createNamespacedId(CORE_NS, "otp-login"),
    path: "otp",
  },
] as const satisfies RouteDefinition[];

export default routes;
