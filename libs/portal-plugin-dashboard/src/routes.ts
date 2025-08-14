const routes = [
  {
    component: "Index",
    id: "root",
    navigation: {
      label: "Home",
      order: 0,
    },
    path: "/",
  },
  {
    component: "Dashboard",
    id: "dashboard",
    path: "/dashboard",
  },
  {
    component: "account/layout",
    id: "account_layout",
    path: "/account",
    navigation: {
      label: "My Account",
    },
    children: [
      {
        component: "account/profile",
        id: "account_index",
        path: "",
        index: true,
      },
      {
        component: "account/security",
        id: "account_security",
        path: "security",
      },
    ],
  },
  {
    component: "AccountVerify",
    id: "account_verify",
    path: "account/verify",
  },
  {
    component: "LoginIndex",
    id: "login_index",
    path: "login",
  },
  {
    component: "RegisterIndex",
    id: "register_index",
    path: "register",
  },
  {
    children: [
      {
        component: "ResetPasswordReset",
        id: "reset_password_index",
        index: true,
        path: "",
      },
      {
        component: "ResetPasswordConfirm",
        id: "reset_password_confirm",
        path: "confirm",
      },
    ],
    component: "ResetPasswordLayout",
    id: "reset_password_layout",
    path: "reset-password",
  },
  {
    component: "LoginOtp",
    id: "otp_login",
    path: "otp",
  },
];

export default routes;
