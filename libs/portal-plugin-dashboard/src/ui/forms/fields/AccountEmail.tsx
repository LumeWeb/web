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
        className={cn("flex items-center gap-2 w-full", className)}
        ref={ref}>
        <Input
          className="text-white w-full"
          fullWidth={true}
          id="email"
          readOnly
          type="email"
          value={value}
        />
        <Button
          className="hover:text-white bg-transparent"
          onClick={(e) => {
            e.preventDefault();
            openDialog(updateEmailDialogConfig(customHook, refetch));
          }}
          size="sm"
          variant="outline">
          <Mail className="w-4 h-4" />
        </Button>
      </div>
    );
  },
);

export function registerInput() {
  registerFormComponent("core:dashboard:account.email", AccountEmail);
}
