import React, { FormEvent } from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { formatDate } from "@/utils"
import SimplifiedSearchBar from "@/components/SimplifiedSearchBar"

type Props = {
  searchParams: {
    q?: string
  }
}

const Page = async ({ searchParams }: Props) => {
  const query = searchParams.q ?? ""
  const results = await getResults({ query: searchParams.q })

  return (
    <div className="w-full items-center text-lg">
        <SimplifiedSearchBar value={query} placeholder={query ? undefined : "Search for web3 news from the community"}/>
        
      <button className="my-4 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded">
        <ArrowLeftIcon className="w-4 h-4 inline mr-2 -mt-1" />
        Go Back Home
      </button>

      {results.length > 0 && (
        <>
          {results.map((item) => (
            <div
              key={item.id}
              className="flex cursor-pointer flex-row items-center space-x-5 my-2 py-2 px-4 hover:bg-gray-800 rounded-md"
            >
              <span className="text-sm text-gray-400">
                {formatDate(item.timestamp)}
              </span>
              <h3 className="text-md font-semibold text-white">{item.title}</h3>
            </div>
          ))}
          <Link href={`/search?q=${encodeURIComponent(query)}`}>
            <button className="rounded mt-4 flex justify-center items-center bg-gray-800 mx-auto w-44 py-7 text-white hover:bg-gray-800/50 transition-colors">
              Load More
            </button>
          </Link>
        </>
      )}
    </div>
  )
}

async function getResults({
  query
}: {
  query?: string
}): Promise<SearchResult[]> {
  if (!query) return []

  return [
    {
      id: 1,
      timestamp: new Date(),
      title: "Mock Title 1",
      description: "Mock Description 1"
    },
    {
      id: 2,
      timestamp: new Date(),
      title: "Mock Title 2",
      description: "Mock Description 2"
    }
  ]
}

export default Page
