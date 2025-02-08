import type React from "react";

export function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="17"
      viewBox="0 0 17 17"
      width="17"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <g clipPath="url(#clip0_flag)">
        <path
          d="M16.66 1.36V9.86C16.66 9.86 14.8672 10.88 12.58 10.88C8.52414 10.88 7.18454 9.52 4.42 9.52C1.65546 9.52 0.34 10.2 0.34 10.2V1.02C0.34 1.02 1.0489 0.34 4.42 0.34C7.7911 0.34 9.19598 2.38 12.58 2.38C14.7155 2.38 16.3642 1.52014 16.66 1.36Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="2"
        />
        <path
          d="M0.34 1.02V16.66"
          stroke="currentColor"
          strokeLinecap="round"
          strokeMiterlimit="10"
          strokeWidth="2"
        />
      </g>
      <defs>
        <clipPath id="clip0_flag">
          <rect fill="white" height="17" width="17" />
        </clipPath>
      </defs>
    </svg>
  );
}
