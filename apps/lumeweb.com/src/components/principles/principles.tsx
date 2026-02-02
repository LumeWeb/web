import React from "react";

const PRINCIPLES = [
  {
    title: "Your data, your rules",
    description: "You own your information. We won't sell it, trade it, or use it to manipulate you.",
  },
  {
    title: "You matter more than metrics",
    description: "We don't chase engagement or addiction. We build tools that give you control.",
  },
  {
    title: "The internet should work for everyone",
    description: "Access isn't a luxury. We build for real people, not just tech insiders.",
  },
  {
    title: "Privacy isn't optional—it's built in",
    description: "Encryption isn't an upsell. It's how we treat every interaction by default.",
  },
  {
    title: "We won't censor your voice",
    description: "Your speech is yours. We don't bow to advertisers, governments, or pressure groups.",
  },
  {
    title: "Community-funded, not venture-backed",
    description: "The open web is infrastructure for everyone. It runs on community support, not investor returns.",
  },
  {
    title: "We help, we don't harvest",
    description: "We create things that help you. Not systems that trap you and extract value.",
  },
  {
    title: "Technology that defends civil rights",
    description: "Freedom and privacy aren't given—they're defended. We build systems that protect your rights by design.",
  },
];

export function Principles() {
  return (
    <section className="py-24 md:py-32 bg-blue-charcoal-2">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Our Principles
          </h1>
          <p className="font-body text-xl text-cloud max-w-2xl mx-auto">
            Simple beliefs that guide everything we build.
          </p>
        </div>

        <div className="space-y-8">
          {PRINCIPLES.map((principle, index) => (
            <div
              key={principle.title}
              className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8 hover:border-aquamarine/40 transition-colors duration-250"
            >
              <div className="flex items-start gap-6">
                <span className="font-display text-4xl font-bold text-aquamarine/30 select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white mb-3">
                    {principle.title}
                  </h3>
                  <p className="font-body text-lg text-cloud leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="font-body text-cloud text-lg mb-6">
            These principles are derived from web3ready.org, where you'll find the original principles with deep reasoning.
          </p>
          <a
            href="https://web3ready.org"
            className="inline-flex items-center px-6 py-3 border-2 border-aquamarine text-aquamarine font-display font-bold rounded-lg hover:bg-aquamarine/10 transition-colors duration-250"
          >
            Read the full manifesto
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Principles;