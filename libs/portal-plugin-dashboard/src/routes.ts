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
    children: [
      {
        component: "Account",
        id: "account_index",
        index: true,
        path: "",
      },
      {
        component: "Subscription",
        id: "account_subscription",
        navigation: {
          label: "Subscription",
          order: 2,
        },
        path: "subscription",
      },
      {
        component: "ApiKeys",
        id: "account_api_keys",
        navigation: {
          label: "API Keys",
          order: 3,
        },
        path: "api-keys",
      },
      {
        component: "Security",
        id: "account_security",
        navigation: {
          label: "Security",
          order: 4,
        },
        path: "security",
      },
    ],
    component: "AccountLayout",
    id: "account_layout",
    navigation: {
      label: "Account",
      order: 1,
    },
    path: "account",
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
  {
    component: "UploadsIndex",
    id: "uploads_index",
    path: "uploads",
  },
];

export default routes;
