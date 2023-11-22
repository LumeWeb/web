import Feed from "@/components/Feed"
import SearchBar from "@/components/SearchBar"

export default function Home() {
  return (
    <>
      <SearchBar />
      <div className="space-y-8 w-full my-10">
        <div className="flex flex-row flex-wrap justify-between w-full">
          <Feed
            title="Latest from the community"
            icon={'paper-icon'}
            className="w-[calc(33%-16px)] max-w-md"
          />
          <Feed
            title="Rising Posts"
            icon={'trend-up-icon'}
            className="w-[calc(33%-16px)] max-w-md"
          />
          <Feed
            title="Top Posts"
            icon={'top-arrow-icon'}
            className="w-[calc(33%-16px)] max-w-md"
          />
        </div>
        <Feed
          title="Another heading"
          icon={'trend-up-icon'}
          className="w-full"
        />
      </div>
    </>
  )
}