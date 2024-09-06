import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useUpdatePassword } from "@refinedev/core";
import { useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UpdatePasswordFormRequest } from "@/dataProviders/authProvider";
import schema from "./ChangeEmailForm.schema";
import { Field } from "@/components/Forms";
import { Button } from "@/components/ui/button";

export default function ChangePasswordForm({ close }: { close: () => void }) {
  const { mutate: updatePassword, isSuccess } =
    useUpdatePassword<UpdatePasswordFormRequest>();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget).entries());

      updatePassword({
        currentPassword: data.currentPassword.toString(),
        password: data.newPassword.toString(),
      });
    },
  });

  useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Change Password</DialogTitle>
      </DialogHeader>
      <form {...getFormProps(form)}>
        <Field
          inputProps={{
            name: fields.currentPassword.name,
            type: "password",
          }}
          labelProps={{ children: "Current Password" }}
          errors={fields.currentPassword.errors}
        />
        <Field
          inputProps={{ name: fields.newPassword.name, type: "password" }}
          labelProps={{ children: "New Password" }}
          errors={fields.newPassword.errors}
        />
        <Field
          inputProps={{
            name: fields.retypePassword.name,
            type: "password",
          }}
          labelProps={{ children: "Retype Password" }}
          errors={fields.retypePassword.errors}
        />
        <Button className="w-full h-14">Change Password</Button>
      </form>
    </>
  );
}
