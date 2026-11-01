/// <reference lib="es2021.promise" />
/// <reference lib="es2022.error" />
/** Captures a log-file byte interval even when the application operation rejects. */
import { type FileHandle, open, stat } from "node:fs/promises";

type Observation<T> = Settlement<T> & { payloadRPCs: string[] };

type Settlement<T> =
  { error: unknown; status: "rejected" } | { result: T; status: "fulfilled" };
const MAX_INTERVAL_BYTES = 8 * 1024 * 1024;
const ANCHOR_BYTES = 4096;

/** Inspects the host interval before rethrowing an application rejection. */
export async function observeHostPayload<T>(
  logPath: string | undefined,
  operation: () => Promise<T>,
) {
  const observed = await observeHostPayloadSettled(logPath, operation);
  if (observed.status === "rejected") throw observed.error;
  return { payloadRPCs: observed.payloadRPCs, result: observed.result };
}

/** Returns rejected-operation evidence; observation failures retain both errors when needed. */
export async function observeHostPayloadSettled<T>(
  logPath: string | undefined,
  operation: () => Promise<T>,
) {
  if (!logPath)
    throw new Error(
      "SIA_TEST_CLUSTER_LOG is required to observe host payload RPCs",
    );
  const log = await open(logPath, "r");
  let settlement: Settlement<T> | undefined;
  let failure: undefined | { error: unknown };
  let observed: Observation<T> | undefined;
  try {
    const initial = await log.stat();
    if (!initial.isFile())
      throw new Error("Host payload log must be a regular file");
    const start = initial.size;
    const anchorStart = Math.max(0, start - ANCHOR_BYTES);
    // A bounded tail check detects truncation followed by regrowth with different bytes.
    const anchor = await readInterval(log, anchorStart, start - anchorStart);
    try {
      settlement = { result: await operation(), status: "fulfilled" };
    } catch (error) {
      settlement = { error, status: "rejected" };
    }
    try {
      const end = (await log.stat()).size;
      const current = await stat(logPath);
      if (current.dev !== initial.dev || current.ino !== initial.ino) {
        throw new Error("Host payload log was replaced during the operation");
      }
      if (end < start || current.size < end)
        throw new Error("Host payload log was truncated during the operation");
      if (end - start > MAX_INTERVAL_BYTES)
        throw new Error("Host payload log interval exceeds the 8 MiB limit");
      const buffer = await readInterval(log, start, end - start);
      if (!anchor.equals(await readInterval(log, anchorStart, anchor.length))) {
        throw new Error(
          "Host payload log historical bytes changed during the operation",
        );
      }
      const final = await stat(logPath);
      if (
        final.dev !== initial.dev ||
        final.ino !== initial.ino ||
        final.size < end ||
        (await log.stat()).size < end
      ) {
        throw new Error("Host payload log changed while reading the interval");
      }
      observed = {
        ...settlement,
        payloadRPCs:
          buffer.toString().match(/"rpc":\s*"(?:ReadSector|WriteSector)"/g) ??
          [],
      };
    } catch (error) {
      if (settlement.status === "rejected") {
        throw combinedFailure(
          settlement.error,
          error,
          "Operation rejected and host payload observation failed",
        );
      }
      throw error;
    }
  } catch (error) {
    failure = { error };
  }
  try {
    await log.close();
  } catch (error) {
    if (failure)
      throw combinedFailure(
        failure.error,
        error,
        "Host payload observation and log close failed",
      );
    if (settlement?.status === "rejected") {
      throw combinedFailure(
        settlement.error,
        error,
        "Operation rejected and host payload log close failed",
      );
    }
    throw error;
  }
  if (failure) throw failure.error;
  return observed!;
}

function combinedFailure(primary: unknown, cause: unknown, message: string) {
  return new AggregateError([primary, cause], message, { cause });
}

/** Rejects short reads instead of treating missing log bytes as absent RPCs. */
async function readInterval(log: FileHandle, start: number, length: number) {
  const buffer = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const { bytesRead } = await log.read(
      buffer,
      offset,
      Math.min(length - offset, 64 * 1024),
      start + offset,
    );
    if (!bytesRead)
      throw new Error(
        "Host payload log was truncated while reading the interval",
      );
    offset += bytesRead;
  }
  return buffer;
}
