import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useProgressiveLoading } from "./useProgressiveLoading";
import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";
import type { PolitenessLevel } from "../../screen-reader/hooks/useScreenReaderAnnouncement"; // Import PolitenessLevel

// Mock the screen reader hook
vi.mock("../../screen-reader/hooks/useScreenReaderAnnouncement", () => ({
  useScreenReaderAnnouncement: vi.fn(),
}));

const mockAnnounce = vi.fn();
const mockRefetch = vi.fn();
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("useProgressiveLoading", () => {
  const defaultOptions = {
    enableProgressiveLoading: true,
    enableVirtualScroll: true,
    progressiveLoadingBatchSize: 10,
    progressiveLoadingThreshold: 0.8,
    tableQueryResult: {
      data: undefined,
      refetch: mockRefetch,
    },
  };

  beforeEach(() => {
    vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
      announce: mockAnnounce,
      announcement: "", // Add mock for announcement
      politeness: "polite" as PolitenessLevel, // Add mock for politeness
    });
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({ data: { data: [], total: 0 } }); // Default refetch returns empty
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useProgressiveLoading(defaultOptions));

    expect(result.current.progressiveData).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    // When no initial data is provided, hasMoreData should be false after the effect runs
    expect(result.current.hasMoreData).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it("should initialize progressiveData and state when tableQueryResult.data changes", () => {
    const initialData = Array(defaultOptions.progressiveLoadingBatchSize).fill({ id: 1 });
    const tableQueryResult = {
      data: { data: initialData, total: 20 },
      refetch: mockRefetch,
    };
    const options = { ...defaultOptions, tableQueryResult };

    const { result } = renderHook(() => useProgressiveLoading(options));

    expect(result.current.progressiveData).toEqual(initialData);
    expect(result.current.currentPage).toBe(1);
    // hasMoreData is true because initial data size >= batch size
    expect(result.current.hasMoreData).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it("should set hasMoreData to false if initial data is less than batch size", () => {
    const initialData = Array(5).fill({ id: 1 }); // Less than batch size 10
    const tableQueryResult = {
      data: { data: initialData, total: 5 },
      refetch: mockRefetch,
    };
    const options = { ...defaultOptions, tableQueryResult };

    const { result } = renderHook(() => useProgressiveLoading(options));

    expect(result.current.progressiveData).toEqual(initialData);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMoreData).toBe(false);
  });

  describe("loadMoreData", () => {
    const initialData = Array(defaultOptions.progressiveLoadingBatchSize).fill({ id: 1 });
    const tableQueryResult = {
      data: { data: initialData, total: 20 },
      refetch: mockRefetch,
    };
    const options = { ...defaultOptions, tableQueryResult };

    beforeEach(() => {
      // Simulate initial load by rendering once
      renderHook(() => useProgressiveLoading(options));
      // Clear mocks after initial render effect runs
      vi.clearAllMocks();
      mockRefetch.mockResolvedValue({ data: { data: [], total: 0 } }); // Reset refetch mock
      mockConsoleError.mockClear();
      vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
        announce: mockAnnounce,
        announcement: "", // Add mock for announcement
        politeness: "polite" as PolitenessLevel, // Add mock for politeness
      });
    });

    it("should call refetch with correct meta for the next page", async () => {
      const { result } = renderHook(() => useProgressiveLoading(options));

      await act(async () => {
        await result.current.loadMoreData();
      });

      expect(mockRefetch).toHaveBeenCalledWith({
        meta: {
          progressiveLoading: true,
          progressiveLoadingBatchSize: defaultOptions.progressiveLoadingBatchSize,
          progressiveLoadingCurrentPage: 2, // Next page is 2
          virtualScrolling: true,
        },
        pagination: {
          mode: "off",
        },
      });
    });

    it("should append new data to progressiveData and update state on success", async () => {
      const newData = Array(defaultOptions.progressiveLoadingBatchSize).fill({ id: 11 });
      mockRefetch.mockResolvedValue({ data: { data: newData, total: 30 } });

      const { result } = renderHook(() => useProgressiveLoading(options));

      // Initial state after effect
      expect(result.current.progressiveData.length).toBe(defaultOptions.progressiveLoadingBatchSize);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMoreData).toBe(true);

      await act(async () => {
        await result.current.loadMoreData();
      });

      // Wait for state updates
      await waitFor(() => {
        expect(result.current.progressiveData.length).toBe(
          defaultOptions.progressiveLoadingBatchSize * 2,
        );
        expect(result.current.currentPage).toBe(2);
        expect(result.current.hasMoreData).toBe(true); // Still more data
        expect(result.current.isLoadingMore).toBe(false);
      });

      expect(mockAnnounce).toHaveBeenCalledWith(
        `Loaded ${newData.length} more items`,
        "polite",
      );
    });

    it("should set hasMoreData to false if received data is less than batch size", async () => {
      const newData = Array(5).fill({ id: 11 }); // Less than batch size
      mockRefetch.mockResolvedValue({ data: { data: newData, total: 15 } });

      const { result } = renderHook(() => useProgressiveLoading(options));

      await act(async () => {
        await result.current.loadMoreData();
      });

      await waitFor(() => {
        expect(result.current.progressiveData.length).toBe(
          defaultOptions.progressiveLoadingBatchSize + newData.length,
        );
        expect(result.current.currentPage).toBe(2);
        expect(result.current.hasMoreData).toBe(false); // Reached end
        expect(result.current.isLoadingMore).toBe(false);
      });

      expect(mockAnnounce).toHaveBeenCalledWith(
        `Loaded ${newData.length} more items`,
        "polite",
      );
    });

    it("should handle refetch error", async () => {
      const errorMessage = "Failed to fetch";
      mockRefetch.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useProgressiveLoading(options));

      await act(async () => {
        await result.current.loadMoreData();
      });

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(false);
      });

      // Data and page should not change on error
      expect(result.current.progressiveData.length).toBe(defaultOptions.progressiveLoadingBatchSize);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMoreData).toBe(true); // hasMoreData doesn't change on error

      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error loading more data:",
        expect.any(Error),
      );
      expect(mockAnnounce).toHaveBeenCalledWith("Error loading more data", "assertive");
    });

    it("should not load more data if hasMoreData is false", async () => {
      // Provide initial data less than batch size to ensure hasMoreData becomes false
      const initialDataLessThanBatch = Array(5).fill({ id: 1 });
      const optionsNoMore = { ...options, tableQueryResult: { data: { data: initialDataLessThanBatch, total: initialDataLessThanBatch.length }, refetch: mockRefetch } };
      const { result } = renderHook(() => useProgressiveLoading(optionsNoMore));

      // Wait for initial effect to set hasMoreData to false
      await waitFor(() => {
        expect(result.current.hasMoreData).toBe(false);
      });

      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not load more data if isLoadingMore is true", async () => {
      const { result } = renderHook(() => useProgressiveLoading(options));

      act(() => {
        result.current.setIsLoadingMore(true); // Manually set loading state
      });

      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });
  });

  describe("handleVirtualScroll", () => {
    const initialData = Array(defaultOptions.progressiveLoadingBatchSize).fill({ id: 1 });
    const tableQueryResult = {
      data: { data: initialData, total: 20 },
      refetch: mockRefetch,
    };
    const options = { ...defaultOptions, tableQueryResult };

    beforeEach(() => {
      // Clear mocks before each test in this block
      vi.clearAllMocks();
      mockRefetch.mockResolvedValue({ data: { data: [], total: 0 } }); // Reset refetch mock
      mockConsoleError.mockClear();
      vi.mocked(useScreenReaderAnnouncement).mockReturnValue({
        announce: mockAnnounce,
        announcement: "", // Add mock for announcement
        politeness: "polite" as PolitenessLevel, // Add mock for politeness
      });
    });

    it("should trigger loadMoreData when scrolling forward past threshold", async () => {
      // Render the hook within the test
      const { result } = renderHook(() => useProgressiveLoading(options));

      // Wait for the initial effect to set hasMoreData to true (since initialData.length === batch size)
      await waitFor(() => {
        expect(result.current.hasMoreData).toBe(true);
      });

      // Spy on the refetch function which loadMoreData calls
      const refetchSpy = mockRefetch; // mockRefetch is already a spy
      refetchSpy.mockClear(); // Clear calls from initial render if any

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01, // Just past threshold
        });
      });

      // loadMoreData is async, so we need to wait for refetch to be called
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalled();
      });

      // Assert that refetch was called with the correct arguments for the next page
      expect(refetchSpy).toHaveBeenCalledWith({
        meta: {
          progressiveLoading: true,
          progressiveLoadingBatchSize: defaultOptions.progressiveLoadingBatchSize,
          progressiveLoadingCurrentPage: 2, // Expecting page 2
          virtualScrolling: true,
        },
        pagination: {
          mode: "off",
        },
      });
    });

    it("should not trigger loadMoreData when scrolling backward", async () => {
      const { result } = renderHook(() => useProgressiveLoading(options));
      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "backward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      // Give it a moment to ensure async loadMoreData isn't called
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not trigger loadMoreData when below threshold", async () => {
      const { result } = renderHook(() => useProgressiveLoading(options));
      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold - 0.01, // Just below threshold
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not trigger loadMoreData if enableProgressiveLoading is false", async () => {
      const optionsNoProgressive = { ...options, enableProgressiveLoading: false };
      const { result } = renderHook(() => useProgressiveLoading(optionsNoProgressive));
      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not trigger loadMoreData if enableVirtualScroll is false", async () => {
      const optionsNoVirtual = { ...options, enableVirtualScroll: false };
      const { result } = renderHook(() => useProgressiveLoading(optionsNoVirtual));
      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not trigger loadMoreData if hasMoreData is false", async () => {
      // Provide initial data less than batch size to ensure hasMoreData becomes false
      const initialDataLessThanBatch = Array(5).fill({ id: 1 });
      const optionsNoMore = { ...options, tableQueryResult: { data: { data: initialDataLessThanBatch, total: initialDataLessThanBatch.length }, refetch: mockRefetch } };
      const { result } = renderHook(() => useProgressiveLoading(optionsNoMore));

      // Wait for initial effect to set hasMoreData to false
      await waitFor(() => {
        expect(result.current.hasMoreData).toBe(false);
      });

      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it("should not trigger loadMoreData if isLoadingMore is true", async () => {
      const { result } = renderHook(() => useProgressiveLoading(options));

      act(() => {
        result.current.setIsLoadingMore(true); // Manually set loading state
      });

      const loadMoreSpy = vi.spyOn(result.current, "loadMoreData");

      act(() => {
        result.current.handleVirtualScroll({
          scrollDirection: "forward",
          scrollOffset: defaultOptions.progressiveLoadingThreshold + 0.01,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });
  });
});
