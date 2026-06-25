import type { ReactNode } from "react";
import ContentSection from "@/components/content/ContentSection";
import UploadFlowDiagram from "./UploadFlowDiagram";

interface UploadFlowSectionProps {
  subtitle?: string;
  title?: string;
  description?: string;
  imagePosition?: "left" | "right";
  theme?: "gray" | "white";
  id?: string;
  buttonText?: string;
  url?: string;
  children?: ReactNode;
}

/**
 * UploadFlowSection - Self-contained section with UploadFlowDiagram.
 *
 * Replaces the pattern of passing imageComponent as a prop (which Astro
 * serializes to null on hydration). Instead, the diagram is imported
 * and rendered directly inside this React component.
 */
export default function UploadFlowSection({
  subtitle = "Content Addressing",
  title = "Your file gets a permanent link",
  description = "Upload any file and it's pinned to IPFS on a verifiable storage network. Your content receives a content address: a unique, verifiable link that points to your data regardless of where it's stored. Links stay valid as long as your content is pinned. No short URLs, no broken links, no platform dependencies.",
  imagePosition = "left",
  theme = "white",
  id,
  buttonText,
  url,
  children,
}: UploadFlowSectionProps) {
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
          <UploadFlowDiagram />
        </div>
      }
      imagePosition={imagePosition}
      className={theme === "gray" ? "bg-content-section-gray" : "bg-white"}
    >
      {children}
    </ContentSection>
  );
}
