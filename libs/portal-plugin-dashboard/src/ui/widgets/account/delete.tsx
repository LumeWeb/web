import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useDelete, useLogout } from "@refinedev/core";

import { Card } from "@/ui/components/Card";
import { deleteAccountDialogConfig } from "@/ui/dialogs/deleteAccount";
const AlertTriangle = lazyIcon("AlertTriangle");


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
        className="h-11 w-full whitespace-normal md:h-9 md:whitespace-nowrap"
        onClick={handleDeleteClick}
        variant="destructive">
        Delete Account
      </Button>
    </Card>
  );
}
