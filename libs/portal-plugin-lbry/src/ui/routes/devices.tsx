import {
  DataTable,
  GeneralLayout,
  PageHeader,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Authenticated, useDelete } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";

import {
  createDeviceDialogConfig,
  deleteDeviceDialogConfig,
  editDeviceDialogConfig,
} from "@/ui/dialogs";
import type { DeviceResponse } from "@/client";

const columnHelper = createColumnHelper<DeviceResponse>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    header: "Name",
  }),
  columnHelper.accessor("ip_address", {
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
    header: "IP Address",
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => (
      <span className="text-sm text-gray-400">
        {format(new Date(info.getValue()), "MMM d, yyyy h:mm a")}
      </span>
    ),
    header: "Added",
  }),
];

export default function Devices() {
  const { openDialog } = useDialog();
  const { mutate: deleteDevice } = useDelete();

  const handleCreateClick = () => {
    openDialog(createDeviceDialogConfig());
  };

  const handleEditClick = (device: DeviceResponse) => {
    openDialog(editDeviceDialogConfig(device.id));
  };

  const handleDeleteClick = (device: DeviceResponse) => {
    openDialog(
      deleteDeviceDialogConfig(device.name, async () => {
        await deleteDevice({
          id: device.id,
          resource: "lbry/devices",
        });
      }),
    );
  };

  return (
    <Authenticated key="lbry-devices">
      <GeneralLayout>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <PageHeader
              description="Manage devices in your LBRY device list. Devices in the list can upload content to your account."
              title="Devices"
            />
            <Button className="mt-2 sm:mt-0" onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </div>
          <DataTable
            actionMenu={{
              items: [
                {
                  icon: <Edit className="mr-2 h-4 w-4" />,
                  label: "Edit",
                  onClick: (row) => {
                    handleEditClick(row);
                  },
                },
                {
                  icon: <Trash2 className="mr-2 h-4 w-4" />,
                  label: "Delete",
                  onClick: (row) => {
                    handleDeleteClick(row);
                  },
                },
              ],
            }}
            columns={columns}
            emptyStateMessage="No devices in your device list. Add your first device to allow it to upload content to your account."
            pagination={true}
            resource="lbry/devices"
            responsive={true}
          />
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
