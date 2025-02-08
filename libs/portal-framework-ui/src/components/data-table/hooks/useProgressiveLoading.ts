import { useCallback, useEffect, useState } from "react";

import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";

export interface UseProgressiveLoadingOptions<TData> {
  enableProgressiveLoading: boolean;
  enableVirtualScroll: boolean;
  progressiveLoadingBatchSize: number;
  progressiveLoadingThreshold: number;
  tableQueryResult?: {
    data?: {
      data?: TData[];
      total?: number;
    };
    refetch: (options?: any) => Promise<any>;
  };
}

export function useProgressiveLoading<TData>({
  enableProgressiveLoading,
  enableVirtualScroll,
  progressiveLoadingBatchSize,
  progressiveLoadingThreshold,
  tableQueryResult,
}: UseProgressiveLoadingOptions<TData>) {
  const { announce } = useScreenReaderAnnouncement();

  // State for progressive loading
  const [progressiveData, setProgressiveData] = useState<TData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize progressive data when tableQueryResult changes
  useEffect(() => {
    if (
      enableVirtualScroll &&
      enableProgressiveLoading &&
      tableQueryResult?.data?.data
    ) {
      setProgressiveData(tableQueryResult.data.data);
      setCurrentPage(1);
      setHasMoreData(
        tableQueryResult.data.data.length >= progressiveLoadingBatchSize,
      );
    } else if (tableQueryResult?.data?.data) {
       // If progressive loading is disabled but data is available, just set the data
       setProgressiveData(tableQueryResult.data.data);
       setCurrentPage(1);
       setHasMoreData(false); // No more data to load progressively
    } else {
       setProgressiveData([]);
       setCurrentPage(1);
       setHasMoreData(false);
    }
  }, [
    enableVirtualScroll,
    enableProgressiveLoading,
    tableQueryResult?.data?.data,
    progressiveLoadingBatchSize,
  ]);

  // Function to load more data for progressive loading
  const loadMoreData = useCallback(async () => {
    if (!hasMoreData || isLoadingMore || !tableQueryResult?.refetch) {
      return;
    }

    setIsLoadingMore(true);

    try {
      // Update the meta to request the next page
      const nextPage = currentPage + 1;

      // Call the data provider with updated meta
      const result = await tableQueryResult.refetch({
        meta: {
          progressiveLoading: true,
          progressiveLoadingBatchSize,
          progressiveLoadingCurrentPage: nextPage,
          virtualScrolling: true,
        },
        pagination: {
          mode: "off",
        },
      });

      if (result?.data?.data) {
        const newData = result.data.data;

        // Check if we received fewer items than the batch size, indicating we've reached the end
        const reachedEnd = newData.length < progressiveLoadingBatchSize;

        // Append new data to existing data
        setProgressiveData((prev) => [...prev, ...newData]);
        setCurrentPage(nextPage);
        setHasMoreData(!reachedEnd);

        // Announce to screen readers
        announce(`Loaded ${newData.length} more items`, "polite");
      } else {
        setHasMoreData(false); // Assume no more data if result is empty or malformed
      }
    } catch (error) {
      // Log the error internally but don't announce it unless specifically handled
      console.error("Error loading more data:", error);
      announce("Error loading more data", "assertive");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    hasMoreData,
    isLoadingMore,
    tableQueryResult,
    currentPage,
    progressiveLoadingBatchSize,
    announce,
  ]);

  // Handle virtual scroll events
  const handleVirtualScroll = useCallback(
    (info: {
      scrollDirection: "backward" | "forward";
      scrollOffset: number;
    }) => {
      // Check if we need to load more data for progressive loading
      if (
        enableVirtualScroll &&
        enableProgressiveLoading &&
        hasMoreData &&
        !isLoadingMore
      ) {
        const scrollPercentage = info.scrollOffset;

        // If we've scrolled past the threshold and we're scrolling forward, load more data
        if (
          scrollPercentage > progressiveLoadingThreshold &&
          info.scrollDirection === "forward"
        ) {
          loadMoreData();
        }
      }
    },
    [
      enableVirtualScroll,
      enableProgressiveLoading,
      hasMoreData,
      isLoadingMore,
      progressiveLoadingThreshold,
      loadMoreData,
    ],
  );

  return {
    currentPage,
    handleVirtualScroll,
    hasMoreData,
    isLoadingMore,
    loadMoreData,
    progressiveData,
    setIsLoadingMore, // Expose the setter for testing
  };
}
