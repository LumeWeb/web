import { useDialog } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useUpdatePassword } from "@refinedev/core";
import { Key } from "lucide-react";
import { updatePasswordDialogConfig } from "src/ui/dialogs/updatePassword";

import { Card } from "@/ui/components/Card";

export default function Password() {
  const { mutateAsync: updatePassword } = useUpdatePassword();
  const { openDialog } = useDialog();
  return (
    <Card
      border
      description="Manage your account password"
      icon={Key}
      title="Password">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="w-2 h-2 bg-muted rounded-full" key={i} />
          ))}
        </div>
        <span>••••••••</span>
      </div>
      <Button
        className="w-full h-11 whitespace-normal md:h-9 md:whitespace-nowrap"
        onClick={(e) => {
          e.preventDefault();
          openDialog(updatePasswordDialogConfig(updatePassword));
        }}>
        Change Password
      </Button>
    </Card>
  );
}
