/** Private payload authority keeps filesystem capabilities out of object descriptors. */
import { sha256 } from "@noble/hashes/sha2.js";

export interface FinishedPayload {
  readonly length: number;
  readonly sha256: string;
}

export interface PayloadLimits {
  maxLogicalUploadBytes: number;
  maxObjectBytes: number;
  maxRetainedBytes: number;
  maxUploadAttempts: number;
}

export interface PayloadOwner {
  drain(): Promise<void>;
  readonly kind: "buffered" | "temporary-files";
  openReader(
    token: FinishedPayload,
    offset: number,
    length: number,
  ): Promise<PayloadReader>;
  prepareAdoption(token: FinishedPayload): () => void;
  retire(token: FinishedPayload): Promise<void>;
}

export interface PayloadReader {
  close(): Promise<void>;
  read(maxBytes?: number): Promise<null | Uint8Array>;
  readonly signal?: AbortSignal;
}

export interface PayloadSpool {
  append(bytes: Uint8Array): Promise<void>;
  discard(): Promise<void>;
  finish(): Promise<FinishedPayload>;
}

export interface RunPayloadOwner extends PayloadOwner {
  close(): Promise<void>;
  discardUncommitted(token: FinishedPayload): Promise<void>;
  readonly kind: "temporary-files";
  reserveUpload(capacity: number): UploadReservation;
}
export interface UploadReservation {
  admitSource(maxBytes: number): Promise<PayloadSpool>;
  release(): void;
}
/** Buffered snapshots retain their V1 encoding; only this owner can reveal buffered bytes. */
export function createBufferedPayloadOwner() {
  const adopted = new WeakSet<FinishedPayload>();
  const values = new WeakMap<FinishedPayload, Uint8Array>();
  function bytes(token: FinishedPayload) {
    const value = values.get(token);
    if (!value) throw new Error("Unknown buffered payload");
    return value;
  }
  return {
    bytes,
    drain() {
      return Promise.resolve();
    },
    finish(input: Uint8Array): FinishedPayload {
      const owned = input.slice();
      const token = Object.freeze({
        length: owned.byteLength,
        sha256: digestHex(sha256(owned)),
      });
      values.set(token, owned);
      return token;
    },
    kind: "buffered" as const,
    openReader(
      token: FinishedPayload,
      offset: number,
      length: number,
    ): Promise<PayloadReader> {
      const value = bytes(token);
      let position = Math.min(offset, value.length);
      const end = Math.min(position + length, value.length);
      let closed = false;
      return Promise.resolve({
        close() {
          closed = true;
          return Promise.resolve();
        },
        read(maxBytes = 65536) {
          if (closed) return Promise.reject(new Error("Payload reader closed"));
          if (position === end) return Promise.resolve(null);
          const next = Math.min(position + Math.min(65536, maxBytes), end);
          const block = value.slice(position, next);
          position = next;
          return Promise.resolve(block);
        },
      });
    },
    prepareAdoption(token: FinishedPayload) {
      bytes(token);
      if (adopted.has(token)) throw new Error("Payload already adopted");
      return () => {
        adopted.add(token);
      };
    },
    retire(token: FinishedPayload) {
      values.delete(token);
      return Promise.resolve();
    },
  };
}
function digestHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
