import {
  createNamespacedId,
  type WidgetRegistration,
} from "@lumeweb/portal-framework-core";

import { useOnboardingStatus } from "@/hooks";

export const widgetRegistrations: WidgetRegistration[] = [
  {
    areaId: createNamespacedId("dashboard", "header"),
    componentName: "widgets/onboarding/checklist",
    id: createNamespacedId("onboarding", "checklist"),
    order: -1,
    position: {
      size: {
        height: 2,
        width: 12,
      },
    },
    visibilityHook() {
      const { isComplete, isBusy } = useOnboardingStatus();
      if (isBusy) {
        return true;
      }

      return !isComplete;
    },
  },
];

export default {
  areas: [],
  widgets: widgetRegistrations,
};
