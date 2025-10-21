import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { CreditCard } from "lucide-react";

const routes = [
  {
    component: "account/subscriptions",
    id: "account_subscription",
    navigation: {
      icon: CreditCard,
      label: "Subscription",
    },
    path: "/subscription",
  },
] satisfies RouteDefinition[];

export default routes;
