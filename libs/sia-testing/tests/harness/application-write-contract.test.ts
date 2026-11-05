/** Controlled fixtures test assertion failures, not native writes or remote provenance. */
/* oxlint-disable typescript/prefer-promise-reject-errors -- Primitive failures must reach the assertions unchanged. */
import { expect, it } from "vitest";
import {
  singleWriteCase,
  type WriteFixture,
} from "./application-write-contract.js";

const bytes = () => Uint8Array.of(0x53, 0x69, 0x61, 0, 0xff);
const metadata = () => Uint8Array.of(0x77, 0x72, 0x69, 0x74, 0x65);
async function consume(source: ReadableStream<Uint8Array>) {
  const reader = source.getReader();
  try {
    while (!(await reader.read()).done) {
      /* Read to EOF. */
    }
  } finally {
    reader.releaseLock();
  }
}
function control(overrides: Partial<WriteFixture> = {}): WriteFixture {
  return {
    close: () => Promise.resolve([]),
    readAcknowledged: () =>
      Promise.resolve([{ metadata: metadata(), stream: stream(bytes()) }]),
    settleOwnedWork: () => Promise.resolve(),
    write: consume,
    ...overrides,
  };
}
function stream(value: Uint8Array) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(value);
      controller.close();
    },
  });
}
it("a configured successful response cannot replace source consumption", async () => {
  const result = await singleWriteCase({
    expected: bytes(),
    fixture: control({ write: () => Promise.resolve() }),
    metadata: metadata(),
  });
  expect(result.map((item) => item.phase)).toContain("source");
});
it.each(["bytes", "metadata", "empty", "extra"] as const)(
  "readback rejects %s that differs from the single-input contract",
  async (kind) => {
    const row = { metadata: metadata(), stream: stream(bytes()) };
    if (kind === "bytes") row.stream = stream(Uint8Array.of(9));
    if (kind === "metadata") row.metadata = Uint8Array.of(9);
    const result = await singleWriteCase({
      expected: bytes(),
      fixture: control({
        readAcknowledged: () =>
          Promise.resolve(
            kind === "empty" ? [] : kind === "extra" ? [row, row] : [row],
          ),
      }),
      metadata: metadata(),
    });
    expect(result.map((item) => item.phase)).toContain("readback");
  },
);
it.each(["bytes", "metadata"] as const)(
  "adapter mutation cannot change the literal %s oracle",
  async (kind) => {
    const expected = bytes();
    const wantedMetadata = metadata();
    const result = await singleWriteCase({
      expected,
      fixture: control({
        readAcknowledged: () =>
          Promise.resolve([
            {
              metadata:
                kind === "metadata" ? Uint8Array.of(9, 9, 9, 9, 9) : metadata(),
              stream: stream(
                kind === "bytes" ? Uint8Array.of(9, 9, 9, 9, 9) : bytes(),
              ),
            },
          ]),
        async write(source, suppliedMetadata) {
          await consume(source);
          if (kind === "bytes") expected.fill(9);
          else {
            wantedMetadata.fill(9);
            suppliedMetadata.fill(9);
          }
        },
      }),
      metadata: wantedMetadata,
    });
    expect(result.map((item) => item.phase)).toContain("readback");
  },
);
it.each([
  "caller bytes",
  "caller metadata",
  "supplied metadata",
  "source chunk",
] as const)(
  "Buffer-backed %s mutation cannot change the independent oracle",
  async (kind) => {
    const expected = Buffer.from([0x53, 0x69, 0x61, 0, 0xff]);
    const wantedMetadata = Buffer.from([0x77, 0x72, 0x69, 0x74, 0x65]);
    const corruptBytes = kind === "caller bytes" || kind === "source chunk";
    const result = await singleWriteCase({
      expected,
      fixture: control({
        readAcknowledged: () =>
          Promise.resolve([
            {
              metadata: corruptBytes
                ? metadata()
                : Uint8Array.of(9, 9, 9, 9, 9),
              stream: stream(
                corruptBytes ? Uint8Array.of(9, 9, 9, 9, 9) : bytes(),
              ),
            },
          ]),
        async write(source, suppliedMetadata) {
          const reader = source.getReader();
          try {
            for (;;) {
              const next = await reader.read();
              if (next.done) break;
              if (kind === "source chunk") next.value.fill(9);
            }
          } finally {
            reader.releaseLock();
          }
          if (kind === "caller bytes") expected.fill(9);
          if (kind === "caller metadata") wantedMetadata.fill(9);
          if (kind === "supplied metadata") suppliedMetadata.fill(9);
        },
      }),
      metadata: wantedMetadata,
    });
    expect(result.map((item) => item.phase)).toEqual(["readback"]);
  },
);
it("Buffer input produces independent plain source chunks with bounded backing storage", async () => {
  const expected = Buffer.alloc(65537, 1);
  const chunks: Uint8Array[] = [];
  let downloaded = 0;
  const download = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (downloaded === 65537) controller.close();
        else {
          const length = Math.min(65536, 65537 - downloaded);
          controller.enqueue(new Uint8Array(length).fill(1));
          downloaded += length;
        }
      },
    },
    { highWaterMark: 0 },
  );
  const result = await singleWriteCase({
    expected,
    fixture: control({
      readAcknowledged: () =>
        Promise.resolve([{ metadata: metadata(), stream: download }]),
      async write(source) {
        const reader = source.getReader();
        try {
          for (;;) {
            const next = await reader.read();
            if (next.done) break;
            chunks.push(next.value);
          }
        } finally {
          reader.releaseLock();
        }
      },
    }),
    metadata: Buffer.from([0x77, 0x72, 0x69, 0x74, 0x65]),
  });
  expect(result).toEqual([]);
  expect(chunks.map((chunk) => chunk.byteLength)).toEqual([65536, 1]);
  for (const chunk of chunks) {
    expect(chunk.byteLength).toBeLessThanOrEqual(65536);
    expect(chunk.buffer.byteLength).toBeLessThanOrEqual(65536);
    expect(Object.getPrototypeOf(chunk) === Uint8Array.prototype).toBe(true);
    expect(chunk.buffer === expected.buffer).toBe(false);
  }
  expect(chunks[0]!.buffer === chunks[1]!.buffer).toBe(false);
});
it("overflow cancels and joins the download without reading to unbounded EOF", async () => {
  let reads = 0;
  let cancelled = false;
  const download = new ReadableStream<Uint8Array>(
    {
      cancel() {
        cancelled = true;
      },
      pull(controller) {
        reads++;
        controller.enqueue(Uint8Array.of(1));
      },
    },
    { highWaterMark: 0 },
  );
  const result = await singleWriteCase({
    expected: Uint8Array.of(1),
    fixture: control({
      readAcknowledged: () =>
        Promise.resolve([{ metadata: metadata(), stream: download }]),
    }),
    metadata: metadata(),
  });
  expect(result.map((item) => item.phase)).toContain("readback");
  expect(reads).toBe(2);
  expect(cancelled).toBe(true);
  expect(download.locked).toBe(false);
});
it.each([undefined, NaN])(
  "operation and observed cleanup failures preserve primitive identity: %s",
  async (operation) => {
    const cleanup = operation === undefined ? NaN : undefined;
    let settled = false;
    const result = await singleWriteCase({
      expected: bytes(),
      fixture: control({
        close() {
          expect(settled).toBe(true);
          return Promise.resolve([cleanup]);
        },
        settleOwnedWork() {
          settled = true;
          return Promise.resolve();
        },
        write: () => Promise.reject(operation),
      }),
      metadata: metadata(),
    });
    expect(
      result.some(
        (item) =>
          item.phase === "operation" && Object.is(item.error, operation),
      ),
    ).toBe(true);
    expect(
      result.some(
        (item) => item.phase === "cleanup" && Object.is(item.error, cleanup),
      ),
    ).toBe(true);
  },
);

it("reading the payload without EOF is not a completed source", async () => {
  const result = await singleWriteCase({
    expected: bytes(),
    fixture: control({
      async write(source) {
        const reader = source.getReader();
        try {
          await reader.read();
        } finally {
          reader.releaseLock();
        }
      },
    }),
    metadata: metadata(),
  });
  expect(result.some((item) => item.phase === "source")).toBe(true);
});
it.each([undefined, NaN])(
  "download producer errors are not repeated as cleanup errors: %s",
  async (producer) => {
    const download = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(producer);
      },
    });
    const result = await singleWriteCase({
      expected: bytes(),
      fixture: control({
        readAcknowledged: () =>
          Promise.resolve([{ metadata: metadata(), stream: download }]),
      }),
      metadata: metadata(),
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.phase).toBe("readback");
    expect(Object.is(result[0]!.error, producer)).toBe(true);
    expect(download.locked).toBe(false);
  },
);
it.each([undefined, NaN])(
  "a download mismatch retains its independent cancel failure: %s",
  async (cleanup) => {
    const download = new ReadableStream<Uint8Array>(
      {
        cancel() {
          return Promise.reject(cleanup);
        },
        pull(controller) {
          controller.enqueue(Uint8Array.of(9));
        },
      },
      { highWaterMark: 0 },
    );
    const result = await singleWriteCase({
      expected: bytes(),
      fixture: control({
        readAcknowledged: () =>
          Promise.resolve([{ metadata: metadata(), stream: download }]),
      }),
      metadata: metadata(),
    });
    expect(result.some((item) => item.phase === "readback")).toBe(true);
    expect(
      result.some(
        (item) => item.phase === "cleanup" && Object.is(item.error, cleanup),
      ),
    ).toBe(true);
    expect(download.locked).toBe(false);
  },
);
it("download cancellation work settles before fixture close and source locks are released", async () => {
  const cancelling = Promise.withResolvers<void>();
  const cancelled = Promise.withResolvers<void>();
  let closed = false;
  let source: ReadableStream<Uint8Array> | undefined;
  const download = new ReadableStream<Uint8Array>(
    {
      cancel() {
        cancelling.resolve();
        return cancelled.promise;
      },
      pull(controller) {
        controller.enqueue(Uint8Array.of(9));
      },
    },
    { highWaterMark: 0 },
  );
  const checking = singleWriteCase({
    expected: bytes(),
    fixture: control({
      close() {
        closed = true;
        return Promise.resolve([]);
      },
      readAcknowledged: () =>
        Promise.resolve([{ metadata: metadata(), stream: download }]),
      async write(input) {
        source = input;
        await consume(input);
      },
    }),
    metadata: metadata(),
  });
  try {
    await cancelling.promise;
    expect(closed).toBe(false);
    expect(download.locked).toBe(true);
    expect(source!.locked).toBe(false);
    cancelled.resolve();
    const result = await checking;
    expect(result.some((item) => item.phase === "readback")).toBe(true);
    expect(download.locked).toBe(false);
    expect(closed).toBe(true);
  } finally {
    cancelled.resolve();
    await checking;
  }
});
