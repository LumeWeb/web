import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import logoPng from "~/images/lume-logo.png?url"
import lumeColorLogoPng from "~/images/lume-color-logo.png?url"
import discordLogoPng from "~/images/discord-logo.png?url"
import lumeBgPng from "~/images/lume-bg-image.png?url"
import { Field, FieldCheckbox } from "~/components/forms"
import { useForm } from "@conform-to/react"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" }
  ]
}

export default function Index() {
  const [form, fields] = useForm({
    id: "login"
  })
  return (
    <div className="p-10 h-screen relative overflow-clip">
      <header>
        <img src={logoPng} alt="Lume logo" className="h-10"></img>
      </header>
      <form className="w-full p-2 max-w-md space-y-4 mt-12 bg-background">
        <span className="!mb-12 space-y-2">
          <h2 className="text-3xl font-bold">All roads lead to Lume</h2>
          <p className="text-input-placeholder">
            🤘 Get 50 GB free storage and download for free,{" "}
            <b
              className="text-primar
        y-2"
            >
              forever
            </b>
            .{" "}
          </p>
        </span>
        <Field
          inputProps={{ name: fields.email.name }}
          labelProps={{ children: "Email" }}
          errors={fields.email.errors}
        />
        <Field
          inputProps={{ name: fields.password.name, type: "password" }}
          labelProps={{ children: "Password" }}
          errors={fields.password.errors}
        />
        <Field
          inputProps={{ name: fields.confirmPassword.name, type: "password" }}
          labelProps={{ children: "Confirm Password" }}
          errors={fields.confirmPassword.errors}
        />
        <FieldCheckbox
          inputProps={{ name: fields.termsOfService.name, form: form.id }}
          labelProps={{
            children: <span>I agree to the <Link
            to="/terms-of-service"
            className="text-primary-1 text-md hover:underline hover:underline-offset-4"
          >
            Terms of Service 
          </Link>and <Link
              to="/privacy-policy"
              className="text-primary-1 text-md hover:underline hover:underline-offset-4"
            >
              Privacy Policy
            </Link></span>
          }}
          errors={fields.termsOfService.errors}
        />
        <Button className="w-full h-14">Create Account</Button>
          <p className="text-input-placeholder w-full text-right">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-primary-1 text-md hover:underline hover:underline-offset-4"
            >
              Login here instead →
            </Link>
          </p>
      </form>
      <img
        src={lumeBgPng}
        alt="Lume background"
        className="absolute top-0 right-0 md:w-2/3 object-cover z-[-1]"
      ></img>
      <footer className="absolute bottom-5">
        <ul className="flex flex-row">
          <li>
            <Link to="https://discord.lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder"
              >
                <img className="h-5" src={discordLogoPng} alt="Discord Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
          <li>
            <Link to="https://lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder"
              >
                <img className="h-5" src={lumeColorLogoPng} alt="Lume Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  )
}
