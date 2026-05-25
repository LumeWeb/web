import FooterMenu from "./FooterMenu";
import footerMenu from "@/data/footer-menu";

import FooterLogo from "../assets/footer-logo.svg";
import FooterLogoBlack from "../assets/footer-logo-light.png";
import PathIcon from "../assets/path-black.svg";
import GithubIcon from "../assets/github-black.svg";

import PathIconDark from "../assets/path.svg";
import GithubIconDark from "../assets/github.svg";

const Footer = ({ theme }) => {
  return (
    <footer className={`${theme === "dark" ? "bg-[#051413]" : "bg-[#F8F8F8]"}`}>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-5">
            <a
              href="https://docs.lumeweb.com"
              className={`${
                theme === "dark"
                  ? "text-[#BBBFBF] hover:text-white"
                  : "text-[#0D1D1C]"
              } text-base transition ease-in-out duration-300`}>
              Documentation
            </a>
            <a
              href="https://github.com/lumeweb"
              className={`${
                theme === "dark"
                  ? "text-[#BBBFBF] hover:text-white"
                  : "text-[#0D1D1C]"
              } text-base transition ease-in-out duration-300`}>
              GitHub
            </a>
            <a
              href="https://discord.gg/qpC8ADp3rS"
              className={`${
                theme === "dark"
                  ? "text-[#BBBFBF] hover:text-white"
                  : "text-[#0D1D1C]"
              } text-base transition ease-in-out duration-300`}>
              Discord
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href="#"
              className={`${
                theme === "dark"
                  ? "text-[#BBBFBF] hover:text-white"
                  : "text-[#0D1D1C]"
              } text-base transition ease-in-out duration-300`}>
              Privacy Policy
            </a>
            <a
              href="#"
              className={`${
                theme === "dark"
                  ? "text-[#BBBFBF] hover:text-white"
                  : "text-[#0D1D1C]"
              } text-base transition ease-in-out duration-300`}>
              Terms of Use
            </a>
          </div>

          <p
            className={`${
              theme === "dark" ? "text-[#E9E9E9]" : "text-[#0D1D1C]"
            } text-sm`}>
            © 2024 Hammer Technologies LLC
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
