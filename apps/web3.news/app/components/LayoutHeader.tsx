import React from "react";
import { Link } from "@remix-run/react";

import Logo from "@/images/lume-logo-sm.png";

type Props = {};

export const Header = ({}: Props) => {
  return (
    <header className="w-full flex flex-row justify-between relative">
      <div className="flex flex-col">
        <Link to="/">
          <Web3NewsLogo />
          <div className="relative mt-1">
            <img
              className="-right-8 -top-3 absolute"
              width={28}
              height={24}
              src={Logo}
              alt="Lume Web logo"
            />
            <span className="right-0 -top-[6px] absolute text-white text-opacity-50 text-sm font-normal font-secondary leading-7">
              a Lume project
            </span>
          </div>
        </Link>
      </div>
      <div className="flex gap-3 font-normal flex-row text-gray-300 rounded">
        <Link
          to="/about"
          className="hover:text-white p-2 px-4 hover:bg-gray-800 rounded"
        >
          About
        </Link>
        <Link
          to="/donate"
          className="hover:text-white p-2 px-4 hover:bg-gray-800 rounded"
        >
          Contribute
        </Link>
      </div>
    </header>
  );
};

const Web3NewsLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="159"
      height="23"
      viewBox="0 0 159 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.55 0.299999H3.309V16.172L8.703 8.081H11.059L16.391 16.172V0.299999H19.15V22H17.104L9.85 11.367L2.627 22H0.55V0.299999ZM22.2251 22L22.2561 0.299999H36.7641V3.059H25.0151V9.755H33.6331V12.545H25.0151V19.241H36.7641V22H22.2251ZM39.4824 22L39.4514 0.299999H47.7284C53.1844 0.299999 55.8194 6.903 52.0374 10.654C57.2144 14.157 55.0444 22 48.9374 22H39.4824ZM42.2414 9.786H47.7284C52.0064 9.786 52.2234 3.059 47.7284 3.059H42.2414V9.786ZM42.2414 19.241H48.9374C53.2154 19.241 53.4324 12.514 48.9374 12.514H42.2414V19.241ZM62.7651 22C59.9751 22 57.8051 19.768 57.8051 16.761H60.5021C60.5021 18.342 61.5251 19.303 62.7651 19.303H66.7021C71.1661 19.303 71.2281 12.297 66.7021 12.297H63.3541V10.003H66.0511C70.5771 10.003 70.5461 2.997 66.0511 2.997H62.8891C61.6181 2.997 60.5951 4.02 60.5951 5.415H57.9291C57.9291 2.532 60.1611 0.299999 62.8891 0.299999H66.0511C71.6931 0.299999 74.4831 7.771 69.7091 10.902C75.3511 13.909 72.6541 22 66.7021 22H62.7651Z"
        fill="white"
      />
      <path
        d="M77.9783 22.248C76.8003 22.248 75.8703 21.504 75.8703 20.326C75.8703 19.148 76.8003 18.435 77.9783 18.435C79.1253 18.435 80.1173 19.148 80.1173 20.326C80.1173 21.504 79.1253 22.248 77.9783 22.248ZM83.2268 22V0.299999H85.3348L97.9828 16.854V0.299999H100.742V22H98.6028L85.9858 5.477V22H83.2268ZM103.812 22L103.843 0.299999H118.351V3.059H106.602V9.755H115.22V12.545H106.602V19.241H118.351V22H103.812ZM121.038 0.299999H123.797V16.172L129.191 8.081H131.547L136.879 16.172V0.299999H139.638V22H137.592L130.338 11.367L123.115 22H121.038V0.299999ZM142.744 15.614H145.503C145.503 18.218 146.991 19.427 148.944 19.427H152.044C153.408 19.427 156.105 18.59 156.105 15.924C156.105 10.065 143.054 14.064 143.054 6.19C143.054 2.563 145.968 0.175998 148.727 0.175998H152.323C155.733 0.175998 158.337 2.594 158.337 6.624H155.578C155.578 4.082 154.09 2.935 152.106 2.935H148.913C147.208 2.935 145.813 4.237 145.813 6.159C145.813 11.522 158.864 7.306 158.864 16.42C158.864 19.83 155.671 22.186 152.044 22.186H148.944C145.534 22.186 142.744 19.799 142.744 15.614Z"
        fill="#ACF9C0"
      />
    </svg>
  );
};

export default Header;
