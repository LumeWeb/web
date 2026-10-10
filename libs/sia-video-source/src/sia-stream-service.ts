/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-interfaces, perfectionist/sort-object-types, perfectionist/sort-modules, perfectionist/sort-named-imports, perfectionist/sort-union-types */
import { isSiaShareUrl, parseSiaShareUrl } from "./share-url.ts";
import type {
  SiaNativeStreamFile,
  SiaNativeStreamService,
} from "./native-stream-provider.ts";
import type {
  Sdk,
  SharedSdk,
  Streams,
  StreamingOptions,
} from "@siafoundation/sia-storage";

export interface SiaStreamAuthState {
  readonly indexerUrl: string;
  readonly userKeyHex: string;
  readonly sharingKeyHex: string | null;
}
export interface SiaStreamAuthSource {
  get?: () => SiaStreamAuthState;
  getAuth?: () => SiaStreamAuthState;
  subscribe?(listener: (state: SiaStreamAuthState) => void): () => void;
}
export interface SiaStreamSource {
  readonly objectKey: string;
  readonly shared: boolean;
}
export interface SiaStreamServiceOptions {
  readonly auth: SiaStreamAuthSource;
  readonly streaming?: StreamingOptions;
  readonly enableStreaming?: (options?: StreamingOptions) => Promise<boolean>;
  readonly connectApp?: (
    indexerUrl: string,
    userKeyHex: string,
  ) => Promise<Sdk>;
  readonly connectShared?: (
    indexerUrl: string,
    sharingKeyHex: string,
  ) => Promise<SharedSdk>;
  readonly openStreams?: (
    sdk: Sdk | SharedSdk,
    credentials: unknown,
  ) => Streams;
}
export interface SiaStreamService extends SiaNativeStreamService<SiaStreamSource> {
  prepare(signal?: AbortSignal): Promise<boolean>;
  dispose(): void;
}

const KEY = /^[0-9a-f]{64}$/;
interface SdkRecord {
  sdk: Sdk | SharedSdk;
  identity: string;
  credentials: unknown;
  refs: number;
  retired: boolean;
}

export function createSiaStreamService(
  options: SiaStreamServiceOptions,
): SiaStreamService {
  let preparation: Promise<boolean> | undefined;
  let disposed = false;
  let epoch = 0;
  let cached: SdkRecord | undefined;
  const connecting = new Map<string, Promise<SdkRecord>>();
  const enable = options.enableStreaming ?? defaultEnableStreaming;
  const connectApp = options.connectApp ?? defaultConnectApp;
  const connectShared = options.connectShared ?? defaultConnectShared;
  const readAuth = () =>
    options.auth.get?.() ??
    options.auth.getAuth?.() ??
    (() => {
      throw new Error("Sia stream auth source has no pull function");
    })();
  let currentAuthIdentity = authFingerprint(readAuth());
  const retire = (record: SdkRecord | undefined) => {
    if (!record || record.retired) return;
    record.retired = true;
    if (record.refs === 0) record.sdk.free();
  };
  const invalidate = () => {
    epoch++;
    retire(cached);
    cached = undefined;
  };
  const unsubscribe = options.auth.subscribe?.((state) => {
    const next = authFingerprint(state);
    if (next === currentAuthIdentity) return;
    currentAuthIdentity = next;
    invalidate();
  });
  const prepareBase = () => {
    preparation ??= enable(options.streaming).catch((error) => {
      preparation = undefined;
      throw error;
    });
    return preparation;
  };
  const service: SiaStreamService = {
    prepare: (signal) => awaitWithAbort(prepareBase(), signal),
    isAvailable: (signal) => awaitWithAbort(prepareBase(), signal),
    resolve: (src) => Promise.resolve(resolveSiaStreamSource(src)),
    session: async (source, signal) => {
      if (signal?.aborted) throw abortError();
      if (disposed) throw new Error("Sia stream service is disposed");
      const auth = readAuth();
      if (source.shared && !auth.sharingKeyHex)
        throw new Error("no sharing key configured for streaming");
      const identity = identityFor(source, auth);
      let record = cached?.identity === identity ? cached : undefined;
      if (!record) {
        const startEpoch = epoch;
        let connect = connecting.get(identity);
        if (!connect) {
          connect = (
            source.shared
              ? connectShared(auth.indexerUrl, auth.sharingKeyHex!)
              : connectApp(auth.indexerUrl, auth.userKeyHex)
          )
            .then((sdk) => {
              const created: SdkRecord = {
                sdk,
                identity,
                credentials: source.shared
                  ? { indexerUrl: auth.indexerUrl, seed: auth.sharingKeyHex }
                  : { appMeta: {}, indexerUrl: auth.indexerUrl },
                refs: 0,
                retired: false,
              };
              if (disposed || epoch !== startEpoch) {
                sdk.free();
                throw new Error("Sia stream SDK connection became stale");
              }
              if (cached && cached !== created) retire(cached);
              cached = created;
              return created;
            })
            .finally(() => connecting.delete(identity));
          connecting.set(identity, connect);
        }
        record = await awaitWithAbort(connect, signal);
      }
      if (signal?.aborted) throw abortError();
      if (!record)
        throw new Error("Sia stream SDK connection did not produce a handle");
      const activeRecord = record;
      // Invalidation can retire a record while connection setup is unwinding.
      // Never acquire a reference to a handle that has already been retired.
      if (
        activeRecord.retired ||
        (cached !== activeRecord && activeRecord.refs === 0)
      )
        throw new Error("Sia stream SDK connection became stale");
      activeRecord.refs++;
      let object: Awaited<ReturnType<Sdk["object"]>>;
      try {
        object = await activeRecord.sdk.object(source.objectKey);
      } catch (error) {
        releaseRecord(activeRecord);
        throw error;
      }
      if (signal?.aborted) {
        object.free();
        releaseRecord(activeRecord);
        throw abortError();
      }
      let streams: Streams;
      try {
        streams = options.openStreams
          ? await Promise.resolve(
              options.openStreams(activeRecord.sdk, activeRecord.credentials),
            )
          : await defaultOpenStreams(
              activeRecord.sdk,
              activeRecord.credentials,
            );
      } catch (error) {
        object.free();
        releaseRecord(activeRecord);
        throw error;
      }
      if (signal?.aborted) {
        streams.close();
        object.free();
        releaseRecord(activeRecord);
        throw abortError();
      }
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        streams.close();
        object.free();
        releaseRecord(activeRecord);
      };
      return {
        url: async (_source: unknown, opts): Promise<SiaNativeStreamFile> => {
          if (opts.signal?.aborted) {
            close();
            throw abortError();
          }
          let file;
          try {
            file = await streams.url(object, {
              name: opts.name,
              type: opts.type,
              signal: opts.signal,
              onProgress: opts.onProgress,
              onStatus: opts.onStatus,
            });
          } catch (error) {
            close();
            throw error;
          }
          if (opts.signal?.aborted) {
            file.release();
            close();
            throw abortError();
          }
          let released = false;
          return {
            blob: file.blob,
            url: file.url,
            release: () => {
              if (released) return;
              released = true;
              file.release();
              close();
            },
          };
        },
      };
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      unsubscribe?.();
      invalidate();
      preparation = undefined;
    },
  };
  function releaseRecord(record: SdkRecord) {
    record.refs--;
    if (record.retired && record.refs === 0) record.sdk.free();
  }
  return service;
}

export function resolveSiaStreamSource(src: string): SiaStreamSource {
  if (isSiaShareUrl(src))
    return { objectKey: parseSiaShareUrl(src).objectKey, shared: true };
  if (KEY.test(src)) return { objectKey: src, shared: false };
  throw new Error(
    "not a playable Sia source: expected a share URL or a 64-hex object key",
  );
}
function identityFor(
  source: SiaStreamSource,
  state: SiaStreamAuthState,
): string {
  return `${source.shared ? "shared" : "app"}:${fingerprint(`${state.indexerUrl}\0${source.shared ? (state.sharingKeyHex ?? "") : state.userKeyHex}`)}`;
}
function authFingerprint(state: SiaStreamAuthState): string {
  return fingerprint(
    `${state.indexerUrl}\0${state.userKeyHex}\0${state.sharingKeyHex ?? ""}`,
  );
}
function fingerprint(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(16);
}
function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}
function awaitWithAbort<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
async function defaultEnableStreaming(
  streaming?: StreamingOptions,
): Promise<boolean> {
  const { enableStreaming } = await import("@siafoundation/sia-storage");
  return enableStreaming(streaming);
}
async function defaultConnectApp(
  indexerUrl: string,
  userKeyHex: string,
): Promise<Sdk> {
  const { AppKey, Builder, initSia } =
    await import("@siafoundation/sia-storage");
  await initSia();
  const builder = new Builder(indexerUrl, {
    appId: "sia-video-source",
    name: "Sia video streaming",
    description: "Sia video streaming",
    serviceUrl: "https://lumeweb.com",
    logoUrl: undefined,
    callbackUrl: undefined,
  });
  let sdk: Sdk | undefined;
  try {
    sdk = await builder.connected(new AppKey(hex(userKeyHex)));
  } finally {
    builder.free();
  }
  if (!sdk)
    throw new Error("The Sia app key is not registered with the indexer.");
  return sdk;
}
async function defaultConnectShared(
  indexerUrl: string,
  sharingKeyHex: string,
): Promise<SharedSdk> {
  const { SharedSdk, initSia } = await import("@siafoundation/sia-storage");
  await initSia();
  return SharedSdk.connect(indexerUrl, sharingKeyHex);
}
async function defaultOpenStreams(
  sdk: Sdk | SharedSdk,
  credentials: unknown,
): Promise<Streams> {
  const { openStreams } = await import("@siafoundation/sia-storage");
  return openStreams(sdk as never, credentials as never);
}
function hex(value: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value))
    throw new Error("The Sia app key must be 64 hexadecimal characters.");
  return Uint8Array.from(value.match(/.{1,2}/g) ?? [], (pair) =>
    Number.parseInt(pair, 16),
  );
}
export type { SiaNativeStreamFile };
