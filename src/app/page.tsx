import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Feed from "@/components/Feed";
import SearchBar from "@/components/SearchBar";
import { fetchFeedData } from "@/lib/feed.ts";

type Props = {
  searchParams?: {
    q?: string | undefined;
  };
};

export default async function Home({ searchParams }: Props) {
  const headerList = headers();
  const referer = headerList.get("referer");

  if (!referer && searchParams?.q) {
    redirect(`/search?q=${searchParams.q}`);
  }

  const data = await fetchFeedData({});

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
      </div>
    </>
  );
}
