import React from "react";

import gitSvg from "@/assets/icons/git.svg?raw";
import githubSvg from "@/assets/icons/github.svg?raw";
import discordSvg from "@/assets/icons/discord.svg?raw";
import twitterSvg from "@/assets/icons/twitter.svg?raw";
import type { CommunityProject, Social } from "@/data/types";

const ICONS = {
  git: gitSvg,
  github: githubSvg,
  discord: discordSvg,
  twitter: twitterSvg,
} as const;

interface SocialProps {
  social: Social;
  index: number;
}

function Social({ social, index }: SocialProps) {
  const mtClass = index === 0 ? "-mt-1" : index === 2 ? "mt-1" : "";
  const svg = ICONS[social.icon as keyof typeof ICONS] || githubSvg;

  return (
    <a
      href={social.url}
      title={social.title || social.name}
      className={`w-10 h-10 ${mtClass} text-gray-300 hover:text-aquamarine transition-all ease-in flex items-center justify-center`}
      dangerouslySetInnerHTML={{ __html: svg.replace("<svg", '<svg class="w-10 h-10"') }}
    />
  );
}

interface CommunityProps {
  socials?: Social[];
  projects?: CommunityProject[];
}

export function Community({ socials = [], projects = [] }: CommunityProps) {
  return (
    <section id="community" className="py-24 md:py-32 bg-blue-charcoal">
      <div className="max-w-6xl mx-auto px-6">
        {/* Values */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Our values
          </h2>
          <p className="font-body text-xl text-cloud max-w-2xl mx-auto">
            Everything we build is guided by these principles. They're not marketing—they're the foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {VALUES.map((value) => (
            <div key={value.title} className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-aquamarine/10 rounded-full flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-aquamarine">
                  {value.title[0]}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4">
                {value.title}
              </h3>
              <p className="font-body text-cloud text-lg">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Get Involved */}
        <div className="bg-blue-charcoal-2 rounded-2xl p-8 md:p-12 border border-aquamarine/20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                Get involved
              </h3>
              <p className="font-body text-xl text-cloud mb-8">
                Anyone who believes the web should belong to everyone. There's a place for you here.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/lumeweb"
                  className="inline-flex items-center px-6 py-3 bg-aquamarine text-blue-charcoal font-display font-bold rounded-lg hover:bg-white transition-colors duration-250"
                >
                  Contribute code
                </a>
                <a
                  href="/donate"
                  className="inline-flex items-center px-6 py-3 border-2 border-aquamarine text-aquamarine font-display font-bold rounded-lg hover:bg-aquamarine/10 transition-colors duration-250"
                >
                  Support financially
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="font-display text-xl text-aquamarine uppercase font-bold mb-6">
                Get in touch
              </h4>
              <div className="flex flex-row items-center justify-center gap-8">
                {socials.map((social, index) => (
                  <Social key={social.id} social={social} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const VALUES = [
  {
    title: "Freedom",
    description: "The web should be open and accessible to all. No gatekeepers, no permission required.",
  },
  {
    title: "Privacy",
    description: "Your data is yours. End-to-end encryption, no tracking, no surveillance capitalism.",
  },
  {
    title: "Ownership",
    description: "You own what you create. Digital property rights are human rights.",
  },
];

export default Community;