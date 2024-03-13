import type {MetaFunction} from "@remix-run/node"
import {Link, useLocation} from "@remix-run/react"
import {z} from "zod"
import {Button} from "~/components/ui/button"
import logoPng from "~/images/lume-logo.png?url"
import lumeColorLogoPng from "~/images/lume-color-logo.png?url"
import discordLogoPng from "~/images/discord-logo.png?url"
import lumeBgPng from "~/images/lume-bg-image.png?url"
import {Field, FieldCheckbox} from "~/components/forms"
import {getFormProps, useForm} from "@conform-to/react"
import {getZodConstraint, parseWithZod} from "@conform-to/zod"
import {useGo, useIsAuthenticated, useLogin} from "@refinedev/core";
import {AuthFormRequest} from "~/data/auth-provider.js";
import {useEffect} from "react";

export const meta: MetaFunction = () => {
    return [
        {title: "Login"},
        {name: "description", content: "Welcome to Lume!"}
    ]
}

export default function Login() {
    const location = useLocation()
    const {isLoading: isAuthLoading, data: authData} = useIsAuthenticated();
    const auth = useIsAuthenticated();
    const hash = location.hash
    const go = useGo();

    useEffect(() => {
        if (!isAuthLoading) {
            if (authData?.authenticated) {
                go({to: "/dashboard", type: "replace"});
            }
        }
    }, [isAuthLoading, authData]);

    return (
        <div className="p-10 h-screen relative">
            <header>
                <img src={logoPng} alt="Lume logo" className="h-10"/>
            </header>
            <div className="fixed inset-0 -z-10 overflow-clip">
                <img
                    src={lumeBgPng}
                    alt="Lume background"
                    className="absolute top-0 right-0 md:w-2/3 object-cover z-[-1]"
                />
            </div>

            {hash === "" && <LoginForm/>}
            {hash === "#otp" && <OtpForm/>}

            <footer className="my-5">
                <ul className="flex flex-row">
                    <li>
                        <Link to="https://discord.lumeweb.com">
                            <Button
                                variant={"link"}
                                className="flex flex-row gap-x-2 text-input-placeholder"
                            >
                                <img className="h-5" src={discordLogoPng} alt="Discord Logo"/>
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
                                <img className="h-5" src={lumeColorLogoPng} alt="Lume Logo"/>
                                Connect with us
                            </Button>
                        </Link>
                    </li>
                </ul>
            </footer>
        </div>
    )
}

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    rememberMe: z.boolean()
})

const LoginForm = () => {
    const login = useLogin<AuthFormRequest>()

    const [form, fields] = useForm({
        id: "login",
        constraint: getZodConstraint(LoginSchema),
        onValidate({formData}) {
            return parseWithZod(formData, {schema: LoginSchema})
        },
        shouldValidate: "onSubmit",
        onSubmit(e) {
            e.preventDefault();

            const data = Object.fromEntries(new FormData(e.currentTarget).entries());
            login.mutate({
                email: data.email.toString(),
                password: data.password.toString(),
                rememberMe: data.rememberMe.toString() === "on"
            });
        }
    })

    return (
        <form
            className="w-full p-2 max-w-md space-y-3 mt-12 bg-background"
            {...getFormProps(form)}
        >
            <h2 className="text-3xl font-bold !mb-12">Welcome back! 🎉</h2>
            <Field
                inputProps={{name: fields.email.name}}
                labelProps={{children: "Email"}}
                errors={fields.email.errors}
            />
            <Field
                inputProps={{name: fields.password.name, type: "password"}}
                labelProps={{children: "Password"}}
                errors={fields.password.errors}
            />
            <FieldCheckbox
                inputProps={{name: fields.rememberMe.name, form: form.id}}
                labelProps={{children: "Remember Me"}}
                errors={fields.rememberMe.errors}
            />
            <Button className="w-full h-14">Login</Button>
            <p className="inline-block text-input-placeholder">
                Forgot your password?{" "}
                <Link
                    to="/reset-password"
                    className="text-primary-1 text-md hover:underline hover:underline-offset-4"
                >
                    Reset Password
                </Link>
            </p>
            <Link to="/register" className="block">
                <Button type="button" className="w-full h-14" variant={"outline"}>
                    Create an Account
                </Button>
            </Link>
        </form>
    )
}

const OtpSchema = z.object({
    otp: z.string().length(6, {message: "OTP must be 6 characters"})
})

const OtpForm = () => {
    // TODO: Add support for resending the OTP
    const [form, fields] = useForm({
        id: "otp",
        constraint: getZodConstraint(OtpSchema),
        onValidate({formData}) {
            return parseWithZod(formData, {schema: OtpSchema})
        },
        shouldValidate: "onSubmit"
    })
    const valid = false // TODO: some sort of logic to verify user is on OTP state validly

    if (!valid) {
        location.hash = ""
        return null
    }

    return (
        <form
            className="w-full p-2 max-w-md mt-12 bg-background"
            {...getFormProps(form)}
        >
      <span className="block !mb-8 space-y-2">
        <h2 className="text-3xl font-bold">Check your inbox</h2>
        <p className="text-input-placeholder">
          We will need the six digit confirmation code you received in your
          email in order to verify your account and get started. Didn’t receive
          a code?{" "}
            <Button type="button" variant={"link"} className="text-md h-0">
            Resend now →
          </Button>
        </p>
      </span>
            <Field
                inputProps={{name: fields.otp.name}}
                labelProps={{children: "Confirmation Code"}}
                errors={fields.otp.errors}
            />
            <Button className="w-full h-14">Verify</Button>
            <p className="text-input-placeholder w-full text-left">
                <Link
                    to="/login"
                    className="text-primary-1 text-md hover:underline hover:underline-offset-4"
                >
                    ← Back to Login
                </Link>
            </p>
        </form>
    )
}
