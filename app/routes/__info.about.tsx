import { ArrowIcon } from "@/components/ArrowIcon";
import * as GraphicSection from "@/components/GraphicSection";

import Logo from "@/images/lume-logo-bg.png";

export default function Page() {
  return (
    <span className="px-8 block text-gray-400 space-y-5">
      <h1 className="text-primary text-3xl leading-9">
        Web3.news: Your Community-Focused FOSS News Platform
      </h1>
      <p className="mt-3 leading-7">
        At Web3.news, we're dedicated to addressing a vital need in the Web3,
        Crypto, and DeFi ecosystems: providing a{" "}
        <b>trusted, single-source platform </b>
        for community-centered news. Born from the vision inspired by Satoshi's
        pioneering work, we strive to uphold the principles of{" "}
        <b>financial freedom </b>
        and <b>free speech</b>.
      </p>
      <p className="mt-3 leading-7">
        We aim to transcend tribalism, a challenging but vital goal, fostering a
        spirit of <b>unity </b> among diverse factions within the Web3 culture.
        Our platform is a space where cyberpunks, lunarpunks, solarpunks, and
        all enthusiasts collaborate in advancing technology that safeguards our{" "}
        <b>civil liberties</b>, especially <b>privacy</b>, while steering clear
        of the usual hype and overstatement.
      </p>

      <p className="mt-3 leading-7">
        Web3.news is more than a platform; it's a <b>sanctuary </b> for everyone
        in the community, a place where <b>collaboration and innovation </b>{" "}
        take precedence over competition and division.
      </p>
      <p className="mt-3 leading-7">
        Join us in our mission to elevate Web3. Together, we can shape a future
        that emphasizes <b>collective advancement </b> and{" "}
        <b>universal empowerment</b>, where progress is shared and{" "}
        <b>everyone has a voice</b>.
      </p>

      <GraphicSection.Root
        href="https://lumeweb.com"
        className="h-[300px] border border-gray-800 cursor-pointer [&:hover_.link]:underline [&:hover_.background]:rotate-12 [&:hover_.background]:scale-110"
      >
        <GraphicSection.Background>
          <img
            src={Logo}
            className="background opacity-50 transition-transform duration-500 transform-gpu absolute -top-[100px] -left-10"
            alt=""
            aria-hidden
          />
        </GraphicSection.Background>
        <GraphicSection.Foreground>
          <div className="flex flex-col items-start justify-center h-full w-[500px] float-right mr-20">
            <p className="text-white text-2xl">
              WEB3.NEWS is a project by <span className="underline">Lume</span>.
              Let’s build an open, user-owned web together.
            </p>
            <div className="link mt-2 flex text-gray-400">
              <span>Learn more about Lume and join our community</span>
              <ArrowIcon className=" ml-2 mt-2" />
            </div>
          </div>
        </GraphicSection.Foreground>
      </GraphicSection.Root>
    </span>
  );
}
