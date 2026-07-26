/**
 * navLinks.ts: Single source of truth for all navigation and footer links.
 *
 * Import this in Navbar.tsx, Footer.astro, and any other component that
 * renders navigation structures. Keeps URLs, labels, and structure DRY.
 */

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  icon?: string; /* lucide-react icon name */
}

export const products: NavLink[] = [
  { label: "Website Hosting", href: "/host", icon: "Globe" },
  { label: "IPFS Pinning", href: "/pin", icon: "Pin" },
];

export const resources: NavLink[] = [
  { label: "Docs", href: "https://docs.pinner.xyz", external: true, icon: "BookOpen" },
  { label: "Blog", href: "/blog", icon: "Newspaper" },
  { label: "GitHub", href: "https://github.com/LumeWeb", external: true, icon: "Github" },
  { label: "How It Works", href: "/how-it-works", icon: "Cpu" },
];

export const staticNav: NavLink[] = [
  { label: "Pricing", href: "/pricing", icon: "Tag" },
  { label: "About", href: "/about", icon: "Info" },
];

/* Sia Network: special link with custom heart icon (not Lucide) */
export const siaNav: NavLink = {
  label: "Sia Network",
  href: "https://sia.tech/learn",
  external: true,
};

/* Footer: Product column, subset of products + additional pages */
export const footerProductLinks: NavLink[] = [
  ...products,
  { label: "ENS Hosting", href: "/ens" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

/* Footer: Community column */
export const footerCommunityLinks: NavLink[] = [
  { label: "Documentation", href: "https://docs.pinner.xyz", external: true },
  { label: "GitHub", href: "https://github.com/LumeWeb", external: true },
  { label: "Discord", href: "https://discord.gg/VWEVRardwN", external: true },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

/* Footer: Legal column */
export const footerLegalLinks: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Law Enforcement Guide", href: "/law-enforcement" },
  { label: "Transparency Report", href: "/transparency" },
];
