"use client"

import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline" // Assuming usage of Heroicons for icons
import { flushSync } from "react-dom"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { formatDate, getResults } from "@/utils"

type Props = {
}

const SearchBar = ({ }: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const inputRef = useRef<HTMLInputElement>()
  const [isLoading, setIsLoading] = useState(false)
  const [activeInput, setActiveInput] = useState(true)
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault()
      setIsLoading(true)
      const newSearchParams = new URLSearchParams(searchParams)

      if (query) {
        newSearchParams.set("q", query)
      } else {
        newSearchParams.delete("q")
      }

      router.push(`${pathname}?${newSearchParams}`)

      // Perform search and update results state
      // Assume fetchResults is a function that fetches search results
      // const searchResults = await fetchResults(query);
      // Mock the search results
      const searchResults = await getResults({ query })

      setResults(searchResults)
      setIsLoading(false)
      setActiveInput(false)
    },
    [
      query,
      setResults,
      setIsLoading,
      setActiveInput,
      searchParams,
      router,
      pathname
    ]
  )

  useEffect(() => {
    if (searchParams.get("q") && searchParams.get("q") !== "") {
      handleSearch()
    }
  }, [searchParams, handleSearch])

  return (
    <div
      className={`w-full mt-8  p-4 border-2 ${
        results.length > 0 ? "border-sky-300 bg-gray-950" : "border-primary"
      }`}
    >
      <form className={`flex items-center text-lg`} onSubmit={handleSearch}>
        {isLoading || results.length > 0 ? (
          <span className="text-white mr-2">Searching for</span>
        ) : null}
        {activeInput ? (
          <fieldset
            className={`block w-full p-0 h-auto flex-1 overflow-hidden`}
          >
            {results.length > 0 ? (
              <span className="text-blue-300 underline-offset-4 underline mr-[-0.5px]">
                {'"'}
              </span>
            ) : (
              ""
            )}
            <input
              ref={(element) => {
                if (element) {
                  inputRef.current = element
                }
              }}
              className={`flex-grow inline bg-transparent text-white placeholder-gray-400 outline-none ring-none ${
                results.length > 0
                  ? `text-blue-300 p-0 underline underline-offset-4`
                  : "w-full p-2"
              }`}
              placeholder={
                results.length === 0
                  ? "Search for web3 news from the community"
                  : undefined
              }
              value={query}
              size={query ? query.length : 1}
              style={
                query
                  ? {
                      width: `calc(${query.length}ch+2px)`
                    }
                  : undefined
              }
              onChange={(e) => setQuery(e.target.value)}
            />
            {results.length > 0 ? (
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
                setActiveInput(true)
              })
              inputRef.current?.focus()
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
          <div className="justify-self-end w-[220px] flex">
            {/* Dropdown component should be here */}
            <div className="uppercase text-white text-[12px] mx-3 font-semibold">
              <span>All Sites</span>
              <ChevronDownIcon className="w-4 h-4 inline-block ml-2" />
            </div>
            {/* Dropdown component should be here */}
            <div className="uppercase text-white text-[12px] mx-3 font-semibold">
              <span>All Times</span>
              <ChevronDownIcon className="w-4 h-4 inline-block ml-2" />
            </div>
          </div>
        )}
      </form>

      {results.length > 0 && (
        <>
          <hr className="my-4 border-1" />
          {results.map((item) => (
            <Link
              href={`/article/${item.slug}`}
              key={item.id}
              className="flex cursor-pointer flex-row items-center space-x-5 my-2 py-2 px-4 hover:bg-gray-800 rounded-md"
            >
              <span className="text-sm text-gray-400">
                {formatDate(item.timestamp)}
              </span>
              <h3 className="text-md font-semibold text-white">{item.title}</h3>
            </Link>
          ))}
          <Link href={`/search?q=${encodeURIComponent(query)}`}>
            <button className="mt-4 flex justify-center items-center bg-secondary w-full py-7 text-white hover:bg-teal-800 transition-colors">
              {results.length}+ search results for{" "}
              <span className="text-blue-300 ml-1">{query}</span>
              <ChevronRightIcon className="w-5 h-5 inline ml-2 mt-[1px]" />
            </button>
          </Link>
        </>
      )}
    </div>
  )
}

// Placeholder components for Shadcn
const LoadingComponent = () => {
  // Replace with actual Shadcn Loading component
  return <div>Loading...</div>
}

export default SearchBar
