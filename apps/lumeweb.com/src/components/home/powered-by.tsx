import React from "react";

import siaSvg from "@/assets/icons/sia.svg?raw";
import hnsSvg from "@/assets/icons/hns.svg?raw";
import osiSvg from "@/assets/icons/osi.svg?raw";

const LOGOS = [
  { name: "Sia", href: "https://sia.tech", svg: siaSvg },
  { name: "Handshake", href: "https://handshake.org", svg: hnsSvg },
  { name: "OSI", href: "https://opensource.org/osd/", svg: osiSvg },
];

interface LogoProps {
  name: string;
  href: string;
  svg: string;
}

function Logo({ name, href, svg }: LogoProps) {
  return (
    <a
      href={href}
      title={name}
      className="text-gray-300 hover:text-white transition-all ease-in flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg class="w-16 h-16"') }}
    />
  );
}

export function PoweredBy() {
  return (
    <section id="powered-by" className="py-16 bg-blue-charcoal-2">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
          <h2 className="font-display text-xl md:text-3xl text-primary uppercase font-bold">
            Powered By
          </h2>
          <div className="flex items-center justify-center gap-8 md:gap-10">
            {LOGOS.map((logo) => (
              <Logo key={logo.name} {...logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PoweredBy;