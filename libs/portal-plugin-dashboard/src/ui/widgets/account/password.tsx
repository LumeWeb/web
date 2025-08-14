import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { useDialog } from "@lumeweb/portal-framework-ui";
import { Key } from "lucide-react";
import { useUpdatePassword } from "@refinedev/core";
import { updatePasswordDialogConfig } from "src/ui/dialogs/updatePassword";

export default function Password() {
  const { mutateAsync: updatePassword } = useUpdatePassword();
  const { openDialog } = useDialog();
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Password
        </CardTitle>
        <CardDescription>Manage your account password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-muted rounded-full" />
            ))}
          </div>
          <span>••••••••</span>
        </div>
        <Button
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            openDialog(updatePasswordDialogConfig(updatePassword));
          }}>
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
}
