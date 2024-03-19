import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import logoPng from "~/images/lume-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeBgPng from "~/images/lume-bg-image.png?url";
import { Field } from "~/components/forms";
import { getFormProps, useForm } from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useToast } from "~/components/ui/use-toast";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

const RecoverPasswordSchema = z.object({
  email: z.string().email(),
});
export default function RecoverPassword() {
  const { toast } = useToast();
  const [form, fields] = useForm({
    id: "sign-up",
    constraint: getZodConstraint(RecoverPasswordSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RecoverPasswordSchema });
    },
    onSubmit(e) {
      e.preventDefault();
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.",
        variant: "success",
        key: "reset-password-email-sent",
      });
    }
  });

  // TODO: another detail is the reset password has no screen to either accept a new pass or  
  // just say an email has been sent.. if i were to generate  a pass for them. imho i think 
  // a screen that just says a password reset email has been sent would be good, then a separate
  // route to accept the reset token and send that to the api when would then trigger a new email
  // with the pass. 

  return (
    <div className="p-10 h-screen relative">
      <header>
        <img src={logoPng} alt="Lume logo" className="h-10" />
      </header>
      <form
        className="w-full p-2 max-w-md space-y-4 mt-12 bg-background"
        {...getFormProps(form)}>
        <span className="!mb-12 space-y-2">
          <h2 className="text-3xl font-bold">Reset your password</h2>
        </span>
        <Field
          inputProps={{ name: fields.email.name }}
          labelProps={{ children: "Email Address" }}
          errors={fields.email.errors}
        />
        <Button className="w-full h-14">Reset Password</Button>
        <p className="text-input-placeholder w-full text-left">
          <Link
            to="/login"
            className="text-primary-1 text-md hover:underline hover:underline-offset-4">
            ← Back to Login
          </Link>
        </p>
      </form>
      <div className="fixed inset-0 -z-10 overflow-clip">
        <img
          src={lumeBgPng}
          alt="Lume background"
          className="absolute top-0 right-0 md:w-2/3 object-cover z-[-1]"
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
