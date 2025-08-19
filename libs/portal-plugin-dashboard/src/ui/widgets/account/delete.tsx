import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useDelete, useLogout } from "@refinedev/core";
import { AlertTriangle } from "lucide-react";

import { Card } from "@/ui/components/Card";
import { deleteAccountDialogConfig } from "@/ui/dialogs/deleteAccount";

export default function DeleteAccount() {
  const { openDialog } = useDialog();
  const { mutateAsync: logout } = useLogout();
  const deleteMutator = useDelete();

  const handleDeleteClick = () => {
    openDialog(deleteAccountDialogConfig(deleteMutator, logout, openDialog));
  };

  return (
    <Card
      border
      description="Permanently delete your account and all data"
      icon={AlertTriangle}
      title="Delete Account">
      <Button
        className="w-full"
        onClick={handleDeleteClick}
        variant="destructive">
        Delete Account
      </Button>
    </Card>
  );
}
