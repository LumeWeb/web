import ContentSection from "@/components/content/ContentSection";
import DistributionDiagram from "./DistributionDiagram";

interface DistributionSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  imagePosition?: "left" | "right";
  theme?: "gray" | "white";
  id?: string;
  buttonText?: string;
  url?: string;
}

/**
 * DistributionSection - Self-contained section with DistributionDiagram.
 *
 * Replaces the pattern of passing imageComponent as a prop (which Astro
 * serializes to null on hydration). Instead, the diagram is imported
 * and rendered directly inside this React component.
 */
export default function DistributionSection({
  subtitle = "Verifiable Network",
  title = "A network, not a data center",
  description = "Your files are distributed across independent storage providers, not sitting in one company's servers. If individual hosts go down, your data stays online. Hosts only get paid when they prove your data is there. Crypto payments available for those who prefer them.",
  imagePosition = "right",
  theme = "gray",
  id,
  buttonText,
  url,
}: DistributionSectionProps) {
  return (
    <ContentSection
      id={id}
      subtitle={subtitle}
      title={title}
      description={description}
      buttonText={buttonText}
      buttonUrl={url}
      imageContent={
        <div className="flex items-center justify-center py-4">
          <DistributionDiagram />
        </div>
      }
      imagePosition={imagePosition}
      className={theme === "gray" ? "bg-content-section-gray" : "bg-white"}
    />
  );
}
