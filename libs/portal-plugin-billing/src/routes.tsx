import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Coins = lazyIcon("Coins");
const CreditCard = lazyIcon("CreditCard");


const routes = [
  {
    component: "account/subscription",
    id: createNamespacedId("billing", "subscription"),
    navigation: {
      icon: CreditCard,
      label: "Subscription",
    },
    path: "/account/subscription",
  },
  {
    component: "account/credits",
    id: createNamespacedId("billing", "credits"),
    navigation: {
      icon: Coins,
      label: "Credits",
    },
    path: "/credits",
  },
] satisfies RouteDefinition[];

export default routes;
