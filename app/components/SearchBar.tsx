import React, {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline"; // Assuming usage of Heroicons for icons
import { flushSync } from "react-dom";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import { FILTER_TIMES, formatDate } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SitesCombobox } from "./SitesCombobox";
import { SearchResult, SiteList } from "@/types.js";

type Props = {};

const SearchBar = ({ sites }: { sites: SiteList }) => {
  let [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>();
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(true);
  const [dirtyInput, setDirtyInput] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const fetcher = useFetcher({ key: "seach" });

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      doSearch();
    },
    [query]
  );

  function doSearch() {
    setIsLoading(true);
    let newSearchParams = new URLSearchParams(searchParams.toString());

    if (query) {
      newSearchParams.set("q", query);
    } else {
      newSearchParams.delete("q");
      return;
    }

    if (selectedSite) {
      newSearchParams.set("site", selectedSite);
    }

    if (selectedTime) {
      const timestampInMilliseconds = Date.parse(selectedTime); // Date.parse returns the timestamp in milliseconds
      const timestamp = timestampInMilliseconds / 1000;
      newSearchParams.set("time", timestamp.toString());
    }

    fetcher.load(`/api/search?${newSearchParams}`);
  }

  useEffect(() => {
    if (fetcher.data) {
      setResults(fetcher.data as SearchResult[]);
      setIsLoading(false);
      setActiveInput(false);
    }
  }, [fetcher.data]);

  useEffect(() => {
    doSearch();
  }, [selectedSite, selectedTime]);

  const isActive = results.length > 0 || dirtyInput;

  return (
    <div
      className={`w-full mt-8  p-4 border-2 ${
        isActive ? "border-sky-300 bg-gray-950" : "border-primary"
      }`}
    >
      <form className={`flex items-center text-lg`} onSubmit={handleSearch}>
        {isLoading || isActive ? (
          <span className="text-white mr-2">Searching for</span>
        ) : null}
        {activeInput ? (
          <fieldset
            className={`block w-full p-0 h-auto flex-1 overflow-hidden`}
          >
            {isActive ? (
              <span className="text-blue-300 underline-offset-4 underline mr-[-0.5px]">
                {'"'}
              </span>
            ) : (
              ""
            )}
            <input
              ref={(element) => {
                if (element) {
                  inputRef.current = element;
                }
              }}
              className={`flex-grow inline bg-transparent text-white placeholder-gray-400 outline-none ring-none ${
                isActive
                  ? `text-blue-300 p-0 underline underline-offset-4`
                  : "w-full p-2"
              }`}
              placeholder={
                !isActive
                  ? "Search for web3 news from the community"
                  : undefined
              }
              value={query}
              size={query ? query.length : 1}
              style={
                query
                  ? {
                      width: `calc(${query.length}ch+2px)`,
                    }
                  : undefined
              }
              onChange={(e) => {
                if (!dirtyInput) {
                  setDirtyInput(true);
                }
                setQuery(e.target.value);
              }}
            />
            {isActive ? (
              <span className="text-blue-300 underline-offset-4 underline ml-[-5.5px]">
                {'"'}
              </span>
            ) : (
              ""
            )}
          </fieldset>
        ) : (
          <span
            className="block w-full flex-1 text-blue-300"
            onClick={() => {
              flushSync(() => {
                setActiveInput(true);
              });
              inputRef.current?.focus();
            }}
          >
            {'"'}
            {query}
            {'"'}
          </span>
        )}
        {isLoading ? (
          // Shadcn Loading component placeholder
          <LoadingComponent />
        ) : (
          <div className="justify-self-end min-w-[220px] flex justify-end gap-2">
            {/* Dropdown component should be here */}
            <SitesCombobox siteList={sites} onSiteSelect={setSelectedSite} />
            {/* Dropdown component should be here */}
            <Select
              defaultValue={"0"}
              onValueChange={(v) => setSelectedTime(v)}
            >
              <SelectTrigger className="hover:bg-muted w-auto">
                <SelectValue placeholder="Time ago" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_TIMES.map((v) => (
                  <SelectItem
                    value={String(v.value)}
                    key={`FilteTimeSelectItem_${v.value}`}
                  >
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form>

      {results.length > 0 && (
        <>
          <hr className="my-4 border-1" />
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
            <button className="mt-4 flex justify-center items-center bg-secondary w-full py-7 text-white hover:bg-teal-800 transition-colors">
              {results.length}+ search results for{" "}
              <span className="text-blue-300 ml-1">{query}</span>
              <ChevronRightIcon className="w-5 h-5 inline ml-2 mt-[1px]" />
            </button>
          </Link>
        </>
      )}
    </div>
  );
};

// Placeholder components for Shadcn
const LoadingComponent = () => {
  // Replace with actual Shadcn Loading component
  return <div>Loading...</div>;
};

export default SearchBar;
