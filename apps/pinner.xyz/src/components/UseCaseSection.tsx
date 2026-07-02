import Section from "@/components/layout/Section";
import { cn } from "@/lib/utils";

export interface UseCaseCard {
  title: string;
  description: string;
  cta: string;
  href: string;
}

interface UseCaseSectionProps {
  cases: UseCaseCard[];
  heading?: string;
  subheading?: string;
  variant?: "dark" | "gray" | "white" | "default";
}

/**
 * Reusable use-case card grid for solution pages.
 * Each solution page passes only the use cases relevant to that product.
 */
const UseCaseSection = ({
  cases,
  heading = "What you can build",
  subheading,
  variant = "white",
}: UseCaseSectionProps) => {
  return (
    <Section variant={variant} padding="md">
      <div className="xl:container px-6">
        <h2
          className={cn(
            "text-2xl lg:text-3xl font-semibold text-center mb-2",
            variant === "dark" ? "text-home-text" : "text-content-text"
          )}
        >
          {heading}
        </h2>
        {subheading && (
          <p
            className={cn(
              "text-sm text-center mb-10",
              variant === "dark" ? "text-home-text-muted" : "text-content-text-muted"
            )}
          >
            {subheading}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((card) => (
            <a
              key={`${card.title}-${card.href}`}
              href={card.href}
              className={cn(
                "group flex flex-col rounded-lg border p-6 lg:p-8",
                variant === "dark"
                  ? "border-home-text/10 text-home-text hover:border-home-text/30"
                  : "border-content-divider/30 text-content-text hover:border-content-divider/60",
                "transition-colors duration-200"
              )}
            >
              <h3 className="text-lg font-semibold mb-3">
                {card.title}
              </h3>
              <p
                className={cn(
                  "text-sm leading-relaxed mb-4",
                  variant === "dark" ? "text-home-text-muted" : "text-content-text-muted"
                )}
              >
                {card.description}
              </p>
              <span className="text-sm font-medium group-hover:underline mt-auto">
                {card.cta}
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default UseCaseSection;
