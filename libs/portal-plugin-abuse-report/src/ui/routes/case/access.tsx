import { ReportLayout } from "@/ui/components/layout";
import {
  ActionItemType,
  FormFieldType,
  SchemaForm,
  SchemaFormProps,
} from "@lumeweb/portal-framework-ui";
import { Card } from "@lumeweb/portal-framework-ui-core";
import { useLogin } from "@refinedev/core";
import React from "react";
import { z } from "zod";

const accessSchema = z.object({
  token: z.string().min(1, "Access token is required"),
});

function Access() {
  const { mutate: login } = useLogin();

  const onSubmit = (data: z.infer<typeof accessSchema>) => {
    login(
      { accessKey: data.token },
      {
        onError: (error) => {
          console.error("Login error:", error);
        },
      },
    );
  };

  const formConfig: SchemaFormProps<z.infer<typeof accessSchema>>["config"] = {
    actionButtons: [
      {
        className:
          "h-10 px-8 rounded-full bg-button hover:bg-button-hover text-foreground mx-auto",
        label: "View Report Status",
        type: ActionItemType.SUBMIT,
      },
    ],
    adapter: "rhf",
    fields: [
      {
        label: "Access Token",
        name: "token",
        required: true,
        type: FormFieldType.TEXT, // Use enum member
      },
    ],
    onSubmit: onSubmit,
    submitLabel: "View Report Status",
    validationSchema: accessSchema,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium tracking-tight text-foreground mb-2">
              Access Your Report
            </h1>
            <p className="text-sm text-foreground/80">
              Enter the access token that was provided when you submitted your
              report
            </p>
          </div>

          <Card className="border-none bg-card p-6">
            <SchemaForm config={formConfig} />
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Access;
