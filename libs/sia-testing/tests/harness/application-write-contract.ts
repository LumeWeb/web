/** Private single-input assertions do not attest adapter provenance or native work completion. */
export interface WriteFailure {
  error: unknown;
  phase: "cleanup" | "operation" | "readback" | "settle" | "source";
}
export interface WriteFixture {
  close(): Promise<readonly unknown[]>;
  readAcknowledged(): Promise<
    readonly {
      metadata: Uint8Array;
      stream: ReadableStream<Uint8Array>;
    }[]
  >;
  settleOwnedWork(): Promise<void>;
  write(
    source: ReadableStream<Uint8Array>,
    metadata: Uint8Array,
  ): Promise<void>;
}
export async function singleWriteCase(input: {
  expected: Uint8Array;
  fixture: WriteFixture;
  metadata: Uint8Array;
}): Promise<readonly WriteFailure[]> {
  // Buffer.slice shares storage, so normalize before deriving adapter bytes or source chunks.
  const expected = new Uint8Array(input.expected);
  const metadata = new Uint8Array(input.metadata);
  if (
    !expected.length ||
    expected.length > 1024 * 1024 ||
    metadata.length > 1024
  )
    throw new Error("Outside the ordinary single-input test profile");
  const failures: WriteFailure[] = [];
  let sent = 0;
  let eof = false;
  let chunks = 0;
  const source = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (sent === expected.length) {
          eof = true;
          controller.close();
        } else {
          if (++chunks > 32) throw new Error("Source chunk budget exceeded");
          const end = Math.min(sent + 65536, expected.length);
          controller.enqueue(expected.slice(sent, end));
          sent = end;
        }
      },
    },
    { highWaterMark: 0 },
  );
  let wrote = false;
  try {
    await input.fixture.write(source, metadata.slice());
    wrote = true;
  } catch (error) {
    failures.push({ error, phase: "operation" });
  }
  try {
    await input.fixture.settleOwnedWork();
  } catch (error) {
    failures.push({ error, phase: "settle" });
  }
  if (source.locked) {
    failures.push({
      error: new Error("Writer retained the source lock"),
      phase: "source",
    });
  } else if (!eof) {
    try {
      await source.cancel();
    } catch (error) {
      failures.push({ error, phase: "cleanup" });
    }
  }
  if (wrote && (!eof || sent !== expected.length)) {
    failures.push({
      error: new Error("Writer did not consume the nonempty source to EOF"),
      phase: "source",
    });
  }
  if (wrote) {
    let rows: Awaited<ReturnType<WriteFixture["readAcknowledged"]>> = [];
    let compared: ReadableStream<Uint8Array> | undefined;
    try {
      rows = await input.fixture.readAcknowledged();
      if (rows.length !== 1)
        throw new Error("Single input requires one destination");
      equalBytes(rows[0]!.metadata, metadata);
      compared = rows[0]!.stream;
      await compareDownload(compared, expected, failures);
    } catch (error) {
      failures.push({ error, phase: "readback" });
    } finally {
      // Extra acknowledged destinations stay owned by the fixture; only their readers are cancelled here.
      for (const row of rows) {
        if (row.stream !== compared && !row.stream.locked) {
          try {
            await row.stream.cancel();
          } catch (error) {
            failures.push({ error, phase: "cleanup" });
          }
        }
      }
    }
  }
  try {
    for (const error of await input.fixture.close())
      failures.push({ error, phase: "cleanup" });
  } catch (error) {
    failures.push({ error, phase: "cleanup" });
  }
  return failures;
}
async function compareDownload(
  stream: ReadableStream<Uint8Array>,
  expected: Uint8Array,
  failures: WriteFailure[],
) {
  const reader = stream.getReader();
  let complete = false;
  let readFailed = false;
  let offset = 0;
  let chunks = 0;
  try {
    for (;;) {
      const next = await reader.read().catch((error: unknown) => {
        readFailed = true;
        throw error;
      });
      if (next.done) {
        if (offset !== expected.length) throw new Error("Short download");
        complete = true;
        return;
      }
      if (
        ++chunks > 32 ||
        next.value.byteLength > 65536 ||
        next.value.buffer.byteLength > 65536
      )
        throw new Error("Download chunk budget exceeded");
      // Inspect at most the expected bytes plus one overflow byte, without collecting the download.
      const length = Math.min(next.value.length, expected.length + 1 - offset);
      for (let index = 0; index < length; index++) {
        if (offset === expected.length)
          throw new Error("Download exceeds the literal expectation");
        if (next.value[index] !== expected[offset++])
          throw new Error("Download bytes differ");
      }
    }
  } finally {
    if (!complete && !readFailed) {
      try {
        await reader.cancel();
      } catch (error) {
        failures.push({ error, phase: "cleanup" });
      }
    }
    reader.releaseLock();
  }
}
function equalBytes(actual: Uint8Array, expected: Uint8Array) {
  if (
    actual.length !== expected.length ||
    actual.some((byte, index) => byte !== expected[index])
  )
    throw new Error("Bytes differ from the literal expectation");
}
