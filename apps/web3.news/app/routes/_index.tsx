import Feed from "@/components/Feed";
import SearchBar from "@/components/SearchBar";
import { ApiResponse, fetchFeedData } from "@/lib/feed";
import * as GraphicSection from "@/components/GraphicSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { Article } from "@/lib/prisma";

import Logo from "@/images/lume-logo-bg.png";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { SiteList } from "@/types.js";
import { getAvailableSites } from "@/utils";
import { generateMetaTags } from "@/lib/meta.js";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime";

type LoaderData = {
  data: ApiResponse<Article>;
  sites: SiteList;
};

export function meta(meta: ServerRuntimeMetaArgs) {
  const title =
    "web3.news - Your Community Hub for Web3, DeFi, and the Open Web";
  const description =
    "Discover Web3.news: Your hub for community-driven FOSS news in Web3, Crypto, and DeFi. Engage in collaboration, innovation, and uphold free speech and privacy.";

  return [
    ...generateMetaTags({
      title: title,
      description: description,
      parentMeta: meta,
    }),
  ];
}
export let loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const referer = request.headers.get("referer");
  const queryParam = url.searchParams.get("q");

  // Handle redirection based on referer and query parameters
  if (!referer && queryParam) {
    return redirect(`/search?q=${queryParam}`);
  }

  // Fetch your data here
  const data = await fetchFeedData({});

  const sites = getAvailableSites();

  // Return the fetched data as JSON
  return json({ data, sites });
};

export default function Index() {
  let { data, sites } = useLoaderData<LoaderData>();
  return (
    <>
      <div className="bg-muted p-6 mt-10 rounded-lg w-full text-center">
        <p className="text-muted-foreground font-bold mb-2">MVP Notice</p>
        <p className="text-muted-foreground mb-4">
          This is a Minimum Viable Product (MVP) and we need your feedback and
          involvement to help it evolve. Please join our community forums to
          discuss more and contribute to the project's growth.
        </p>
        <p className="text-muted-foreground mb-4">
          Additionally the primary way to use web3.news is currently best
          through the community forums, since active development of the web app
          is on hold.
        </p>
        <a href="https://forum.web3.news" className="text-primary underline">
          Visit Community Forums
        </a>
      </div>
      <SearchBar sites={sites} />
      <div className="space-y-8 w-full my-10">
        <div className="flex flex-row flex-wrap justify-between w-full">
          <Feed
            title="Latest from the community"
            icon={"paper-icon"}
            className="w-[calc(33%-20px)] max-w-md"
            initialData={data.data}
          />
        </div>
        <GraphicSection.Root
          href="https://lumeweb.com"
          className="h-[100px] border border-gray-800 cursor-pointer [&:hover_.link]:underline [&:hover_.background]:rotate-12 [&:hover_.background]:scale-110">
          <GraphicSection.Background>
            <img
              src={Logo}
              className="background transition-transform duration-500 transform-gpu absolute -top-[320px] -right-10"
              alt="Logo background"
              aria-hidden
            />
          </GraphicSection.Background>
          <GraphicSection.Foreground>
            <div className="mt-5 flex flex-col items-center justify-center">
              <p className="text-white text-lg">
                WEB3.NEWS is a project by Lume. Let’s build an open, user-owned
                web together.
              </p>
              <div className="link flex text-gray-400">
                <span>Learn more about Lume and join our community</span>
                <ArrowIcon className=" ml-2 mt-2" />
              </div>
            </div>
          </GraphicSection.Foreground>
        </GraphicSection.Root>
      </div>
    </>
  );
}
