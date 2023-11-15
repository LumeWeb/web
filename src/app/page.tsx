import SearchBar from "@/components/SearchBar"
import Image from "next/image"

const newsItems = [
  { id: 123, timestamp: Date.now(), title: "Test", description: "Well hello" }
]

export default function Home() {
  return (
    <>
      <SearchBar />
      <div className="space-y-8 w-full my-10">
        <div className="flex flex-row flex-wrap justify-between w-full">
          <Feed title="Latest from the community" icon={PaperIcon} className="w-[calc(33%-16px)] max-w-md" />
          <Feed title="Rising Posts" icon={TrendUpIcon} className="w-[calc(33%-16px)] max-w-md" />
          <Feed title="Top Posts" icon={TopArrowLodashIcon} className="w-[calc(33%-16px)] max-w-md" />
        </div>
        <Feed title="Another heading" icon={TrendUpIcon} className="w-full" variant="row" />
      </div>
    </>
  )
}

const Feed = ({
  className,
  variant = "col",
  icon: Icon,
  title
}: {
  className?: string
  variant?: "row" | "col"
  title: string
  icon: (props: React.HTMLAttributes<SVGAElement>) => React.ReactNode | JSX.Element
}) => {
  return (
    <section className={`flex flex-col space-y-6 ${className}`}>
      <header className="flex flex-row space-x-3 items-start">
        <Icon className="text-primary mt-1" />
        <nav>
          <h3 className="text-primary text-xl">{title}</h3>
          <ul className="text-gray-400 text-sm list-none [&>li:hover]:cursor-pointer [&>li:hover]:text-white">
            <li className="text-white inline after:content-['/'] after:mx-1 after:text-gray-400">
              latest
            </li>
            <li className="text-current inline after:content-['/'] after:mx-1 after:text-gray-400">
              day
            </li>
            <li className="text-current inline after:content-['/'] after:mx-1 after:text-gray-400">
              week
            </li>
            <li className="text-current inline">month</li>
          </ul>
        </nav>
      </header>
      <div className={`w-full flex gap-4 max-h-[400px] flex-${variant} ${variant === 'col' ? "overflow-y-auto" : "overflow-x-auto"}`}>
        <article className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded">
          <span className="inline-block text-gray-500 w-full flex-1">
            1h ago
          </span>
          <p className="inline-block text-white w-[25ch] flex-auto">
            Bitcoin (BTC) Price Prediction: When Will Bitcoin Reach $100,000?
          </p>
        </article>
        <article className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded">
          <span className="inline-block text-gray-500 w-full flex-1">
            1h ago
          </span>
          <p className="inline-block text-white w-[25ch] flex-auto">
            Bitcoin (BTC) Price Prediction: When Will Bitcoin Reach $100,000?
          </p>
        </article>
        <article className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded">
          <span className="inline-block text-gray-500 w-full flex-1">
            1h ago
          </span>
          <p className="inline-block text-white w-[25ch] flex-auto">
            Bitcoin (BTC) Price Prediction: When Will Bitcoin Reach $100,000?
          </p>
        </article>
        <article className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded">
          <span className="inline-block text-gray-500 w-full flex-1">
            1h ago
          </span>
          <p className="inline-block text-white w-[25ch] flex-auto">
            Bitcoin (BTC) Price Prediction: When Will Bitcoin Reach $100,000?
          </p>
        </article>
        <article className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded">
          <span className="inline-block text-gray-500 w-full flex-1">
            1h ago
          </span>
          <p className="inline-block text-white w-[25ch] flex-auto">
            Bitcoin (BTC) Price Prediction: When Will Bitcoin Reach $100,000?
          </p>
        </article>
      </div>
    </section>
  )
}

const PaperIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.75 0.75V23.25H20.25V0.75H3.75ZM6.46729 2.95093H9.23364C9.64819 2.95093 9.98364 3.28674 9.98364 3.70093C9.98364 4.11511 9.64819 4.45093 9.23364 4.45093H6.46729C6.05273 4.45093 5.71729 4.11511 5.71729 3.70093C5.71729 3.28674 6.05273 2.95093 6.46729 2.95093ZM17.5327 16.9918H6.46729C6.05273 16.9918 5.71729 16.656 5.71729 16.2418C5.71729 15.8276 6.05273 15.4918 6.46729 15.4918H17.5327C17.9473 15.4918 18.2827 15.8276 18.2827 16.2418C18.2827 16.656 17.9473 16.9918 17.5327 16.9918ZM17.5327 14.1639H6.46729C6.05273 14.1639 5.71729 13.8281 5.71729 13.4139C5.71729 12.9998 6.05273 12.6639 6.46729 12.6639H17.5327C17.9473 12.6639 18.2827 12.9998 18.2827 13.4139C18.2827 13.8281 17.9473 14.1639 17.5327 14.1639ZM17.5327 11.3361H6.46729C6.05273 11.3361 5.71729 11.0002 5.71729 10.5861C5.71729 10.1719 6.05273 9.83606 6.46729 9.83606H17.5327C17.9473 9.83606 18.2827 10.1719 18.2827 10.5861C18.2827 11.0002 17.9473 11.3361 17.5327 11.3361ZM17.5327 8.50818H9.23364C8.81909 8.50818 8.48364 8.17236 8.48364 7.75818C8.48364 7.34399 8.81909 7.00818 9.23364 7.00818H17.5327C17.9473 7.00818 18.2827 7.34399 18.2827 7.75818C18.2827 8.17236 17.9473 8.50818 17.5327 8.50818Z"
        fill="currentColor"
      />
    </svg>
  )
}
const TopArrowLodashIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.0001 4.97949L16.7458 9.72518H7.25439L12.0001 4.97949Z"
        fill="currentColor"
      />
      <path
        d="M12.7896 22.0004V8.23828H11.2106V22.0004H12.7896Z"
        fill="currentColor"
      />
      <path
        d="M16.7456 3.57846V1.99951L7.25423 1.99951V3.57846L16.7456 3.57846Z"
        fill="currentColor"
      />
    </svg>
  )
}
const TrendUpIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_61_503)">
        <path
          d="M23.0769 6L13.5769 15.5L8.5769 10.5L1.0769 18"
          stroke="#ACF9C0"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17.0769 6H23.0769V12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_61_503">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0.0769043)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
