const steps = [
  {
    number: "1",
    title: "Pin",
    description: "Upload files to IPFS and get a link that stays online as long as it's pinned. Use our command-line tool or developer SDK.",
  },
  {
    number: "2",
    title: "Distribute",
    description:
      "Files are copied across the network. Your files stay online even if individual servers go down.",
  },
  {
    number: "3",
    title: "Access Anywhere",
    description:
      "Retrieve your files from anywhere. Static websites serve directly. Private data stays encrypted until you need it.",
  },
];

export default function ThreeSteps() {
  return (
    <section className="bg-content-section-gray py-[60px] md:py-[120px]">
      <div className="xl:container px-6">
        <div className="mx-auto max-w-[1000px]">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <div key={step.number} className="text-center md:text-left">
                <span
                  className="text-content-text/15 text-[80px] font-medium leading-none md:text-[100px]"
                >
                  {step.number}
                </span>
                <h3 className="text-content-text -mt-4 text-lg font-medium md:-mt-6 md:text-xl">
                  {step.title}
                </h3>
                <p className="text-content-text-muted mt-2 text-sm leading-relaxed md:text-base">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
