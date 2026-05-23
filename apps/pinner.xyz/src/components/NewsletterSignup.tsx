import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

const LISTMONK_FORM_URL = `${config.listmonkUrl}/subscription/form`;
const LIST_UUID = config.listmonkListUuid;

interface NewsletterSignupProps {
  theme?: "dark" | "light";
  source?: string;
  label?: string;
  buttonLabel?: string;
  successMessage?: string;
  className?: string;
  rounded?: boolean;
}

const themes = {
  dark: {
    label: "text-content-text-light",
    input:
      "bg-home-section-dark border-border-dark text-white placeholder:text-gray-footer focus:border-white",
    button:
      "bg-white text-home-section-dark hover:bg-gray-200 disabled:opacity-50",
    success: "text-green-400",
    error: "text-red-400",
  },
  light: {
    label: "text-content-text",
    input:
      "bg-white border-content-section-gray text-content-text placeholder:text-content-text-muted focus:border-content-text",
    button:
      "bg-content-text text-white hover:bg-content-text/90 disabled:opacity-50",
    success: "text-green-600",
    error: "text-red-600",
  },
};

type SignupState = "idle" | "submitting" | "success" | "error";

const NewsletterSignup = ({
  theme = "dark",
  source = "footer",
  label = "Get updates on new features & launches",
  buttonLabel = "Subscribe",
  successMessage = "Check your inbox to confirm your subscription!",
  className,
  rounded = false,
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SignupState>("idle");
  const [intentTracked, setIntentTracked] = useState(false);

  const t = themes[theme];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setState("submitting");
    window.posthog?.capture("newsletter_signup_submitted", { source });

    try {
      const params = new URLSearchParams();
      params.append("email", email);
      params.append("l", LIST_UUID);

      const res = await fetch(LISTMONK_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (res.ok) {
        setState("success");
        setEmail("");
        window.posthog?.capture("newsletter_signup_completed", { source });
      } else {
        setState("error");
        window.posthog?.capture("newsletter_signup_error", { source, status: res.status });
      }
    } catch {
      setState("error");
      window.posthog?.capture("newsletter_signup_error", { source, error: "network" });
    }
  };

  const containerClasses = rounded
    ? cn(
        "rounded-lg border p-6 md:p-8",
        theme === "dark"
          ? "border-border-dark bg-home-card-bg"
          : "border-content-divider/50 bg-content-section-gray",
        className
      )
    : className;

  if (state === "success") {
    return (
      <div className={cn("flex flex-col items-center gap-3 py-3", containerClasses)}>
        <p className={cn(t.success, "text-base font-medium")}>
          {successMessage}
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className={cn(
            "text-xs px-3 py-1.5 rounded cursor-pointer transition-all duration-200",
            theme === "dark"
              ? "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
              : "text-gray-500 hover:text-content-text hover:bg-content-text/5 border border-transparent hover:border-content-text/20"
          )}>
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col items-center gap-4 w-full", containerClasses)}>
      <p className={cn(t.label, "text-base")}>
        {label}
      </p>
      <div className="flex w-full max-w-lg gap-2">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          aria-label="Email address"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          onFocus={() => {
            if (!intentTracked) {
              setIntentTracked(true);
              window.posthog?.capture("newsletter_signup_intent", { source });
            }
          }}
          className={cn(
            t.input,
            "flex-1 rounded-md border px-4 py-3 text-base outline-none transition-colors"
          )}
          disabled={state === "submitting"}
        />
        <button
          type="submit"
          disabled={state === "submitting" || !email}
          className={cn(
            t.button,
            "rounded-md px-6 py-3 text-base font-medium transition-colors whitespace-nowrap"
          )}>
          {state === "submitting" ? "..." : buttonLabel}
        </button>
      </div>
      {state === "error" && (
        <p className={cn(t.error, "text-xs")}>
          Something went wrong. Try again or{" "}
          <a
            href={`${LISTMONK_FORM_URL}?l=${LIST_UUID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline">
            subscribe directly
          </a>
          .
        </p>
      )}
    </form>
  );
};

export default NewsletterSignup;
