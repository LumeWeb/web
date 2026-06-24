import {
  CORE_NS,
  createNamespacedId,
  Framework,
  type Plugin,
  type QueryParamPersistConfig,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import { OnboardingIntent } from "./types";
import widgets from "./widgetRegistrations";
import routes from "./routes";

export const QUERY_PARAM_CONFIG: QueryParamPersistConfig[] = [
  {
    param: "intent",
    validate: (value): value is OnboardingIntent =>
      value === OnboardingIntent.Pinning || value === OnboardingIntent.Hosting,
  },
];

export default function (): Plugin {
  return {
    capabilities: [new RefineConfigCapability()],
    dependencies: [
      { id: createNamespacedId(CORE_NS, "dashboard") },
      { id: createNamespacedId(CORE_NS, "billing") },
      { id: createNamespacedId(CORE_NS, "ipfs") },
      { id: createNamespacedId("ipfs", "refine-config") },
    ],
    async destroy(_framework: Framework) {
    },
    id: createNamespacedId(CORE_NS, "onboarding"),
    async initialize(_framework: Framework) {
    },
    queryParamConfig: QUERY_PARAM_CONFIG,
    routes,
    widgets,
  } satisfies Plugin;
}
