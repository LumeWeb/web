import CallToActionSection from "@/components/call-to-action/CallToActionSection";

interface CallToActionProps {
	variant?: "default" | "dark" | "gray" | "white";
}

const CallToAction = ({ variant = "default" }: CallToActionProps) => {
  return (
    <CallToActionSection
      heading="Building something?"
      subheading="Let's talk. Or start storing with our API."
      primaryButton={{
        label: "Contact Sales",
        url: "/contact"
      }}
      secondaryButton={{
        label: "Sign Up →",
        url: "https://account.pinner.xyz",
        style: "outline"
      }}
      variant={variant}
    />
  );
};

export default CallToAction;
