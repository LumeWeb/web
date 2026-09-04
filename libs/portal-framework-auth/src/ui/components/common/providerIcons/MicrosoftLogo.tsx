import type { SVGAttributes } from "react";

/**
 * Vendored Microsoft four-square logo (inline SVG).
 *
 * The genuine mark is four equal squares — #F25022 / #7FBA00 / #00A4EF /
 * #FFB900 — never a mono silhouette on a colored disc. Fills are hardcoded
 * to match the brand mark and deliberately ignore any `color` prop.
 *
 * Source geometry: Microsoft brand assets (21×21 viewBox).
 */
export type MicrosoftLogoProps = SVGAttributes<SVGSVGElement>;

export const MicrosoftLogo = ({
  className,
  ...rest
}: MicrosoftLogoProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    role="img"
    viewBox="-1.5 -1.5 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}>
    <path d="M0 0h10v10H0z" fill="#F25022" />
    <path d="M11 0h10v10H11z" fill="#7FBA00" />
    <path d="M0 11h10v10H0z" fill="#00A4EF" />
    <path d="M11 11h10v10H11z" fill="#FFB900" />
  </svg>
);
