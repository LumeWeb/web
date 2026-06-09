interface FrameworkEntry {
  name: string;
  alt?: string;
  suffix?: string;
}

const FRAMEWORKS: FrameworkEntry[] = [
  { name: "Hugo" },
  { name: "Astro" },
  { name: "Next.js", suffix: "static export" },
  { name: "Gatsby" },
  { name: "Jekyll" },
  { name: "Eleventy", alt: "11ty" },
];

type FrameworkFormat = "default" | "technical";

function formatName(f: FrameworkEntry, fmt: FrameworkFormat): string {
  const base = fmt === "technical" && f.alt ? f.alt : f.name;
  return f.suffix ? `${base} ${f.suffix}` : base;
}

type ListOptions = {
  format?: FrameworkFormat;
  andMore?: boolean;
};

export function frameworkList(options: ListOptions = {}): string {
  const { format = "default", andMore = true } = options;

  const names = FRAMEWORKS.map((f) => formatName(f, format));
  const joined = names.length > 1
    ? `${names.slice(0, -1).join(", ")}, ${names.slice(-1)}`
    : names[0];

  return andMore ? `${joined}, and more` : joined;
}

export function worksWithFrameworks(options: ListOptions = {}): string {
  return `Works with ${frameworkList(options)}`;
}
