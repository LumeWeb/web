import type { SVGAttributes } from "react";

/**
 * Coinbase Wallet app icon (inline SVG) — vendored verbatim from the public
 * Coinbase Wallet vector (`#0052FF` tile + the official even-odd white mark),
 * matching the vendored-icon convention used by the social provider icons
 * (see `providerIcons/`).
 *
 * Geometry source: public Coinbase Wallet SVG — https://gist.github.com/taycaldwell/2291907115c0bb5589bc346661435007
 */
export type CoinbaseCProps = SVGAttributes<SVGSVGElement>;

export const CoinbaseC = ({ className, ...rest }: CoinbaseCProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    role="img"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}>
    <rect fill="#0052FF" height="1024" width="1024" />
    <path
      clipRule="evenodd"
      d="M152 512C152 710.823 313.177 872 512 872C710.823 872 872 710.823 872 512C872 313.177 710.823 152 512 152C313.177 152 152 313.177 152 512ZM420 396C406.745 396 396 406.745 396 420V604C396 617.255 406.745 628 420 628H604C617.255 628 628 617.255 628 604V420C628 406.745 617.255 396 604 396H420Z"
      fill="#fff"
      fillRule="evenodd"
    />
  </svg>
);
