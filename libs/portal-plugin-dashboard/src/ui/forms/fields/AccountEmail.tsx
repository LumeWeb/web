import {
  Input,
  registerFormComponent,
  useDialog,
  useFormContext,
} from "@lumeweb/portal-framework-ui";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { useCustomMutation } from "@refinedev/core";
import { Mail } from "lucide-react";
import React from "react";

import { updateEmailDialogConfig } from "@/ui/dialogs/updateEmail";

interface AccountEmailProps {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
  value: string;
}

const AccountEmail = React.forwardRef<HTMLDivElement, AccountEmailProps>(
  ({ className = "", value }, ref) => {
    const { openDialog } = useDialog();
    const { formInstance } = useFormContext();

    const refetch =
      "refineCore" in formInstance &&
      formInstance.refineCore?.queryResult?.refetch
        ? formInstance.refineCore.queryResult.refetch
        : undefined;

    const customHook = useCustomMutation<FormValues>();

    return (
      <div
        className={cn("flex w-full items-center gap-2", className)}
        ref={ref}>
        <Input
          className="w-full text-white"
          fullWidth={true}
          id="email"
          readOnly
          type="email"
          value={value}
        />
        <Button
          className="bg-transparent hover:text-white"
          onClick={(e) => {
            e.preventDefault();
            openDialog(updateEmailDialogConfig(customHook, refetch));
          }}
          size="sm"
          variant="outline">
          <Mail className="h-4 w-4" />
        </Button>
      </div>
    );
  },
);

export function registerInput() {
  registerFormComponent("dashboard:account.email", AccountEmail);
}
