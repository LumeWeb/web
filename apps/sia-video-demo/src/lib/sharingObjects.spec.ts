import { describe, expect, it, vi } from "vitest";
import {
  createSharedObjectsClient,
  decodeObjectName,
  listSharedObjects,
  type SharedObjectPageView,
  type SharedObjectRow,
  SharedObjectsListingError,
  type SharedObjectsPageClient,
} from "./sharingObjects";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
const hex = (c: string): string => c.repeat(64);
const A = hex("a");
const B = hex("b");
const C = hex("c");
const D = hex("d");

function clientFor(
  pages: SharedObjectRow[][],
  pageSize: number,
): { calls: [number, number][]; client: SharedObjectsPageClient } {
  const calls: [number, number][] = [];
  return {
    calls,
    client: {
      fetchPage: (offset, limit) => {
        calls.push([offset, limit]);
        return Promise.resolve(pages[offset / pageSize] ?? []);
      },
    },
  };
}

function row(id: string, name = id.slice(0, 6), size = 42): SharedObjectRow {
  return { id, name, size };
}

describe("listSharedObjects — progressive paging and page views", () => {
  it("walks pages in order, emitting one onPage view per page with stats/cursor", async () => {
    const pagesSeen: SharedObjectPageView[] = [];
    const onPage = vi.fn((page: SharedObjectPageView) => {
      pagesSeen.push(page);
    });
    const { client } = clientFor([[row(A), row(B), row(C)], [row(D)]], 3);
    const result = await listSharedObjects(client, { onPage, pageSize: 3 });

    expect(result).toEqual({
      ended: true,
      pagesRead: 2,
      rows: [row(A), row(B), row(C), row(D)],
    });
    expect(onPage).toHaveBeenCalledTimes(2);
    expect(pagesSeen[0]).toEqual({
      end: false,
      nextOffset: 3,
      offset: 0,
      pageIndex: 0,
      rows: [row(A), row(B), row(C)],
      totalRows: 3,
    });
    expect(pagesSeen[1]).toEqual({
      end: true,
      nextOffset: 3,
      offset: 3,
      pageIndex: 1,
      rows: [row(D)],
      totalRows: 4,
    });
  });

  it("ends immediately on an empty first page without fetching again", async () => {
    const calls: [number, number][] = [];
    const result = await listSharedObjects(
      {
        fetchPage: (offset, limit) => {
          calls.push([offset, limit]);
          return Promise.resolve([]);
        },
      },
      { pageSize: 3 },
    );

    expect(result).toEqual({ ended: true, pagesRead: 1, rows: [] });
    expect(calls).toEqual([[0, 3]]);
  });

  it("passes pageSize through to every fetch", async () => {
    const { calls, client } = clientFor(
      [[row(A), row(B), row(C)], [row(D)]],
      3,
    );
    await listSharedObjects(client, { pageSize: 3 });
    expect(calls).toEqual([
      [0, 3],
      [3, 3],
    ]);
  });
});

describe("listSharedObjects — stable row deduplication", () => {
  it("drops duplicate ids within and across pages, keeping first occurrence", async () => {
    const pagesSeen: SharedObjectPageView[] = [];
    const onPage = vi.fn((page: SharedObjectPageView) => {
      pagesSeen.push(page);
    });
    const { client } = clientFor(
      [
        [row(A), row(B), row(A)],
        [row(B), row(C)],
      ],
      3,
    );
    const result = await listSharedObjects(client, { onPage, pageSize: 3 });

    expect(result.rows.map((r) => r.id)).toEqual([A, B, C]);
    expect(pagesSeen[0]?.rows).toEqual([row(A), row(B)]);
    expect(pagesSeen[1]?.rows).toEqual([row(C)]);
    expect(pagesSeen[1]?.totalRows).toBe(3);
  });

  it("treats 0x-prefixed and uppercase ids as the same canonical object", async () => {
    const { client } = clientFor(
      [
        [
          { id: `0x${A.toUpperCase()}`, name: "upper", size: 1 },
          row(B),
          row(C),
        ],
        [{ id: A, name: "lower", size: 2 }],
      ],
      3,
    );
    const result = await listSharedObjects(client, { pageSize: 3 });

    expect(result.rows).toEqual([
      { id: A, name: "upper", size: 1 },
      row(B),
      row(C),
    ]);
  });
});

describe("listSharedObjects — retryable errors", () => {
  it("retries a flaky page in place at the same offset and emits one page view", async () => {
    const onPage = vi.fn();
    const flaky = vi
      .fn()
      .mockRejectedValueOnce(new Error("error sending request"))
      .mockResolvedValueOnce([row(A), row(B), row(C)])
      .mockResolvedValueOnce([row(D)]);
    const result = await listSharedObjects(
      { fetchPage: flaky },
      { onPage, pageSize: 3, retryBaseDelayMs: 0, retryMaxDelayMs: 0 },
    );

    expect(flaky).toHaveBeenCalledTimes(3);
    expect(flaky.mock.calls[0]).toEqual([0, 3]);
    expect(flaky.mock.calls[1]).toEqual([0, 3]);
    expect(flaky.mock.calls[2]).toEqual([3, 3]);
    expect(result.rows.map((r) => r.id)).toEqual([A, B, C, D]);
    expect(onPage).toHaveBeenCalledTimes(2);
  });

  it("surfaces a retryable error after retries are exhausted, with a seed-free message", async () => {
    const leaky = new Error(`oops the sharing key is ${SEED}`);
    const failing = vi
      .fn<() => Promise<SharedObjectRow[]>>()
      .mockRejectedValue(leaky);
    let caught: unknown = null;
    try {
      await listSharedObjects(
        { fetchPage: failing },
        { retries: 1, retryBaseDelayMs: 0, retryMaxDelayMs: 0 },
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(SharedObjectsListingError);
    if (caught instanceof SharedObjectsListingError) {
      expect(caught.retryable).toBe(true);
      expect(caught.pageIndex).toBe(0);
      expect(caught.offset).toBe(0);
      expect(caught.attempt).toBe(2);
      expect(caught.cause).toBe(leaky);
      expect(caught.message).not.toContain(SEED);
      expect(caught.message).not.toContain("oops");
      expect(caught.message).not.toContain("error sending request");
    }
  });
});

describe("decodeObjectName", () => {
  const meta = (text: string): Uint8Array => new TextEncoder().encode(text);

  it("decodes a sialo-object-meta JSON envelope filename", () => {
    expect(
      decodeObjectName(
        A,
        meta(
          `{"type":"sialo-object-meta","version":1,"filename":"clip-a.mp4"}`,
        ),
      ),
    ).toBe("clip-a.mp4");
  });

  it("falls back to raw UTF-8 text when the bytes are not an envelope", () => {
    expect(decodeObjectName(A, meta("plain filename.txt"))).toBe(
      "plain filename.txt",
    );
  });

  it("falls back to the compact id label for binary/garbage bytes", () => {
    expect(decodeObjectName(A, new Uint8Array([0xff, 0xfe, 0x00, 0x01]))).toBe(
      `${"a".repeat(8)}…${"a".repeat(8)}`,
    );
  });

  it("sanitizes control characters and collapses whitespace", () => {
    expect(decodeObjectName(A, meta("bad\u0000name\r\n weird "))).toBe(
      "bad name weird",
    );
  });
});

describe("createSharedObjectsClient — lazy SDK boundary", () => {
  function pinnedObject(id: string, filename: string) {
    return {
      free: vi.fn(),
      id: () => id,
      metadata: () =>
        new TextEncoder().encode(
          `{"type":"sialo-object-meta","version":1,"filename":"${filename}"}`,
        ),
      size: () => id.length,
    };
  }

  function fakeSdk() {
    return {
      free: vi.fn(),
      objects: vi.fn(),
      stats: vi.fn(),
    };
  }

  it("maps PinnedObject pages into decoded rows and frees every WASM handle", async () => {
    const sdk = fakeSdk();
    const first = pinnedObject(A, "clip-a.mp4");
    const second = pinnedObject(B, "clip-b.mp4");
    sdk.objects.mockResolvedValue([first, second]);
    const connect = vi.fn(() => Promise.resolve(sdk as never));

    const handle = await createSharedObjectsClient(
      "https://indexer.example",
      SEED,
      connect,
    );
    const rows = await handle.client.fetchPage(0, 100);

    expect(rows.map((r) => r.id)).toEqual([A, B]);
    expect(rows.map((r) => r.name)).toEqual(["clip-a.mp4", "clip-b.mp4"]);
    expect(first.free).toHaveBeenCalledTimes(1);
    expect(second.free).toHaveBeenCalledTimes(1);
    handle.dispose();
    expect(sdk.free).toHaveBeenCalledTimes(1);
  });

  it("consumes the seed at the boundary but never echoes it into pages", async () => {
    const sdk = fakeSdk();
    sdk.objects.mockResolvedValue([pinnedObject(A, "clip-a.mp4")]);
    const connect = vi.fn(() => Promise.resolve(sdk as never));

    const handle = await createSharedObjectsClient(
      "https://indexer.example",
      SEED,
      connect,
    );
    const rows = await handle.client.fetchPage(0, 100);
    handle.dispose();

    expect(connect).toHaveBeenCalledWith("https://indexer.example", SEED);
    expect(JSON.stringify(rows)).not.toContain(SEED);
  });
});
