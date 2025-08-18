const routes = [
  {
    component: "index",
    id: "root",
    navigation: {
      label: "Home",
      order: 0,
    },
    path: "/",
  },
  {
    component: "dashboard",
    id: "dashboard",
    path: "/dashboard",
  },
  {
    children: [
      {
        component: "account/profile",
        id: "account_index",
        index: true,
        path: "",
      },
      {
        component: "account/security",
        id: "account_security",
        path: "security",
      },
      {
        component: "account/api-keys",
        id: "account_api_keys",
        path: "api-keys",
      },
    ],
    component: "account/layout",
    id: "account_layout",
    navigation: {
      label: "My Account",
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
];

export default routes;
