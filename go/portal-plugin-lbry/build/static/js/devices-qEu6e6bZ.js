import { createLucideIcon, jsxRuntimeExports } from './createLucideIcon-BXTHeo5K.js';
import { schema, core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, schema$1, core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__, core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, createColumnHelper, Trash2, format } from './updateDevice.schema-tg5433Ro.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode);

function createDeviceForm() {
  return {
    action: "create",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Device Name",
        name: "name",
        placeholder: "e.g., Home PC, Work Laptop",
        required: true,
        type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      },
      {
        label: "IP Address",
        name: "ip_address",
        placeholder: "e.g., 192.168.1.1 or 2001:db8::1",
        required: true,
        type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      }
    ],
    refine: true,
    resource: "lbry/devices",
    successNotification: () => ({
      description: `The device has been added to your device list.`,
      message: "Device Added",
      type: "success"
    }),
    validationSchema: schema
  };
}

function updateDeviceForm(deviceId) {
  return {
    action: "edit",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Device Name",
        name: "name",
        required: true,
        type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      }
    ],
    id: deviceId,
    refine: true,
    resource: "lbry/devices",
    successNotification: () => ({
      description: `The device has been updated.`,
      message: "Device Updated",
      type: "success"
    }),
    validationSchema: schema$1
  };
}

function createDeviceDialogConfig() {
  return {
    formConfig: createDeviceForm(),
    size: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComponentSize.MD,
    title: "Add Device",
    type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

function editDeviceDialogConfig(deviceId) {
  return {
    formConfig: updateDeviceForm(deviceId),
    size: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.ComponentSize.MD,
    title: "Edit Device",
    type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

function deleteDeviceDialogConfig(deviceName, onConfirm) {
  return {
    confirmText: "Delete",
    description: `Are you sure you want to remove "${deviceName}" from your device list? This action cannot be undone.`,
    onConfirm,
    title: "Delete Device",
    type: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.CONFIRM,
    variant: "destructive"
  };
}

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.accessor("name", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: info.getValue() }),
    header: "Name"
  }),
  columnHelper.accessor("ip_address", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm", children: info.getValue() }),
    header: "IP Address"
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-400", children: format(new Date(info.getValue()), "MMM d, yyyy h:mm a") }),
    header: "Added"
  })
];
function Devices() {
  const { openDialog } = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const { mutate: deleteDevice } = core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDelete();
  const handleCreateClick = () => {
    openDialog(createDeviceDialogConfig());
  };
  const handleEditClick = (device) => {
    openDialog(editDeviceDialogConfig(device.id));
  };
  const handleDeleteClick = (device) => {
    openDialog(
      deleteDeviceDialogConfig(device.name, async () => {
        await deleteDevice({
          id: device.id,
          resource: "lbry/devices"
        });
      })
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(core_lbry__loadShare___mf_0_refinedev_mf_1_core__loadShare__.Authenticated, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.GeneralLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.PageHeader,
        {
          description: "Manage devices in your LBRY device list. Devices in the list can upload content to your account.",
          title: "Devices"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "mt-2 sm:mt-0", onClick: handleCreateClick, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Add Device"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DataTable,
      {
        actionMenu: {
          items: [
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "mr-2 h-4 w-4" }),
              label: "Edit",
              onClick: (row) => {
                handleEditClick(row);
              }
            },
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              label: "Delete",
              onClick: (row) => {
                handleDeleteClick(row);
              }
            }
          ]
        },
        columns,
        emptyStateMessage: "No devices in your device list. Add your first device to allow it to upload content to your account.",
        pagination: true,
        resource: "lbry/devices",
        responsive: true
      }
    )
  ] }) }) }, "lbry-devices");
}

export { Devices as default };
