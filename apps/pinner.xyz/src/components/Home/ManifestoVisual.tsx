import { useState, useEffect } from "react";

interface Pillar {
  id: string;
  label: string;
  short: string;
}

interface ManifestoVisualProps {
  pillars?: Pillar[];
}

const defaultPillars: Pillar[] = [
  {
    id: "take-down",
    label: "Resilience",
    short: "Harder to take down than put up",
  },
  {
    id: "trust",
    label: "No single trust",
    short: "No one company controls your data",
  },
  {
    id: "redundancy",
    label: "Redundancy",
    short: "Not a feature: the point",
  },
  {
    id: "architecture",
    label: "Architecture",
    short: "No provider goodwill required",
  },
];

export default function ManifestoVisual({ pillars = defaultPillars }: ManifestoVisualProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % pillars.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [pillars.length]);

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Animated pillar stack */}
      <div className="relative mb-6">
        {/* Central column */}
        <div className="mx-auto w-2 h-48 bg-home-text/10 rounded-full relative overflow-hidden">
          <div
            className="absolute left-0 right-0 bg-home-accent/60 rounded-full transition-all duration-700 ease-in-out"
            style={{
              height: `${((active + 1) / pillars.length) * 100}%`,
              bottom: 0,
            }}
          />
        </div>

        {/* Orbiting nodes */}
        <div className="absolute inset-0 pointer-events-none">
          {pillars.map((pillar, i) => {
            // staggered positions around the column
            const isLeft = i % 2 === 0;
            const topOffset = 12 + i * 24; // % down the column
            const activeClass =
              i === active
                ? "border-home-accent/50 bg-home-accent/10 scale-110"
                : "border-home-text/10 bg-home-card-bg scale-100";

            return (
              <div
                key={pillar.id}
                className={`absolute flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-500 ${activeClass}`}
                style={{
                  top: `${topOffset}%`,
                  [isLeft ? "right" : "left"]: "55%",
                  transform: `translateY(-50%) ${
                    i === active ? "scale(1.05)" : "scale(1)"
                  }`,
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    i === active ? "bg-home-accent" : "bg-home-text/20"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-500 ${
                    i === active ? "text-white" : "text-home-text-muted/60"
                  }`}
                >
                  {pillar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active pillar text */}
      <div className="text-center">
        <p
          key={pillars[active].id}
          className="text-home-accent text-base md:text-lg font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          {pillars[active].short}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {pillars.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === active ? "bg-home-accent w-4" : "bg-home-text/20"
            }`}
            aria-label={`Show pillar ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
