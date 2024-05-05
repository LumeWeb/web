import { Link } from "@remix-run/react";
import React from "react";

type Props = {};

const Footer = ({}: Props) => {
  return (
    <div className="w-full mt-5 flex flex-row items-center justify-center text-gray-400">
      <Link to="/about" className="hover:text-white hover:underline">
        About Web3.news
      </Link>
      <div className="h-7 w-[1px] bg-current mx-4" />
      <Link to="/donate" className="hover:text-white hover:underline">
        Contribute to the cause
      </Link>
    </div>
  );
};

export default Footer;
