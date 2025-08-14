import type { WidgetRegistration } from "@lumeweb/portal-framework-core";

export const widgetRegistrations = [
  {
    area: "core:header",
    componentName: "EmailVerificationBanner",
  },
  {
    area: "core:dashboard:profile",
    componentName: "widgets/account/bio",
    cols: 1,
    rows: 1,
  },
  {
    area: "core:dashboard:profile",
    componentName: "widgets/account/profile",
    cols: 2,
    rows: 2,
  },
  {
    area: "core:dashboard:security",
    componentName: "widgets/account/password",
    cols: 2,
    rows: 2,
  },
  {
    area: "core:dashboard:security",
    componentName: "widgets/account/2fa",
    cols: 2,
    rows: 2,
  },
] satisfies WidgetRegistration[];

export default widgetRegistrations;
