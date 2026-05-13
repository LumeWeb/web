import { FeatureItem } from "./FeatureItem";
import { FeaturesSkeleton } from "./FeaturesSkeleton";

interface FeaturesListProps {
  features?: string[];
}

export function FeaturesList({ features }: FeaturesListProps) {
  if (!features || features.length === 0) {
    return (
      <ul className="space-y-2">
        <FeaturesSkeleton />
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <FeatureItem key={index} text={feature} />
      ))}
    </ul>
  );
}
