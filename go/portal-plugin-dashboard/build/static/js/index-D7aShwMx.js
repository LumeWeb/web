import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-YjtT0XC7.js';

const routes = [
  {
    component: "Index",
    id: "root",
    navigation: {
      label: "Home",
      order: 0
    },
    path: "/"
  },
  {
    component: "Dashboard",
    id: "dashboard",
    path: "/dashboard"
  },
  {
    component: "AccountVerify",
    id: "account_verify",
    path: "account/verify"
  },
  {
    component: "LoginIndex",
    id: "login_index",
    path: "login"
  },
  {
    component: "RegisterIndex",
    id: "register_index",
    path: "register"
  },
  {
    children: [
      {
        component: "ResetPasswordReset",
        id: "reset_password_index",
        index: true,
        path: ""
      },
      {
        component: "ResetPasswordConfirm",
        id: "reset_password_confirm",
        path: "confirm"
      }
    ],
    component: "ResetPasswordLayout",
    id: "reset_password_layout",
    path: "reset-password"
  },
  {
    component: "LoginOtp",
    id: "otp_login",
    path: "otp"
  }
];

function index() {
  return {
    id: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "dashboard"),
    routes,
    async destroy(_framework) {
      console.log("Plugin Dashboard destroyed");
    },
    async initialize(_framework) {
      console.log("Plugin Dashboard initialized");
    }
  };
}

export { index as default };
