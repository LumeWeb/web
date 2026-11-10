/** Identity claims prevent accepted SDKs and adapter handles from acquiring another disposal owner. */
import { SdkSessionError, SdkSessionErrorCode } from "../types.ts";
import type { SdkClient, SdkHandle } from "../types.ts";

type AdmissionCheck = () => void;

const clients = new WeakMap<object, symbol>();
const handles = new WeakSet<object>();
const sharedValues = new WeakSet<object>();

export interface Admission<T> {
  readonly handle: SdkHandle<T>;
  readonly id: symbol;
}

/**
 * Captures a standard SDK's destructor before claiming its identity.
 * The session's guard runs around caller-controlled getters, so a reentrant
 * change cannot transfer ownership through an obsolete adoption request.
 * @returns The existing current ID, or a newly claimed SDK and its captured cleanup.
 */
export function adoptClient<T>(
  client: SdkClient & T,
  currentId: symbol | undefined,
  assertAdmission: AdmissionCheck,
): Admission<T> | symbol {
  assertAdmission();
  if (!isReference(client))
    throw new SdkSessionError(SdkSessionErrorCode.InvalidHandle);
  const existing = clients.get(client);
  if (existing) {
    if (currentId === existing) return existing;
    throw new SdkSessionError(SdkSessionErrorCode.AlreadyUsed);
  }
  if (handles.has(client) || sharedValues.has(client))
    throw new SdkSessionError(SdkSessionErrorCode.AlreadyUsed);
  // Keep the accepted SDK's destructor even if the caller later changes that method.
  // oxlint-disable-next-line typescript/unbound-method
  const free = client.free;
  if (typeof free !== "function")
    throw new SdkSessionError(SdkSessionErrorCode.InvalidHandle);
  assertAdmission();
  if (isReserved(client))
    throw new SdkSessionError(SdkSessionErrorCode.AlreadyUsed);
  const id = Symbol("sdk");
  clients.set(client, id);
  return { handle: { dispose: () => free.call(client), value: client }, id };
}

/**
 * Claims a custom handle and reserves its value after capturing both getters.
 * Shared values permit separate handles but cannot become exclusive SDK owners.
 * The guard rejects a session change before either identity is reserved.
 */
export function adoptHandle<T>(
  handle: SdkHandle<T>,
  assertAdmission: AdmissionCheck,
  sharedValue = false,
): Admission<T> {
  assertAdmission();
  if (!isReference(handle) || !("value" in handle))
    throw new SdkSessionError(SdkSessionErrorCode.InvalidHandle);
  if (isReserved(handle))
    throw new SdkSessionError(SdkSessionErrorCode.AlreadyUsed);
  const value = handle.value;
  // The original handle remains the receiver when its captured cleanup runs.
  // oxlint-disable-next-line typescript/unbound-method
  const dispose = handle.dispose;
  if (typeof dispose !== "function")
    throw new SdkSessionError(SdkSessionErrorCode.InvalidHandle);
  assertAdmission();
  if (
    isReserved(handle) ||
    (isReference(value) &&
      (isClaimed(value) || (!sharedValue && sharedValues.has(value))))
  )
    throw new SdkSessionError(SdkSessionErrorCode.AlreadyUsed);
  const id = Symbol("sdk");
  if (isReference(value)) {
    if (sharedValue) sharedValues.add(value);
    else clients.set(value, id);
  }
  handles.add(handle);
  return { handle: { dispose: () => dispose.call(handle), value }, id };
}

/** Descriptors can also be SDK clients, so claims cannot be checked by admission role alone. */
function isClaimed(value: object): boolean {
  return clients.has(value) || handles.has(value);
}

/** Functions can carry SDK methods and identity; typeof object alone would also accept null. */
function isReference(value: unknown): value is object {
  return (
    value !== null && (typeof value === "object" || typeof value === "function")
  );
}

/** Shared values cannot later acquire an exclusive cleanup owner. */
function isReserved(value: object): boolean {
  return isClaimed(value) || sharedValues.has(value);
}
