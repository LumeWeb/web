"use client";

import { formatDate } from "@/utils";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useEffect, useState } from "react";
import { Article } from "@/lib/prisma";
import { useFetcher } from "@remix-run/react";

const Feed = ({
  className,
  variant = "col",
  icon,
  title,
  initialData,
}: {
  className?: string;
  variant?: "row" | "col";
  title: string;
  icon: keyof typeof ICON_DICT;
  initialData: Article[];
}) => {
  const filters = ["latest", "day", "week", "month"] as const;
  const [content, setContent] = useState<NonNullable<Article[]>>(initialData);
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof filters)[number]>("latest");
  const [currentPage, setCurrentPage] = useState(0);

  const fetcher = useFetcher();
  const Icon = ICON_DICT[icon];

  useEffect(() => {
    if (currentPage !== 0) {
      // Fetch data for subsequent pages
      fetcher.load(`/api/feed?filter=${selectedFilter}&page=${currentPage}`);
    }
  }, [selectedFilter, currentPage]);

  useEffect(() => {
    if (fetcher.data && currentPage !== 0) {
      setContent((prevContent) => [...prevContent, ...fetcher.data.data]);
    }
  }, [fetcher.data, currentPage]);

  const handleFilterChange = (filter: (typeof filters)[number]) => {
    setSelectedFilter(filter);
    setCurrentPage(0);
  };

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  if (currentPage) {
    if (fetcher.state === "loading") {
      return <div>Loading...</div>;
    }

    if (!fetcher.data) {
      return <div>Failed to load</div>;
    }
  }

  return (
    <section className={`w-full h-full space-y-6 ${className}`}>
      <header className="flex flex-row space-x-3 items-start">
        <Icon className="text-primary mt-1" />
        <nav>
          <h3 className="text-primary text-xl">{title}</h3>
          <ul className="text-gray-400 text-sm list-none [&>li:hover]:text-white">
            {filters.map((filter, index) => (
              <li
                key={index}
                className={`inline cursor-pointer ${
                  index === filters.length - 1
                    ? ""
                    : "after:content-['/'] after:mx-1 after:text-gray-400"
                } ${
                  filter === selectedFilter ? "text-white" : "text-gray-400"
                }`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <ScrollArea.Root
        className={`overflow-hidden w-full h-[400px] rounded-md`}
      >
        <ScrollArea.Viewport className="w-full h-full">
          <div className={`flex gap-4 flex-${variant}`}>
            {content.map((item, index) => {
              return (
                <article
                  key={index}
                  className="flex bg-gray-800 flex-col justify-between w-full py-4 px-6 rounded"
                >
                  <span className="inline-block text-gray-500 w-full flex-1">
                    {formatDate(item.createdAt)}
                  </span>
                  <p className="inline-block text-white w-[25ch] flex-auto">
                    {item.title}
                  </p>
                </article>
              );
            })}
            {(fetcher.data as any)?.next ? (
              <button
                className="bg-gray-600 text-gray-300 rounded-md p-2 px-4"
                onClick={handleLoadMore}
              >
                Fetch more
              </button>
            ) : null}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.ScrollAreaScrollbar
          orientation="vertical"
          className="flex h-full select-none touch-none p-0.5 bg-gray-500 transition-colors duration-[160ms] ease-out hover:bg-gray-700 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        >
          <ScrollArea.ScrollAreaThumb className="flex-1 bg-gray-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.ScrollAreaScrollbar>
      </ScrollArea.Root>
    </section>
  );
};

export default Feed;

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
  );
};
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
  );
};
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
  );
};

const ICON_DICT = {
  "paper-icon": PaperIcon,
  "trend-up-icon": TrendUpIcon,
  "top-arrow-icon": TopArrowLodashIcon,
} as const;
