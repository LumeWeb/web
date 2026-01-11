import {
  ComponentSize,
  DialogConfig,
  DialogTypes,
} from "@lumeweb/portal-framework-ui";

import { createDeviceForm } from "@/ui/forms";

export function createDeviceDialogConfig(): DialogConfig {
  return {
    formConfig: createDeviceForm(),
    size: ComponentSize.MD,
    title: "Add Device",
    type: DialogTypes.FORM,
  };
}
