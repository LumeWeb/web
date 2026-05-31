import CallToActionSection from "@/components/call-to-action/CallToActionSection";

interface CallToActionProps {
	variant?: "default" | "dark" | "gray" | "white";
}

const CallToAction = ({ variant = "default" }: CallToActionProps) => {
  return (
    <CallToActionSection
      heading="Your data is yours."
      subheading="Private storage. No vendor lock-in. No data mining."
      primaryButton={{
        label: "Start Pinning →",
        url: "https://account.pinner.xyz"
      }}
      secondaryButton={{
        label: "Read the Docs →",
        url: "https://docs.pinner.xyz",
        buttonStyle: "outline"
      }}
      variant={variant}
    />
  );
};

export default CallToAction;
