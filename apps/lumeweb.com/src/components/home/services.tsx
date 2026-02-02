import React from "react";
import type { Service, ServiceLink } from "@/data/types";

interface ServicesProps {
  services: Service[];
}

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8 hover:border-aquamarine/50 transition-colors duration-250 max-w-md w-full">
      <h3 className="font-display text-2xl font-bold text-aquamarine mb-4">
        {service.name}
      </h3>
      <p className="font-body text-cloud text-lg mb-6">
        {service.description}
      </p>
      <ul className="font-body text-cloud space-y-2 mb-6">
        {service.features.slice(0, 3).map((feature, index) => (
          <li key={`${service.id}-feature-${index}`}>• {feature}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-4">
        {service.links.map((link) => (
          <a
            key={link.text}
            href={link.url}
            className={`inline-flex items-center font-display font-bold transition-colors duration-250 ${
              link.style === "primary"
                ? "text-aquamarine hover:text-white"
                : "text-cloud hover:text-aquamarine"
            }`}
          >
            {link.text}
          </a>
        ))}
      </div>
    </div>
  );
}

export function Services({ services }: ServicesProps) {
  return (
    <section id="services" className="py-24 md:py-32 bg-blue-charcoal-2">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Services
          </h2>
          <p className="font-body text-xl text-cloud max-w-2xl mx-auto">
            Infrastructure that respects users. No surveillance, no vendor lock-in, no rent-seeking.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;