import { DataTable, PageHeader, useDialog } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useDelete } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

import { createApiKeyDialogConfig } from "@/ui/dialogs/createApiKey";

import { ApiKeyAlertMessage } from "../components/ApiKeyAlertMessage";

interface APIKey {
  created_at: string;
  name: string;
  uuid: string;
}

const columnHelper = createColumnHelper<APIKey>();

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => (
      <span className="font-medium text-white">{info.getValue()}</span>
    ),
    header: "Name",
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => (
      <span className="text-gray-400">
        {format(new Date(info.getValue()), "MMM d, yyyy, hh:mm a")}
      </span>
    ),
    header: "Created",
  }),
];

export default function AccountApiKeys() {
  const { openDialog } = useDialog();
  const { mutate: deleteApiKey } = useDelete();

  const handleCreateClick = () => {
    openDialog(
      createApiKeyDialogConfig((key) => {
        openDialog({
          actionButtonsLayout: "horizonal",
          confirmText: "I've Saved My Key",
          description: <ApiKeyAlertMessage apiKey={key} />,
          size: "2xl",
          status: "warning",
          title: "API Key Created",
          type: "alert",
        });
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-col sm:flex-row">
        <PageHeader
          description="Manage your API keys for accessing your services"
          title="API Keys"
        />
        <Button className={"mt-2 sm:mt-0"} onClick={handleCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>
      <DataTable
        actionMenu={{
          items: [
            {
              icon: <Trash2 className="w-4 h-4 mr-2" />,
              label: "Delete",
              onClick: (row) => {
                openDialog({
                  confirmText: "Delete",
                  description: `Are you sure you want to delete the API key "${row.name}"? This action cannot be undone.`,
                  onConfirm: async () => {
                    await deleteApiKey({
                      id: row.uuid,
                      resource: "api-keys",
                      successNotification: () => ({
                        description: `The API key "${row.name}" has been deleted.`,
                        message: "API Key Deleted",
                        type: "success",
                      }),
                    });
                  },
                  title: "Delete API Key",
                  type: "confirm",
                  variant: "destructive",
                });
              },
            },
          ],
        }}
        columns={columns}
        emptyStateMessage="No API keys found. Create your first key to get started."
        pagination={true}
        resource={"api-keys"}
      />
    </div>
  );
}
