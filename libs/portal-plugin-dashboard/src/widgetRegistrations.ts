import type { WidgetRegistration } from "@lumeweb/portal-framework-core";

export const widgetRegistrations = [
  {
    area: "core:dashboard:header",
    componentName: "widgets/account/emailVerificationBanner",
  },
  {
    area: "core:dashboard:profile",
    cols: 1,
    componentName: "widgets/account/bio",
    rows: 1,
  },
  {
    area: "core:dashboard:profile",
    cols: 2,
    componentName: "widgets/account/profile",
    rows: 2,
  },
  {
    area: "core:dashboard:profile",
    cols: 2,
    componentName: "widgets/account/delete",
    rows: 2,
  },
  {
    area: "core:dashboard:security",
    cols: 2,
    componentName: "widgets/account/password",
    rows: 2,
  },
  {
    area: "core:dashboard:security",
    cols: 2,
    componentName: "widgets/account/2fa",
    rows: 2,
  },
] satisfies WidgetRegistration[];

export default widgetRegistrations;
