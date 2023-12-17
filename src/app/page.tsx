import Feed from "@/components/Feed";
import SearchBar from "@/components/SearchBar";
import { ApiResponse, fetchFeedData } from "@/lib/feed.ts";
import * as GraphicSection from "@/components/GraphicSection";
import { ArrowIcon } from "@/components/ArrowIcon";
import { GetServerSideProps } from "next";
import { Article } from "@/lib/prisma.ts";

type Props = {
  data: ApiResponse<Article>;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  params,
}) => {
  if (!req.headers.referer && params?.q) {
    return {
      redirect: {
        destination: `/search?q=${params?.q}`,
        permanent: false,
      },
    };
  }

  const data = await fetchFeedData({});

  return { props: { data } };
};

export default async function Home({ data }: Props) {
  return (
    <>
      <SearchBar />
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
          className="h-[100px] border border-gray-800 cursor-pointer [&:hover_.link]:underline [&:hover_.background]:rotate-12 [&:hover_.background]:scale-110"
        >
          <GraphicSection.Background>
            <img
              src="/lume-logo-bg.png"
              className="background transition-transform duration-500 transform-gpu absolute -top-[320px] -right-10"
              alt=""
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
