import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

import schema from "./createDevice.schema";

export function createDeviceForm(): FormConfig {
  return {
    action: "create",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Device Name",
        name: "name",
        placeholder: "e.g., Home PC, Work Laptop",
        required: true,
        type: FormFieldType.TEXT,
      },
      {
        label: "IP Address",
        name: "ip_address",
        placeholder: "e.g., 192.168.1.1 or 2001:db8::1",
        required: true,
        type: FormFieldType.TEXT,
      },
    ],
    refine: true,
    resource: "lbry/devices",
    successNotification: () => ({
      description: `The device has been added to your device list.`,
      message: "Device Added",
      type: "success",
    }),
    validationSchema: schema,
  };
}
