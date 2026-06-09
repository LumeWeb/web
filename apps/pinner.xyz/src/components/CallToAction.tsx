import CallToActionSection from "@/components/call-to-action/CallToActionSection";
import { config } from "@/lib/config";

interface CallToActionProps {
	variant?: "default" | "dark" | "gray" | "white";
	heading?: string;
	subheading?: string;
	primaryLabel?: string;
	primaryUrl?: string;
	secondaryLabel?: string;
	secondaryUrl?: string;
	intent?: "pinning" | "hosting" | "storing" | "partners";
}

const CallToAction = ({
	variant = "default",
	heading = "Your data is yours.",
	subheading = "Private storage. No vendor lock-in. No data mining.",
	primaryLabel = "Start Pinning →",
	primaryUrl,
	secondaryLabel = "Read the Docs →",
	secondaryUrl = "https://docs.pinner.xyz",
	intent = "pinning",
}: CallToActionProps) => {
  return (
    <CallToActionSection
      heading={heading}
      subheading={subheading}
      primaryButton={{
        label: primaryLabel,
        url: primaryUrl || config.registerUrl(intent),
        trackEvent: "cta_primary_clicked",
        trackProperties: { intent, label: primaryLabel }
      }}
      secondaryButton={{
        label: secondaryLabel,
        url: secondaryUrl,
        buttonStyle: "outline",
        trackEvent: "cta_secondary_clicked",
        trackProperties: { intent, label: secondaryLabel },
        target: "_blank"
      }}
      variant={variant}
    />
  );
};

export default CallToAction;
