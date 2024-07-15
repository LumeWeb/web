import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type BaseKey, useGetIdentity, useUpdate } from "@refinedev/core";
import { useEffect } from "react";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog.js";
import schema from "./ChangeEmailForm.schema";

export default function ChangeEmailForm({
  currentValue,
  close,
}: {
  currentValue: string;
  close: () => void;
}) {
  const { data: identity } = useGetIdentity<{ id: BaseKey }>();
  const { mutate: updateEmail, isSuccess } = useUpdate();
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
      console.log(identity);
      updateEmail({
        resource: "account",
        id: "",
        values: {
          email: data.email.toString(),
          password: data.password.toString(),
        },
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
        <DialogTitle className="mb-8">Change Email</DialogTitle>
      </DialogHeader>
      <div className="rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1">
        {currentValue}
      </div>
      <form {...getFormProps(form)}>{/* Form fields */}</form>
    </>
  );
}
