/** A run owns every recorded file, descriptor and settled cleanup failure until explicit close. */
import { createPayloadSourceValidator } from "./byte-view.js";
import { constants } from "node:fs";
import * as fs from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type {
  FinishedPayload,
  PayloadLimits,
  PayloadOwner,
  PayloadReader,
  PayloadSpool,
  UploadReservation,
} from "../sdk/payload-store.js";

interface Entry {
  abort: AbortController;
  adopted: boolean;
  capacity: number;
  handle?: FileHandle;
  length: number;
  onRemoved(): void;
  path: string;
  pending: Promise<unknown>;
  readers: Set<PayloadReader>;
  removed: boolean;
  retirement?: Promise<void>;
  retiring: boolean;
  token?: FinishedPayload;
  writerClose?: Promise<void>;
}

/** Dependencies remain private and exist to exercise actual filesystem failure boundaries. */
export async function createNodePayloadOwner(
  limits: PayloadLimits,
  io: Pick<typeof fs, "chmod" | "open" | "rmdir" | "unlink"> = fs,
) {
  limits = validatePayloadLimits(limits);
  const root = await fs.mkdtemp(join(tmpdir(), "sia-testing-payload-"));
  try {
    await io.chmod(root, 0o700);
  } catch (error) {
    try {
      await io.rmdir(root);
    } catch (cleanup) {
      // oxlint-disable-next-line preserve-caught-error -- Both setup and root-removal failures remain in errors.
      throw new AggregateError(
        [error, cleanup],
        `Payload root setup and removal failed: ${root}`,
        { cause: cleanup },
      );
    }
    throw error;
  }
  const entries = new Set<Entry>();
  const tokens = new WeakMap<FinishedPayload, Entry>();
  const jobs = new Set<Promise<void>>();
  const reservations = new Set<UploadReservation>();
  const failures: unknown[] = [];
  let retainedBytes = 0;
  let attempts = 0;
  let writers = 0;
  let readers = 0;
  let stopped = false;
  let closed = false;
  let closing: Promise<void> | undefined;

  function healthy() {
    if (closed || stopped)
      throw new Error("Payload owner closed or descriptor closure uncertain");
  }
  function owned(token: FinishedPayload) {
    const entry = tokens.get(token);
    if (!entry || entry.removed || entry.retiring)
      throw new Error("Unknown or retired payload token");
    return entry;
  }
  function remember(job: Promise<void>) {
    jobs.add(job);
    void job.catch(() => undefined);
    return job;
  }
  function closeWriter(entry: Entry): Promise<void> {
    if (entry.writerClose) return entry.writerClose;
    entry.writerClose = (async () => {
      if (!entry.handle) return;
      try {
        await entry.handle.close();
        delete entry.handle;
        writers--;
      } catch (error) {
        stopped = true;
        failures.push(error);
        throw error;
      }
    })();
    void entry.writerClose.catch(() => undefined);
    return entry.writerClose;
  }
  function retireEntry(entry: Entry): Promise<void> {
    if (entry.retirement) return entry.retirement;
    entry.retiring = true;
    entry.abort.abort(new Error("Payload retired"));
    entry.retirement = remember(
      (async () => {
        const results = await Promise.allSettled([
          entry.pending,
          ...Array.from(entry.readers, (reader) => reader.close()),
        ]);
        if (entry.removed) return;
        const errors = results
          .filter((result) => result.status === "rejected")
          .map((result): unknown => result.reason);
        try {
          await closeWriter(entry);
        } catch (error) {
          errors.push(error);
        }
        if (errors.length)
          throw new AggregateError(
            errors,
            `Payload closure uncertain: ${entry.path}`,
          );
        try {
          await io.unlink(entry.path);
        } catch (error) {
          failures.push(error);
          throw error;
        }
        entry.removed = true;
        entries.delete(entry);
        entry.onRemoved();
      })(),
    );
    return entry.retirement;
  }

  const owner = {
    close(): Promise<void> {
      if (closing) return closing;
      closed = true;
      closing = (async () => {
        await Promise.allSettled(Array.from(entries, retireEntry));
        for (const reservation of reservations) {
          try {
            reservation.release();
          } catch (error) {
            failures.push(error);
          }
        }
        const results = await Promise.allSettled(jobs);
        const errors = results
          .filter((result) => result.status === "rejected")
          .map((result): unknown => result.reason);
        if (
          entries.size ||
          readers ||
          writers ||
          errors.length ||
          failures.length
        )
          throw new AggregateError(
            [...failures, ...errors],
            `Payload residue or uncertain descriptors at ${root}; entries=${entries.size}, writers=${writers}, readers=${readers}, retainedBytes=${retainedBytes}`,
          );
        await io.rmdir(root);
      })();
      void closing.catch(() => undefined);
      return closing;
    },
    discardUncommitted(token: FinishedPayload) {
      const entry = tokens.get(token);
      if (!entry) return Promise.reject(new Error("Unknown payload token"));
      return entry.adopted ? Promise.resolve() : retireEntry(entry);
    },
    async drain() {
      const results = await Promise.allSettled(jobs);
      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result): unknown => result.reason);
      if (errors.length)
        throw new AggregateError(errors, "Payload retirement failed");
    },
    kind: "temporary-files" as const,
    async openReader(
      token: FinishedPayload,
      offset: number,
      length: number,
    ): Promise<PayloadReader> {
      healthy();
      integer(offset, Number.MAX_SAFE_INTEGER, "offset");
      integer(length, Number.MAX_SAFE_INTEGER, "length");
      const entry = owned(token);
      if (readers >= 2) throw new Error("Payload reader capacity exhausted");
      readers++;
      let handle: FileHandle | undefined;
      const opening = io
        .open(entry.path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0))
        .then(
          (value) => {
            handle = value;
          },
          (error) => {
            readers--;
            entry.readers.delete(reader);
            throw error;
          },
        );
      void opening.catch(() => undefined);
      let position = Math.min(offset, token.length);
      const end = position + Math.min(length, token.length - position);
      let closingReader: Promise<void> | undefined;
      let pending: Promise<unknown> = Promise.resolve();
      let reading = false;
      const reader: PayloadReader = {
        close() {
          if (!closingReader) {
            closingReader = (async () => {
              await opening.catch(() => undefined);
              await pending;
              if (!handle) return;
              try {
                await handle.close();
              } catch (error) {
                stopped = true;
                failures.push(error);
                throw error;
              }
              readers--;
              entry.readers.delete(reader);
            })();
            void closingReader.catch(() => undefined);
          }
          return closingReader;
        },
        read(maxBytes = 65536) {
          integer(maxBytes, 65536, "read block");
          if (!maxBytes) return Promise.reject(new Error("Empty read block"));
          if (closingReader || entry.retiring || reading)
            return Promise.reject(new Error("Payload reader unavailable"));
          reading = true;
          const operation = (async () => {
            if (position === end) return null;
            const block = new Uint8Array(Math.min(maxBytes, end - position));
            const { bytesRead } = await handle!.read(
              block,
              0,
              block.length,
              position,
            );
            if (!bytesRead) throw new Error("Unexpected payload EOF");
            position += bytesRead;
            return block.subarray(0, bytesRead);
          })();
          pending = operation.then(
            () => undefined,
            () => undefined,
          );
          void operation.catch(() => undefined);
          return operation.finally(() => {
            reading = false;
          });
        },
        signal: entry.abort.signal,
      };
      entry.readers.add(reader);
      await opening;
      // Retirement may have started while the descriptor was opening.
      if (entry.retiring || closed) {
        await reader.close();
        throw new Error("Payload retired during open");
      }
      return reader;
    },
    prepareAdoption(token: FinishedPayload) {
      healthy();
      const entry = owned(token);
      if (entry.adopted) throw new Error("Payload already adopted");
      return () => {
        entry.adopted = true;
      };
    },
    reserveUpload(capacity: number): UploadReservation {
      healthy();
      integer(capacity, limits.maxRetainedBytes, "upload reservation");
      if (
        reservations.size ||
        retainedBytes + capacity > limits.maxRetainedBytes
      )
        throw new Error("Payload upload capacity exhausted");
      retainedBytes += capacity;
      let unused = capacity;
      let released = false;
      let active = false;
      const sources = new Set<Entry>();
      const reservation: UploadReservation = {
        async admitSource(maxBytes) {
          healthy();
          integer(maxBytes, limits.maxObjectBytes, "source capacity");
          if (
            released ||
            active ||
            writers ||
            maxBytes > unused ||
            attempts >= limits.maxUploadAttempts ||
            entries.size >= limits.maxUploadAttempts
          )
            throw new Error("Payload source admission exhausted");
          attempts++;
          unused -= maxBytes;
          active = true;
          writers++;
          const entry: Entry = {
            abort: new AbortController(),
            adopted: false,
            capacity: maxBytes,
            length: 0,
            onRemoved() {
              if (!released && !entry.adopted) unused += entry.capacity;
              else retainedBytes -= entry.capacity;
            },
            path: join(root, randomUUID()),
            pending: Promise.resolve(),
            readers: new Set(),
            removed: false,
            retiring: false,
          };
          entries.add(entry);
          sources.add(entry);
          try {
            const opening = io
              .open(
                entry.path,
                constants.O_CREAT |
                  constants.O_EXCL |
                  constants.O_WRONLY |
                  (constants.O_NOFOLLOW ?? 0),
                0o600,
              )
              .then((handle) => {
                entry.handle = handle;
              });
            entry.pending = opening.then(
              () => undefined,
              () => undefined,
            );
            await opening;
          } catch (error) {
            // Exclusive open rejection confirms no descriptor was acquired by this owner.
            entry.removed = true;
            entries.delete(entry);
            entry.onRemoved();
            writers--;
            active = false;
            throw error;
          }
          const hash = createHash("sha256");
          let finishing = false;
          const validateSource = createPayloadSourceValidator();
          let busy = false;
          let writeFailed = false;
          let writeError: unknown;
          const spool: PayloadSpool = {
            append(input) {
              try {
                healthy();
                if (writeFailed) throw writeError;
                if (finishing || busy || entry.retiring)
                  throw new Error("Payload writer unavailable");
                const view = validateSource(
                  input,
                  entry.capacity - entry.length,
                );
                const block = new Uint8Array(view);
                busy = true;
                const operation = (async () => {
                  let position = 0;
                  while (position < block.length) {
                    const result = await entry.handle!.write(
                      block,
                      position,
                      block.length - position,
                      entry.length + position,
                    );
                    if (result.bytesWritten <= 0)
                      throw new Error("Payload write made no progress");
                    position += result.bytesWritten;
                  }
                  hash.update(block);
                  entry.length += block.length;
                })();
                entry.pending = operation.then(
                  () => undefined,
                  (error) => {
                    writeFailed = true;
                    writeError = error;
                  },
                );
                void operation.catch(() => undefined);
                return operation.finally(() => {
                  busy = false;
                });
              } catch (error) {
                // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Preserve producer and filesystem rejection values.
                return Promise.reject(error);
              }
            },
            async discard() {
              try {
                await retireEntry(entry);
              } finally {
                if (!entry.handle) active = false;
              }
            },
            async finish() {
              if (finishing || entry.retiring)
                throw new Error("Payload writer unavailable");
              finishing = true;
              await entry.pending;
              if (writeFailed) throw writeError;
              await closeWriter(entry);
              active = false;
              unused += entry.capacity - entry.length;
              entry.capacity = entry.length;
              const token = Object.freeze({
                length: entry.length,
                sha256: hash.digest("hex"),
              });
              entry.token = token;
              tokens.set(token, entry);
              return token;
            },
          };
          return spool;
        },
        release() {
          if (released) return;
          if (
            (active && Array.from(sources).some((entry) => !entry.removed)) ||
            writers
          )
            throw new Error("Payload writer still owned");
          released = true;
          retainedBytes -= unused;
          unused = 0;
          reservations.delete(reservation);
        },
      };
      reservations.add(reservation);
      return reservation;
    },
    resources: () => ({
      attempts,
      entries: entries.size,
      readers,
      retainedBytes,
      stopped,
      writers,
    }),
    retire(token: FinishedPayload) {
      const entry = tokens.get(token);
      if (!entry) return Promise.reject(new Error("Unknown payload token"));
      return retireEntry(entry);
    },
    root,
  } satisfies PayloadOwner & Record<string, unknown>;
  return owner;
}

export function validatePayloadLimits(limits: PayloadLimits): PayloadLimits {
  limits = Object.freeze({ ...limits });
  integer(limits.maxObjectBytes, 64 * 1024 * 1024, "object budget");
  integer(limits.maxLogicalUploadBytes, 128 * 1024 * 1024, "logical budget");
  integer(limits.maxRetainedBytes, 128 * 1024 * 1024, "retained budget");
  integer(limits.maxUploadAttempts, 16, "source attempts");
  if (
    limits.maxUploadAttempts < 1 ||
    limits.maxObjectBytes > limits.maxLogicalUploadBytes ||
    limits.maxObjectBytes > limits.maxRetainedBytes
  )
    throw new Error("Inconsistent payload budgets");
  return limits;
}

function integer(value: number, ceiling: number, name: string) {
  if (!Number.isSafeInteger(value) || value < 0 || value > ceiling)
    throw new Error(`Invalid ${name}`);
}
