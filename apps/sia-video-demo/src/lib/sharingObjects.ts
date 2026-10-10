/**
 * Shared object-listing adapter: a small, testable walker for progressive
 * paged listing of the objects a sharing key grants access to.
 *
 * The walker is SDK-free, all it needs is an injected `SharedObjectsPageClient`
 * whose `fetchPage(offset, pageSize)` returns one already-decoded page of
 * `SharedObjectRow`s. Keeping the SDK behind that boundary makes the paging /
 * dedup / retry logic unit-testable without WASM, and it keeps this module free
 * of UI state. The lazy `createSharedObjectsClient` helper wires the walker to
 * the real Sia SDK: it dynamic-imports the WASM chunk only when a seed is
 * applied (mirroring the main-thread connect pattern), so the SDK stays lazy at
 * the adapter boundary.
 *
 * Secret hygiene: when a client is injected, the sharing-key seed never even
 * reaches this module. Every error this module throws is built from fixed,
 * seed-free text (the underlying cause is attached separately and never
 * stringified into `message`), so sharing-key plaintext cannot leak into
 * results, error messages, or logs.
 */

import type { PinnedObject, SharedSdk } from "@siafoundation/sia-storage";
import { normalizeObjectKeyHex } from "./hex";

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_BASE_MS = 500;
const DEFAULT_RETRY_MAX_MS = 3000;
const MAX_NAME_LENGTH = 120;
const OBJECT_META_TYPE = "sialo-object-meta";

/** Per-page view handed to `onPage` so the caller can render rows as they land. */
export interface SharedObjectPageView {
  /** True once a page returned fewer rows than `pageSize` (listing complete). */
  readonly end: boolean;
  /** Cursor offset of the first not-yet-fetched row; equals `offset` at `end`. */
  readonly nextOffset: number;
  /** Offset this page was fetched from. */
  readonly offset: number;
  /** 0-based index of this page in the walk. */
  readonly pageIndex: number;
  /** Rows of this page AFTER dedup against every previous page (first wins). */
  readonly rows: SharedObjectRow[];
  /** Distinct rows seen once this page is included. */
  readonly totalRows: number;
}

/** One plain, render-safe row of the object picker. */
export interface SharedObjectRow {
  /** Canonical 64-hex lowercase object key (0x prefix stripped). */
  readonly id: string;
  /** Display name decoded from the object's metadata (sanitized + capped). */
  readonly name: string;
  /** Logical object size in bytes. */
  readonly size: number;
}

/** Lazy SDK wiring: hands the walker a client and releases the shared session. */
export interface SharedObjectsClientHandle {
  /** Page client backed by the connected SDK (one live SharedSdk inside). */
  readonly client: SharedObjectsPageClient;
  /** Frees the underlying SharedSdk; must be called when listing is done. */
  dispose(): void;
}

export interface SharedObjectsListingOptions {
  /** Progressive hook fired once per decoded page, in offset order, with the
   * deduped page view. Best-effort: the listing still returns the full result. */
  readonly onPage?: (page: SharedObjectPageView) => void;
  readonly pageSize?: number;
  /** Extra per-page retry attempts after the first try. Default 2. */
  readonly retries?: number;
  /** Base per-page retry delay in ms (doubles per attempt). Default 500. */
  readonly retryBaseDelayMs?: number;
  /** Cap for per-page retry delay in ms. Default 3000. */
  readonly retryMaxDelayMs?: number;
}

export interface SharedObjectsListingResult {
  readonly ended: boolean;
  /** Number of pages fetched to reach `ended`. */
  readonly pagesRead: number;
  /** All distinct rows, in first-seen order. */
  readonly rows: SharedObjectRow[];
}

/**
 * Injected SDK/client boundary: returns one already-decoded page starting at
 * `offset`. A thrown error is treated as transient and retried per page.
 */
export interface SharedObjectsPageClient {
  fetchPage(offset: number, pageSize: number): Promise<SharedObjectRow[]>;
}

/** The walker's resolved options: `listSharedObjects` defaults each field. */
interface WalkPagesOptions {
  readonly onPage?: (page: SharedObjectPageView) => void;
  readonly pageSize: number;
  readonly retries: number;
  readonly retryBaseDelayMs: number;
  readonly retryMaxDelayMs: number;
}

/** A retryable listing failure, raised once one page's retries run out. */
export class SharedObjectsListingError extends Error {
  readonly attempt: number;
  readonly cause: unknown;
  readonly offset: number;
  readonly pageIndex: number;
  readonly retryable = true;

  constructor(
    pageIndex: number,
    offset: number,
    attempt: number,
    cause: unknown,
  ) {
    super(
      `shared-object listing failed at offset ${offset} (page ${pageIndex}) after ${attempt} attempt(s)`,
    );
    this.name = "SharedObjectsListingError";
    this.attempt = attempt;
    this.cause = cause;
    this.offset = offset;
    this.pageIndex = pageIndex;
  }
}

/**
 * Lazy SDK boundary: connects the sharing seed and exposes it as a
 * `SharedObjectsPageClient` for `listSharedObjects`. Each returned page is
 * decoded into plain rows and every WASM handle (each `PinnedObject` as it is
 * read, and the `SharedSdk` via `dispose()`) is freed. The seed is consumed
 * here at the boundary and is never echoed into the produced rows or any
 * message this module emits. `connect` is injectable for tests and defaults to
 * a lazy dynamic import of the WASM SDK (the chunk is only fetched when a seed
 * is actually applied). Throws on connect failure, the caller decides how to
 * surface it.
 */
export async function createSharedObjectsClient(
  indexerUrl: string,
  seedHex: string,
  connect: (
    indexerUrl: string,
    seedHex: string,
  ) => Promise<SharedSdk> = defaultSharedObjectsConnect,
): Promise<SharedObjectsClientHandle> {
  const sdk = await connect(indexerUrl, seedHex);
  const client: SharedObjectsPageClient = {
    fetchPage: async (offset, pageSize) =>
      (await sdk.objects(offset, pageSize)).map((object) => rowOf(object)),
  };
  return {
    client,
    dispose: () => sdk.free(),
  };
}

/**
 * Decodes a picker display name from an object's raw metadata bytes. Tries the
 * JSON envelope `{type:"sialo-object-meta",version:1,filename}` → `filename`;
 * otherwise treats the raw bytes as a UTF-8 text filename. Falls back to a
 * compact `id.slice(0,8)…id.slice(-8)` when nothing readable decodes. The
 * result is sanitized for display (control/Bidi + zero-width chars stripped,
 * whitespace collapsed, length capped). Best-effort by design: any unexpected
 * decode/parse error drops to the compact id label instead of throwing.
 */
export function decodeObjectName(id: string, metadata: Uint8Array): string {
  try {
    let name: null | string = null;

    const text = readUtf8(metadata);
    if (text !== "") {
      // Envelope first: a JSON payload carrying a filename.
      try {
        const parsed = JSON.parse(text) as {
          filename?: unknown;
          type?: unknown;
          version?: unknown;
        };
        if (
          parsed &&
          parsed.type === OBJECT_META_TYPE &&
          typeof parsed.filename === "string"
        ) {
          name = parsed.filename;
        }
      } catch {
        name = null;
      }
      // Otherwise treat the raw bytes as a plain UTF-8 filename.
      name ??= text;
    }

    if (name !== null) name = sanitizeDisplayName(name);
    if (name === null || name === "") return fallbackObjectName(id);
    return name.slice(0, MAX_NAME_LENGTH);
  } catch {
    return fallbackObjectName(id);
  }
}

/**
 * Lists the objects a sharing-key seed's page client exposes, deduplicated
 * across pages. With `onPage`, each decoded page is delivered progressively
 * (its deduped rows, page stats, cursor and end flag) so the caller can append
 * rows as they land. Each page is its own atomic retry unit: a flaky page is
 * re-fetched in place from the same offset with exponential backoff, and once
 * its retries run out a `SharedObjectsListingError` (always retryable) is
 * thrown. The full deduped listing is still returned for callers that only
 * want the final snapshot.
 */
export async function listSharedObjects(
  client: SharedObjectsPageClient,
  options?: SharedObjectsListingOptions,
): Promise<SharedObjectsListingResult> {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error("pageSize must be a positive integer");
  }
  return walkPages(client, {
    onPage: options?.onPage,
    pageSize,
    retries: options?.retries ?? DEFAULT_RETRIES,
    retryBaseDelayMs: options?.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_MS,
    retryMaxDelayMs: options?.retryMaxDelayMs ?? DEFAULT_RETRY_MAX_MS,
  });
}

/**
 * Canonical (lowercase, no `0x` prefix) 64-hex row id; a malformed id falls
 * back to its lowercased form rather than failing the whole listing.
 */
function canonicalObjectKey(id: string): string {
  try {
    return normalizeObjectKeyHex(id);
  } catch {
    return id.toLowerCase();
  }
}

/** Lazily connects the sharing seed: dynamic-imports the WASM SDK (the chunk
 * is only fetched when a seed is actually applied) and returns the SharedSdk. */
async function defaultSharedObjectsConnect(
  indexerUrl: string,
  seedHex: string,
): Promise<SharedSdk> {
  const { initSia, SharedSdk: Sdk } =
    await import("@siafoundation/sia-storage");
  await initSia();
  return Sdk.connect(indexerUrl, seedHex);
}

/** Compact id-based fallback label: `head…tail` of the 64-hex key, sanitized
 * and length-capped, used whenever a name cannot be decoded at all. */
function fallbackObjectName(id: string): string {
  const head = id.slice(0, 8);
  const tail = id.slice(-8);
  return sanitizeDisplayName(`${head}…${tail}`).slice(0, MAX_NAME_LENGTH);
}

/** Fetches one page as its own atomic retry unit (exponential backoff): only
 * the flaky page is re-fetched, in place from the same offset. Throws a
 * `SharedObjectsListingError` (retryable by definition) once retries run out. */
async function fetchPageWithRetry(
  client: SharedObjectsPageClient,
  pageIndex: number,
  offset: number,
  pageSize: number,
  retries: number,
  retryBaseDelayMs: number,
  retryMaxDelayMs: number,
): Promise<SharedObjectRow[]> {
  let attemptCount = 0;
  for (;;) {
    try {
      return await client.fetchPage(offset, pageSize);
    } catch (cause) {
      if (attemptCount >= retries) {
        throw new SharedObjectsListingError(
          pageIndex,
          offset,
          attemptCount + 1,
          cause,
        );
      }
      await sleep(
        retryDelayMs(attemptCount, retryBaseDelayMs, retryMaxDelayMs),
      );
      attemptCount += 1;
    }
  }
}

/** Reads metadata bytes as UTF-8 text (trimmed); empty string when unreadable.
 * U+FFFD marks bytes that were not valid UTF-8 (e.g. binary metadata), treat
 * those as unreadable so they fall back to the id chip instead of rendering
 * replacement glyphs. */
function readUtf8(metadata: Uint8Array): string {
  try {
    const text = new TextDecoder()
      .decode(metadata)
      .replace(/^\uFEFF/, "")
      .trim();
    return text.includes("\uFFFD") ? "" : text;
  } catch {
    return "";
  }
}

/** Exponential backoff for one retry step, capped at `retryMaxDelayMs`. */
function retryDelayMs(
  attempt: number,
  retryBaseDelayMs: number,
  retryMaxDelayMs: number,
): number {
  if (retryBaseDelayMs <= 0) return 0;
  return Math.min(retryBaseDelayMs * 2 ** attempt, retryMaxDelayMs);
}

/** Decodes one PinnedObject into a plain row and frees its WASM handle. A
 * single bad row (e.g. a WASM metadata/size read failure) must not fail the
 * whole listing: degrade to the compact id label + 0 size. The id is
 * canonicalized so every row compares equal to a selected key from any other
 * path; the handle is freed even when decoding fails. */
function rowOf(object: PinnedObject): SharedObjectRow {
  const id = canonicalObjectKey(object.id());
  let size = 0;
  let name: string;
  try {
    size = object.size();
    name = decodeObjectName(id, object.metadata());
  } catch {
    name = fallbackObjectName(id);
  } finally {
    object.free();
  }
  return { id, name, size };
}

/**
 * Collapses whitespace and strips control + Bidi/zero-width chars. Built as a
 * char-code walk (not a control-char regex literal) so it stays lint-clean.
 */
function sanitizeDisplayName(name: string): string {
  let out = "";
  for (const ch of name) {
    const code = ch.codePointAt(0) ?? 0;
    const dropped =
      code < 0x20 ||
      code === 0x7f ||
      (code >= 0x80 && code <= 0x9f) ||
      code === 0x2028 ||
      code === 0x2029 ||
      (code >= 0x200b && code <= 0x200d) ||
      code === 0x2060 ||
      code === 0xfeff;
    out += dropped ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Pages `fetchPage(offset, options.pageSize)` until a short page, deduplicating
 * rows by canonical id (first occurrence wins) and delivering each page's
 * deduped view to `onPage`. Throws `SharedObjectsListingError` once a page's
 * retries run out. */
async function walkPages(
  client: SharedObjectsPageClient,
  options: WalkPagesOptions,
): Promise<SharedObjectsListingResult> {
  const seen = new Set<string>();
  const rows: SharedObjectRow[] = [];
  let offset = 0;
  let pageIndex = 0;
  for (;;) {
    const page = await fetchPageWithRetry(
      client,
      pageIndex,
      offset,
      options.pageSize,
      options.retries,
      options.retryBaseDelayMs,
      options.retryMaxDelayMs,
    );
    const fresh: SharedObjectRow[] = [];
    for (const source of page) {
      const id = canonicalObjectKey(source.id);
      if (seen.has(id)) continue;
      seen.add(id);
      const next = { id, name: source.name, size: source.size };
      rows.push(next);
      fresh.push(next);
    }
    const end = page.length < options.pageSize;
    options.onPage?.({
      end,
      nextOffset: end ? offset : offset + options.pageSize,
      offset,
      pageIndex,
      rows: fresh,
      totalRows: rows.length,
    });
    if (end) break;
    offset += options.pageSize;
    pageIndex += 1;
  }
  return { ended: true, pagesRead: pageIndex + 1, rows };
}
