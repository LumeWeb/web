/** Durable intent and acknowledgement records identify the exact resources a run may clean up. */
import { constants } from "node:fs";
import { type FileHandle, open } from "node:fs/promises";
import { dirname } from "node:path";
import {
  privatePath,
  readPrivateBytes,
  readPrivateHandle,
} from "./private-files.js";
export interface Journal {
  append(
    event: JournalEvent,
    options?: { readonly cleanup: true },
  ): Promise<void>;
  close(): Promise<void>;
  readonly path: string;
  reserve(bytes: number): JournalReservation;
}
export type JournalEvent =
  | {
      readonly apiBaseUrl: string;
      readonly appId: string;
      readonly kind: "header";
      readonly runId: string;
      readonly version: 1;
    }
  | { readonly appKeyHex: string; readonly kind: "auth" }
  | {
      readonly cleanup: "clean" | "pending" | "uncertain";
      readonly kind: "complete";
    }
  | {
      readonly code: string;
      readonly id: string;
      readonly kind: "failure";
      readonly uncertain: boolean;
    }
  | {
      readonly id: string;
      readonly input: unknown;
      readonly kind: "intent";
      readonly operation: string;
    }
  | { readonly id: string; readonly kind: "ack"; readonly result: unknown };
export interface JournalReservation {
  append(event: JournalEvent): Promise<void>;
  release(): void;
}
export interface JournalSnapshot {
  readonly records: readonly (JournalEvent & { readonly sequence: number })[];
  readonly truncated: boolean;
}
const creationBytes = 16 * 1024 * 1024;
// Cleanup intents and acknowledgements must still fit when creation records reach their limit.
const maximumBytes = creationBytes + 1024 * 1024;
export async function createJournal(
  path: string,
  header: Extract<JournalEvent, { kind: "header" }>,
  workspaceRoot?: string,
): Promise<Journal> {
  let file: FileHandle | undefined;
  let directory: FileHandle | undefined;
  try {
    const actual = await privatePath(path, workspaceRoot);
    directory = await open(
      dirname(actual),
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
    );
    const parent = await directory.stat();
    if (
      !parent.isDirectory() ||
      parent.uid !== process.getuid!() ||
      (parent.mode & 0o077) !== 0
    )
      throw failure("journal-invalid");
    file = await open(
      actual,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_APPEND |
        constants.O_NOFOLLOW,
      0o600,
    );
    const journal = writer(file, actual, 0, 0);
    await journal.append(header);
    // The file's data can survive a crash while its new directory entry does not.
    await directory.sync();
    await directory.close();
    directory = undefined;
    file = undefined;
    return journal;
  } catch {
    await file?.close().catch(() => undefined);
    await directory?.close().catch(() => undefined);
    throw failure("journal-invalid");
  }
}
export async function readJournal(
  path: string,
  workspaceRoot?: string,
): Promise<JournalSnapshot> {
  try {
    return parse(await readPrivateBytes(path, maximumBytes, workspaceRoot));
  } catch {
    throw failure("journal-invalid");
  }
}
export async function resumeJournal(
  path: string,
): Promise<{ readonly journal: Journal; readonly snapshot: JournalSnapshot }> {
  let file: FileHandle | undefined;
  try {
    const actual = await privatePath(path);
    file = await open(
      actual,
      constants.O_RDWR |
        constants.O_APPEND |
        constants.O_NOFOLLOW |
        constants.O_NONBLOCK,
    );
    const bytes = await readPrivateHandle(file, maximumBytes);
    const snapshot = parse(bytes);
    const end = bytes.lastIndexOf(10) + 1;
    if (snapshot.truncated) {
      await file.truncate(end);
      await file.sync();
    }
    const journal = writer(file, actual, snapshot.records.length, end);
    file = undefined;
    return { journal, snapshot };
  } catch {
    await file?.close().catch(() => undefined);
    throw failure("journal-invalid");
  }
}
function asError(value: unknown): Error {
  return value instanceof Error ? value : failure("journal-error");
}
function failure(code: string) {
  return Object.assign(new Error("Sia private journal operation failed"), {
    code,
    phase: "journal",
  });
}
function parse(bytes: Buffer): JournalSnapshot {
  const end = bytes.lastIndexOf(10) + 1;
  const text = new TextDecoder("utf-8", { fatal: true }).decode(
    bytes.subarray(0, end),
  );
  const records = text
    .split("\n")
    .filter((_line, index, lines) => index !== lines.length - 1)
    .map((line, sequence) => {
      const value: unknown = JSON.parse(line);
      validate(value, sequence);
      return value;
    });
  if (!records.length) throw failure("journal-invalid");
  return Object.freeze({
    records: Object.freeze(records),
    truncated: end !== bytes.length,
  });
}
function validate(
  value: unknown,
  sequence: number,
): asserts value is JournalEvent & { readonly sequence: number } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw failure("journal-invalid");
  const record = value as Record<string, unknown>;
  if (record.sequence !== sequence || typeof record.kind !== "string")
    throw failure("journal-invalid");
  const id = (field: string) =>
    typeof record[field] === "string" &&
    /^[a-zA-Z0-9_-]{1,128}$/.test(record[field]);
  if (sequence === 0) {
    if (
      record.kind !== "header" ||
      record.version !== 1 ||
      !id("runId") ||
      typeof record.apiBaseUrl !== "string" ||
      typeof record.appId !== "string" ||
      !/^[a-f0-9]{64}$/.test(record.appId)
    )
      throw failure("journal-invalid");
    new URL(record.apiBaseUrl);
    return;
  }
  if (
    record.kind === "auth" &&
    typeof record.appKeyHex === "string" &&
    /^[a-f0-9]{64}$/.test(record.appKeyHex)
  )
    return;
  if (
    record.kind === "intent" &&
    id("id") &&
    id("operation") &&
    "input" in record
  )
    return;
  if (record.kind === "ack" && id("id") && "result" in record) return;
  if (
    record.kind === "failure" &&
    id("id") &&
    id("code") &&
    typeof record.uncertain === "boolean"
  )
    return;
  if (
    record.kind === "complete" &&
    ["clean", "pending", "uncertain"].includes(record.cleanup as string)
  )
    return;
  throw failure("journal-invalid");
}
function writer(
  file: FileHandle,
  path: string,
  firstSequence: number,
  firstBytes: number,
): Journal {
  let sequence = firstSequence;
  let bytes = firstBytes;
  let reservedBytes = 0;
  interface Allocation {
    released: boolean;
    remaining: number;
  }
  let tail = Promise.resolve();
  let closing: Promise<void> | undefined;
  /** Writes charge byte capacity before I/O so concurrent mutations cannot spend an acknowledgement's reservation. */
  function append(
    event: JournalEvent,
    options?: { readonly cleanup: true },
    allocation?: Allocation,
  ): Promise<void> {
    if (closing || allocation?.released)
      return Promise.reject(failure("journal-closed"));
    let line: string;
    try {
      line = JSON.stringify({ ...event, sequence });
      validate(JSON.parse(line) as unknown, sequence);
    } catch {
      return Promise.reject(failure("journal-invalid"));
    }
    line += "\n";
    const size = Buffer.byteLength(line);
    if (allocation && size > allocation.remaining)
      return Promise.reject(failure("journal-limit"));
    const limit =
      allocation || options?.cleanup || event.kind === "complete"
        ? maximumBytes
        : creationBytes;
    if (bytes + reservedBytes + (allocation ? 0 : size) > limit)
      return Promise.reject(failure("journal-limit"));
    if (allocation) {
      allocation.remaining -= size;
      reservedBytes -= size;
    }
    sequence++;
    bytes += size;
    tail = tail.then(async () => {
      await file.appendFile(line, "utf8");
      await file.sync();
    });
    return tail;
  }
  return Object.freeze(
    Object.defineProperties(
      {
        append,
        close(): Promise<void> {
          closing ??= (async () => {
            const errors: Error[] = [];
            try {
              await tail;
            } catch (error) {
              errors.push(asError(error));
            }
            try {
              await file.close();
            } catch (error) {
              errors.push(asError(error));
            }
            if (errors.length === 1 && errors[0]) throw errors[0];
            if (errors.length)
              throw new AggregateError(
                errors,
                "Journal write and close failed",
              );
          })();
          return closing;
        },
        path,
        reserve(amount: number): JournalReservation {
          if (closing) throw failure("journal-closed");
          if (!Number.isSafeInteger(amount) || amount <= 0)
            throw failure("journal-invalid");
          if (bytes + reservedBytes + amount > creationBytes)
            throw failure("journal-limit");
          reservedBytes += amount;
          const allocation: Allocation = { released: false, remaining: amount };
          return Object.freeze({
            append: (event: JournalEvent) =>
              append(event, undefined, allocation),
            release() {
              if (allocation.released) return;
              allocation.released = true;
              reservedBytes -= allocation.remaining;
            },
          });
        },
      },
      {
        [Symbol.for("nodejs.util.inspect.custom")]: {
          value: () => "[Sia private journal]",
        },
        toJSON: { value: () => "[Sia private journal]" },
      },
    ),
  );
}
