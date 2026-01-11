import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

import schema from "./updateDevice.schema";

export function updateDeviceForm(deviceId: number): FormConfig {
  return {
    action: "edit",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Device Name",
        name: "name",
        required: true,
        type: FormFieldType.TEXT,
      },
    ],
    id: deviceId,
    refine: true,
    resource: "lbry/devices",
    successNotification: () => ({
      description: `The device has been updated.`,
      message: "Device Updated",
      type: "success",
    }),
    validationSchema: schema,
  };
}
