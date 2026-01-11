import { DialogConfig, DialogTypes } from "@lumeweb/portal-framework-ui";

import { createDeviceForm } from "@/ui/forms";
import { ComponentSize } from "@lumeweb/portal-framework-ui";

export function createDeviceDialogConfig(): DialogConfig {
  return {
    formConfig: createDeviceForm(),
    size: ComponentSize.MD,
    title: "Add Device",
    type: DialogTypes.FORM,
  };
}
