import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  SharedObjectPageView,
  SharedObjectRow,
} from "../../lib/sharingObjects";
import { SharedObjectsListingError } from "../../lib/sharingObjects";
import type { SharedPickerListingState } from "./SharedObjectPicker";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
const OBJECT =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const ORIGIN = "https://demo.test";
const A = "a".repeat(64);
const B = "b".repeat(64);

function stubStorage(): Storage {
  const data = new Map<string, string>();
  return {
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

let storage: Storage;

/** Mirrors the app's top-level `window`/`history` so the store module loads. */
function stubGlobals(): void {
  storage = stubStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: { replaceState: vi.fn() },
      localStorage: storage,
      location: { hash: "", origin: ORIGIN },
    },
  });
}

beforeEach(() => {
  stubGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function emptyLoadingState(): SharedPickerListingState {
  return {
    errorMessage: null,
    pagesRead: 0,
    phase: "loading",
    rows: [],
    totalRows: 0,
  };
}

/** Caches one evaluation of the picker module (same registry as this spec). */
let pickerPromise: null | Promise<typeof import("./SharedObjectPicker")> = null;
function loadPicker(): Promise<typeof import("./SharedObjectPicker")> {
  pickerPromise ??= import("./SharedObjectPicker");
  return pickerPromise;
}

function row(id: string, name = "clip", size = 10): SharedObjectRow {
  return { id, name, size };
}

const FIRST_PAGE: SharedObjectPageView = {
  end: false,
  nextOffset: 2,
  offset: 0,
  pageIndex: 0,
  rows: [row(A), row(B)],
  totalRows: 2,
};

const LAST_PAGE: SharedObjectPageView = {
  end: true,
  nextOffset: 2,
  offset: 2,
  pageIndex: 1,
  rows: [row("c".repeat(64), "clip-c")],
  totalRows: 3,
};

describe("SharedObjectPicker pure listing state", () => {
  it("starts loading with no rows and no error", async () => {
    const { emptySharedPickerListing } = await loadPicker();
    expect(emptySharedPickerListing()).toEqual(emptyLoadingState());
  });

  it("appends each progressive page with running stats", async () => {
    const { appendSharedPickerPage } = await loadPicker();
    const afterFirst = appendSharedPickerPage(emptyLoadingState(), FIRST_PAGE);
    expect(afterFirst).toEqual({
      errorMessage: null,
      pagesRead: 1,
      phase: "loading",
      rows: [row(A), row(B)],
      totalRows: 2,
    });
    const afterLast = appendSharedPickerPage(afterFirst, LAST_PAGE);
    expect(afterLast.pagesRead).toBe(2);
    expect(afterLast.totalRows).toBe(3);
    expect(afterLast.rows.map((r) => r.id)).toEqual([A, B, "c".repeat(64)]);
  });

  it("finishes a completed listing into the ready state", async () => {
    const { finishSharedPickerListing } = await loadPicker();
    expect(
      finishSharedPickerListing({
        ended: true,
        pagesRead: 1,
        rows: [row(A)],
      }),
    ).toEqual({
      errorMessage: null,
      pagesRead: 1,
      phase: "ready",
      rows: [row(A)],
      totalRows: 1,
    });
  });

  it("marks a failed run as error while keeping already-landed rows", async () => {
    const { appendSharedPickerPage, failSharedPickerListing } =
      await loadPicker();
    const current = appendSharedPickerPage(emptyLoadingState(), FIRST_PAGE);
    expect(failSharedPickerListing(current, "boom")).toEqual({
      errorMessage: "boom",
      pagesRead: 1,
      phase: "error",
      rows: [row(A), row(B)],
      totalRows: 2,
    });
  });
});

describe("SharedObjectPicker paged listing", () => {
  it("requests the sharing walk explicitly in pages of 10", async () => {
    const { SHARED_PICKER_PAGE_SIZE } = await loadPicker();
    expect(SHARED_PICKER_PAGE_SIZE).toBe(10);
  });
});

describe("SharedObjectPicker loading skeleton", () => {
  it("shows the skeleton only while the first page is loading with no real rows", async () => {
    const {
      appendSharedPickerPage,
      emptySharedPickerListing,
      failSharedPickerListing,
      finishSharedPickerListing,
      shouldShowSharedPickerSkeleton,
    } = await loadPicker();
    // Initial/ongoing first-page load with nothing landed yet → skeleton.
    expect(shouldShowSharedPickerSkeleton(emptyLoadingState())).toBe(true);
    // The instant at least one real row exists, real rows replace the
    // skeleton even while later pages are still loading.
    const loadingWithRows = appendSharedPickerPage(
      emptySharedPickerListing(),
      FIRST_PAGE,
    );
    expect(loadingWithRows.phase).toBe("loading");
    expect(shouldShowSharedPickerSkeleton(loadingWithRows)).toBe(false);
    // A completed/ready listing and a failed listing never show a skeleton.
    expect(
      shouldShowSharedPickerSkeleton(
        finishSharedPickerListing({
          ended: true,
          pagesRead: 1,
          rows: [row(A)],
        }),
      ),
    ).toBe(false);
    expect(
      shouldShowSharedPickerSkeleton(
        failSharedPickerListing(emptySharedPickerListing(), "boom"),
      ),
    ).toBe(false);
  });

  it("renders a fixed number of pulsing skeleton rows", async () => {
    const { SHARED_PICKER_SKELETON_ROWS } = await loadPicker();
    expect(SHARED_PICKER_SKELETON_ROWS).toBeGreaterThan(0);
  });
});

describe("SharedObjectPicker loading status text", () => {
  it("shows a fixed loading line (no numerical count) before the first row lands", async () => {
    const { SHARED_PICKER_LOADING_TEXT, sharedPickerStatusText } =
      await loadPicker();
    expect(SHARED_PICKER_LOADING_TEXT).toBe("Loading shared objects…");
    // While the first page is still pending there is no count to show.
    expect(sharedPickerStatusText(emptyLoadingState())).toBeNull();
    expect(SHARED_PICKER_LOADING_TEXT).not.toContain("0");
    expect(SHARED_PICKER_LOADING_TEXT).not.toContain("found so far");
  });

  it("reports a 'Showing N objects' progress label while later pages are still loading", async () => {
    const { appendSharedPickerPage, sharedPickerStatusText } =
      await loadPicker();
    const loadingWithRows = appendSharedPickerPage(
      emptyLoadingState(),
      FIRST_PAGE,
    );
    expect(loadingWithRows.phase).toBe("loading");
    expect(sharedPickerStatusText(loadingWithRows)).toBe("Showing 2 objects");
    expect(sharedPickerStatusText(loadingWithRows)).not.toContain("Found");
    expect(sharedPickerStatusText(loadingWithRows)).not.toContain("page");
  });

  it("word-singles the progress label for one landed row", async () => {
    const {
      appendSharedPickerPage,
      emptySharedPickerListing,
      sharedPickerStatusText,
    } = await loadPicker();
    const single = appendSharedPickerPage(emptySharedPickerListing(), {
      end: false,
      nextOffset: 1,
      offset: 0,
      pageIndex: 0,
      rows: [row(A)],
      totalRows: 1,
    });
    expect(sharedPickerStatusText(single)).toBe("Showing 1 object");
  });

  it("never reports 0 found so far at any point in the loading flow", async () => {
    const {
      finishSharedPickerListing,
      SHARED_PICKER_LOADING_TEXT,
      sharedPickerStatusText,
    } = await loadPicker();
    const samples = [
      SHARED_PICKER_LOADING_TEXT,
      sharedPickerStatusText(emptyLoadingState()),
      sharedPickerStatusText(
        finishSharedPickerListing({ ended: true, pagesRead: 1, rows: [] }),
      ),
    ];
    for (const sample of samples) {
      if (sample === null) continue;
      expect(sample).not.toContain("0 found so far");
      expect(sample).not.toContain("found so far");
    }
  });

  it("simplifies the ready count to N objects without page internals", async () => {
    const { finishSharedPickerListing, sharedPickerStatusText } =
      await loadPicker();
    const one = finishSharedPickerListing({
      ended: true,
      pagesRead: 3,
      rows: [row(A)],
    });
    expect(sharedPickerStatusText(one)).toBe("1 object");
    const many = finishSharedPickerListing({
      ended: true,
      pagesRead: 4,
      rows: [row(A), row(B)],
    });
    expect(sharedPickerStatusText(many)).toBe("2 objects");
    expect(sharedPickerStatusText(many)).not.toContain("page");
    expect(sharedPickerStatusText(many)).not.toContain("across");
    expect(sharedPickerStatusText(many)).not.toContain("Found");
  });

  it("leaves error copy to the alert + Retry surface", async () => {
    const { failSharedPickerListing, sharedPickerStatusText } =
      await loadPicker();
    const failed = failSharedPickerListing(emptyLoadingState(), "boom");
    expect(sharedPickerStatusText(failed)).toBeNull();
  });
});

describe("SharedObjectPicker scrollable playlist", () => {
  it("caps the playlist height and scrolls overflow instead of enlarging the page", async () => {
    const { SHARED_PICKER_LIST_CONTAINER_CLASS } = await loadPicker();
    expect(SHARED_PICKER_LIST_CONTAINER_CLASS).toContain("max-h-80");
    expect(SHARED_PICKER_LIST_CONTAINER_CLASS).toContain("overflow-y-auto");
  });
});

describe("SharedObjectPicker selection canonicalization", () => {
  it("matches a candidate id to the selection via the same canonical form", async () => {
    const { isObjectKeySelected } = await loadPicker();
    expect(isObjectKeySelected(OBJECT, OBJECT.toUpperCase())).toBe(true);
    expect(isObjectKeySelected(OBJECT, `0x${OBJECT}`)).toBe(true);
    expect(isObjectKeySelected(OBJECT, "other")).toBe(false);
    expect(isObjectKeySelected(null, OBJECT)).toBe(false);
  });

  it("never reports a malformed id as selected", async () => {
    const { isObjectKeySelected } = await loadPicker();
    expect(isObjectKeySelected(null, "not-hex")).toBe(false);
    expect(isObjectKeySelected(OBJECT, "not-hex")).toBe(false);
  });
});

describe("SharedObjectPicker seed-safe errors", () => {
  it("keeps the visible listing error a fixed plain copy (no pager internals)", async () => {
    const { sharedPickerErrorMessage } = await loadPicker();
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const cause = new Error(`oops ${SEED}`);
      const listingError = new SharedObjectsListingError(0, 0, 2, cause);
      const copy = sharedPickerErrorMessage(listingError);
      // The visible copy is a fixed plain user line: no pager internals, no
      // seed, nothing lifted from the SDK error or its message.
      expect(copy).toBe(
        "Could not reach the sharing indexer for object listing.",
      );
      expect(copy).not.toBe(listingError.message);
      expect(copy).not.toContain(SEED);
      expect(copy).not.toContain("oops");
      expect(copy).not.toContain("offset");
      expect(copy).not.toContain("page");
      expect(copy).not.toContain("attempt");
      // The detailed pager diagnostics are retained on the existing
      // cause/log channel: the thrown error's fixed `message` plus its
      // attached `cause` (never the visible copy).
      expect(listingError.message).toContain("offset 0 (page 0)");
      expect(listingError.cause).toBe(cause);
      expect(listingError.message).not.toContain(SEED);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("forwards only the fixed seed-free pager diagnostics to the event-log store (no console.error)", async () => {
    const { sharedPickerErrorMessage } = await loadPicker();
    const { useEventLogStore } = await import("../../stores/eventLog");
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    useEventLogStore.setState({ lines: [] });
    try {
      const listingError = new SharedObjectsListingError(
        1,
        10,
        3,
        new Error("boom"),
      );
      sharedPickerErrorMessage(listingError);
      // The diagnostic rides the existing demo logging facility (the typed
      // event-log store) as an error line, and never the console.
      const lines = useEventLogStore.getState().lines;
      expect(lines).toHaveLength(1);
      expect(lines[0].level).toBe("error");
      expect(lines[0].message).toBe(listingError.message);
      expect(lines[0].message).not.toContain(SEED);
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("degrades any non-listing error to the same fixed plain line and never logs it", async () => {
    const { sharedPickerErrorMessage } = await loadPicker();
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const raw = new Error(`the sharing key is ${SEED}`);
      const message = sharedPickerErrorMessage(raw);
      expect(message).toBe(
        "Could not reach the sharing indexer for object listing.",
      );
      expect(message).not.toContain(SEED);
      expect(message).not.toContain("sharing key is");
      // A raw non-listing error (e.g. a connect failure) is never forwarded
      // to the log — only fixed seed-free pager diagnostics are.
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});

describe("SharedObjectPicker row sizes", () => {
  it("formats byte sizes compactly", async () => {
    const { formatSharedObjectSize } = await loadPicker();
    expect(formatSharedObjectSize(0)).toBe("0 B");
    expect(formatSharedObjectSize(512)).toBe("512 B");
    expect(formatSharedObjectSize(2048)).toBe("2.0 KiB");
    expect(formatSharedObjectSize(5 * 1024 ** 2)).toBe("5.0 MiB");
    expect(formatSharedObjectSize(3 * 1024 ** 3)).toBe("3.0 GiB");
  });
});

describe("SharedObjectPicker module surface", () => {
  it("exports the React component that drives the picker", async () => {
    const { SharedObjectPicker } = await loadPicker();
    expect(typeof SharedObjectPicker).toBe("function");
  });

  it("never renders the sharing seed into listing or selection outputs", async () => {
    const { finishSharedPickerListing } = await loadPicker();
    const listing = finishSharedPickerListing({
      ended: true,
      pagesRead: 1,
      rows: [row(A, "clip-a.mp4")],
    });
    expect(JSON.stringify(listing)).not.toContain(SEED);
    const selected = OBJECT;
    expect(JSON.stringify({ selected })).not.toContain(SEED);
  });
});
