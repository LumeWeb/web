import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";

const frustrations = [
  {
    title: "Your cloud provider can read your files",
    description:
      "Traditional storage encrypts data, but they hold the keys. You're trusting a promise, not an architecture.",
  },
  {
    title: "Deleting data doesn't mean it's deleted",
    description:
      "You have no way to verify your data is actually gone. 'We deleted it' is not the same as 'it's gone.'",
  },
  {
    title: "The real price is never on the pricing page",
    description:
      "Egress fees, API call charges, support tiers, and lock-in costs add up. You find out after you're committed.",
  },
];

const ProblemAgitation = () => {
  return (
    <Section variant="dark" padding="md">
      <div className="xl:container px-6">
        <Heading
          title="The problem with cloud storage"
          highlightText="nobody talks about"
        />

        <div className="mx-auto max-w-[1000px] grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {frustrations.map((item, i) => (
            <div
              key={item.title}
              className="border border-home-text/10 rounded-lg bg-home-card-bg p-6 lg:p-8"
            >
              <span className="text-home-text-muted text-sm font-medium mb-3 block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-home-text text-base font-medium mb-2 lg:text-lg">
                {item.title}
              </h3>
              <p className="text-home-text-muted text-sm leading-relaxed lg:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ProblemAgitation;
