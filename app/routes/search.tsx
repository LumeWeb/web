import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { formatDate, getResults } from "@/utils";
import SimplifiedSearchBar from "@/components/SimplifiedSearchBar";
import { Link, useSearchParams } from "@remix-run/react";

const Page = async () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const results = await getResults({ query: query });

  return (
    <div className="w-full items-center text-lg">
      <SimplifiedSearchBar
        value={query}
        placeholder={
          query ? undefined : "Search for web3 news from the community"
        }
      />

      <Link to="/">
        <button className="my-4 -ml-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded">
          <ArrowLeftIcon className="w-4 h-4 inline mr-2 -mt-1" />
          Go Back Home
        </button>
      </Link>

      {results.length > 0 && (
        <>
          {results.map((item) => (
            <Link
              to={`/article/${item.slug}`}
              key={item.id}
              className="flex cursor-pointer flex-row items-center space-x-5 my-2 py-2 px-4 hover:bg-gray-800 rounded-md"
            >
              <span className="text-sm text-gray-400">
                {formatDate(item.timestamp)}
              </span>
              <h3 className="text-md font-semibold text-white">{item.title}</h3>
            </Link>
          ))}
          <Link to={`/search?q=${encodeURIComponent(query)}`}>
            <button className="rounded mt-4 flex justify-center items-center bg-gray-800 mx-auto w-44 py-7 text-white hover:bg-gray-800/50 transition-colors">
              Load More
            </button>
          </Link>
        </>
      )}
    </div>
  );
};

export default Page;
