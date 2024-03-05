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
        <h2 className="text-3xl font-bold !mb-12">Welcome back! 🎉</h2>
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
        <FieldCheckbox 
          inputProps={{ name: fields.rememberMe.name, form: form.id }}
          labelProps={{ children: "Remember Me" }}
          errors={fields.rememberMe.errors}
        />
        <Button className="w-full h-14">Login</Button>
        <p className="text-input-placeholder">
          Forgot your password?{" "}
          <Link
            to="/sign-up"
            className="text-primary-1 text-md hover:underline hover:underline-offset-4"
          >
            Reset Password
          </Link>
        </p>
        <Button className="w-full h-14" variant={"outline"}>
          Create an Account
        </Button>
      </form>
      <img src={lumeBgPng} alt="Lume background" className="absolute top-0 right-0 md:w-2/3 object-cover z-[-1]"></img>
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
