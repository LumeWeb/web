import {
  Input,
  registerFormComponent,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { Mail } from "lucide-react";
import { updateEmailDialogConfig } from "@/ui/dialogs/updateEmail";
import React from "react";
import { useCustomMutation } from "@refinedev/core";
import { useFormContext } from "@lumeweb/portal-framework-ui";
import { UseFormReturnType } from "@refinedev/react-hook-form";

interface AccountEmailProps {
  value: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const AccountEmail = React.forwardRef<HTMLDivElement, AccountEmailProps>(
  ({ value, className = "" }, ref) => {
    const { openDialog } = useDialog();
    const { formInstance } = useFormContext();

    const refetch =
      "refineCore" in formInstance &&
      formInstance.refineCore?.queryResult?.refetch
        ? formInstance.refineCore.queryResult.refetch
        : undefined;

    const customHook = useCustomMutation();

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 w-full", className)}>
        <Input
          id="email"
          type="email"
          value={value}
          readOnly
          className="text-white w-full"
          fullWidth={true}
        />
        <Button
          size="sm"
          variant="outline"
          className="hover:text-white bg-transparent"
          onClick={(e) => {
            e.preventDefault();
            openDialog(updateEmailDialogConfig(customHook as any, refetch));
          }}>
          <Mail className="w-4 h-4" />
        </Button>
      </div>
    );
  },
);

export function registerInput() {
  registerFormComponent("core:dashboard:account.email", AccountEmail);
}
