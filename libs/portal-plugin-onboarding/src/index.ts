import {
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
      { id: "core:dashboard" },
      { id: "core:billing" },
      { id: "core:ipfs" },
      { id: "ipfs:refine-config" },
    ],
    async destroy(_framework: Framework) {
    },
    id: createNamespacedId("core", "onboarding"),
    async initialize(_framework: Framework) {
    },
    queryParamConfig: QUERY_PARAM_CONFIG,
    routes,
    widgets,
  } satisfies Plugin;
}
