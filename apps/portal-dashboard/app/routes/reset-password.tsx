import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import logoPng from "~/images/lume-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeBgPng from "~/images/lume-bg-reset-password.png";
import { Field } from "~/components/forms";
import { getFormProps, useForm } from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ToastAction } from "~/components/ui/toast";
import { useNotification } from "@refinedev/core";
import LumeLogo from "~/components/lume-logo";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

const RecoverPasswordSchema = z.object({
  email: z.string().email(),
});
export default function RecoverPassword() {
  const { open } = useNotification();
  const [form, fields] = useForm({
    id: "sign-up",
    constraint: getZodConstraint(RecoverPasswordSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RecoverPasswordSchema });
    },
    onSubmit(e) {
      e.preventDefault();
      open?.({
        type: "success",
        message: "Password reset email sent",
        description: "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.",
        action: <ToastAction altText="Cancel">Cancel</ToastAction>,
        cancelMutation: () => {
          console.log("cancel mutation");
        },
      })

    }
  });

  // TODO: another detail is the reset password has no screen to either accept a new pass or  
  // just say an email has been sent.. if i were to generate  a pass for them. imho i think 
  // a screen that just says a password reset email has been sent would be good, then a separate
  // route to accept the reset token and send that to the api when would then trigger a new email
  // with the pass. 

  return (
    <div className=" h-screen relative">
      <header className="p-4 sm:p-10">
        <LumeLogo />
      </header>

      <div className="flex flex-col items-start max-w-md bg-background">
        <form
          className="w-full h-full  p-4 sm:p-10 space-y-4 mt-12 "
          {...getFormProps(form)}>
          <p className="text-input-placeholder w-full text-left mb-10">
            <Link
              to="/login"
              className="text-foreground text-md hover:underline hover:underline-offset-4">
              ← Back to Login
            </Link>
          </p>
          <span className="!mb-12 space-y-2">
            <h2 className="text-3xl font-bold">Reset your password</h2>
          </span>
          <Field
            inputProps={{ name: fields.email.name }}
            labelProps={{ children: "Email Address" }}
            errors={fields.email.errors}
          />
          <Button className="w-full h-14">Reset Password</Button>

        </form>
      </div>
      <div className="fixed inset-0 -z-10 overflow-clip ">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 sm:h-full object-cover z-[-1]"
        />
      </div>
      <footer className="my-5">
        <ul className="flex flex-row">
          <li>
            <Link to="https://discord.lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder">
                <img className="h-5" src={discordLogoPng} alt="Discord Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
          <li>
            <Link to="https://lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder">
                <img className="h-5" src={lumeColorLogoPng} alt="Lume Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}
