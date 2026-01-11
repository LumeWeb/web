import {
  ComponentSize,
  DialogConfig,
  DialogTypes,
} from "@lumeweb/portal-framework-ui";

import { updateDeviceForm } from "@/ui/forms";

export function editDeviceDialogConfig(deviceId: number): DialogConfig {
  return {
    formConfig: updateDeviceForm(deviceId),
    size: ComponentSize.MD,
    title: "Edit Device",
    type: DialogTypes.FORM,
  };
}
