import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { Coins, CreditCard } from "lucide-react";

const routes = [
  {
    component: "account/subscription",
    id: "account_subscription",
    navigation: {
      icon: CreditCard,
      label: "Subscription",
    },
    path: "/account/subscription",
  },
  {
    component: "account/credits",
    id: "account_credits",
    navigation: {
      icon: Coins,
      label: "Credits",
    },
    path: "/credits",
  },
] satisfies RouteDefinition[];

export default routes;
