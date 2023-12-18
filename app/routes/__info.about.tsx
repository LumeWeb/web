import { ArrowIcon } from "@/components/ArrowIcon";
import * as GraphicSection from "@/components/GraphicSection";

import Logo from "@/images/lume-logo-bg.png";

export default function Page() {
  return (
    <span className="px-8 block text-gray-400 space-y-5">
      <h1 className="text-primary text-3xl leading-9">
        An evolved, user-owned web where you have access to the world in a way
        only you control.
      </h1>
      <p className="text-white mt-3 leading-7">
        Web3 is about what you want to do, post, read, play, chat, or interact
        without others saying otherwise. It is about freedom of speech and
        freedom of economy.
      </p>
      <p>
        First defined by Gavin Wood when the Ethereum network was starting out.
        He defined it as a &quot;decentralized online ecosystem based on
        blockchain&quot;.
      </p>

      <p>
        However, we view it as much more than that, and definitely more than
        access to DeFi. We see a ton of more potential to what Web3 as an ideal
        can evolve to, and are setting out to make it a reality.
      </p>

      <p>
        To those that see Web3 as DeFi, we ask this: Do you go on your web
        browser to access TradingView or other market tools as your homepage, or
        do you go check your social media, email, and news sites, as well as
        your money? Blockchain itself is more than just money, and so is Web3,
        and by extension P2P networks.
      </p>

      <p>So help us in our goals to level-up Web3.</p>
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
