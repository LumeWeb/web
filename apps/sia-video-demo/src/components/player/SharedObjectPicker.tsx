/**
 * Shared-mode object listing UI (a mode panel of the player screen). A valid
 * persisted sharing key drives a progressive paged listing via
 * `createSharedObjectsClient` + `listSharedObjects`; the picker renders a
 * loading status (rows appended as pages land), a stats/rows view, and a
 * retryable error with a Retry action.
 *
 * The player screen owns source selection, so this panel is controlled: it
 * renders the hoisted `selectedKey`, reports row clicks up through
 * `onSelectObject` (toggle semantics live in the hoisted reducer), and the
 * in-row check mark is the selection feedback. The seed is a prop consumed
 * only at the `createSharedObjectsClient` boundary, never rendered, logged,
 * or held in React state. Selection is a canonical key, normalized identically
 * to listing ids and share-fragment object keys.
 *
 * The pure listing/selection helpers are exported so the state transitions can
 * be unit-tested without a DOM.
 */

import { useEffect, useState } from "react";
import {
  createSharedObjectsClient,
  listSharedObjects,
  type SharedObjectPageView,
  type SharedObjectRow,
  type SharedObjectsClientHandle,
  SharedObjectsListingError,
  type SharedObjectsListingResult,
} from "../../lib/sharingObjects";
import { canonicalizeSelectedObjectKey } from "../../lib/sourceSelection";
import { cn } from "../../lib/utils";
import { useEventLogStore } from "../../stores/eventLog";

export interface SharedObjectPickerProps {
  readonly indexerUrl: string;
  /** Reports a row click up to the hoisted selection state (toggle semantics). */
  readonly onSelectObject: (objectKey: string) => void;
  /** Hoisted canonical selected object key, or null when nothing is selected. */
  readonly selectedKey: null | string;
  /** 32-byte sharing-key seed (hex). Consumed at the client boundary only. */
  readonly sharingKeyHex: string;
}

/** Plain, render-safe progressive listing state. */
export interface SharedPickerListingState {
  /** Seed-free message shown while the phase is "error"; null otherwise. */
  readonly errorMessage: null | string;
  /** Pages fetched so far (1-based once a page has landed). */
  readonly pagesRead: number;
  readonly phase: SharedPickerPhase;
  /** Distinct rows landed so far (appended as pages arrive). */
  readonly rows: readonly SharedObjectRow[];
  /** Distinct rows seen once the latest page is included. */
  readonly totalRows: number;
}

/** Listing phase the picker surfaces: error, loading, or ready (ended). */
export type SharedPickerPhase = "error" | "loading" | "ready";

/** Appends one deduped page view to the running listing state. */
export function appendSharedPickerPage(
  state: SharedPickerListingState,
  page: SharedObjectPageView,
): SharedPickerListingState {
  return {
    ...state,
    pagesRead: page.pageIndex + 1,
    rows: [...state.rows, ...page.rows],
    totalRows: page.totalRows,
  };
}

/** Starting state for a fresh listing run: loading, no rows, no error. */
export function emptySharedPickerListing(): SharedPickerListingState {
  return {
    errorMessage: null,
    pagesRead: 0,
    phase: "loading",
    rows: [],
    totalRows: 0,
  };
}

/** Marks a listing run failed while keeping any rows already landed. */
export function failSharedPickerListing(
  state: SharedPickerListingState,
  message: string,
): SharedPickerListingState {
  return { ...state, errorMessage: message, phase: "error" };
}

/** Lifts a completed listing result into the ready (ended) state. */
export function finishSharedPickerListing(
  result: SharedObjectsListingResult,
): SharedPickerListingState {
  return {
    errorMessage: null,
    pagesRead: result.pagesRead,
    phase: "ready",
    rows: result.rows,
    totalRows: result.rows.length,
  };
}

/**
 * Objects fetched per listing page: caps how many rows a single page request
 * returns from the indexer; pages still arrive progressively via `onPage`.
 */
export const SHARED_PICKER_PAGE_SIZE = 10;

/** Accessible loading line shown before the first object row lands. */
export const SHARED_PICKER_LOADING_TEXT = "Loading shared objects…";

/**
 * Pulsing placeholder rows shown while the first page is loading; real rows
 * replace the skeleton once any row has landed.
 */
export const SHARED_PICKER_SKELETON_ROWS = 4;

/**
 * Max-height scrollable container for the object rows, shared by the real
 * rows and the skeleton placeholders.
 */
export const SHARED_PICKER_LIST_CONTAINER_CLASS =
  "flex max-h-80 flex-col gap-1 overflow-y-auto pr-1";

/** Compact byte size for a row (B / KiB / MiB / GiB, one decimal above B). */
export function formatSharedObjectSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
}

/** Whether a row id canonicalizes to the currently selected key. */
export function isObjectKeySelected(
  selected: null | string,
  candidateId: string,
): boolean {
  const candidate = canonicalizeSelectedObjectKey(candidateId);
  return candidate !== null && candidate === selected;
}

export function SharedObjectPicker({
  indexerUrl,
  onSelectObject,
  selectedKey,
  sharingKeyHex,
}: SharedObjectPickerProps) {
  const [listing, setListing] = useState<SharedPickerListingState>(
    emptySharedPickerListing,
  );
  const [reloadKey, setReloadKey] = useState(0);

  // Progressively list the sharing key's objects; Retry re-runs the walk.
  // The client handle is disposed when a run settles and on unmount.
  // Selection is owned by the player screen: row clicks only report up.
  useEffect(() => {
    let cancelled = false;
    let handle: null | SharedObjectsClientHandle = null;
    setListing(emptySharedPickerListing());
    const run = async (): Promise<void> => {
      try {
        handle = await createSharedObjectsClient(indexerUrl, sharingKeyHex);
        const result = await listSharedObjects(handle.client, {
          onPage: (page) => {
            if (cancelled) return;
            setListing((current) => appendSharedPickerPage(current, page));
          },
          pageSize: SHARED_PICKER_PAGE_SIZE,
        });
        if (!cancelled) setListing(finishSharedPickerListing(result));
      } catch (error) {
        if (cancelled) return;
        setListing((current) =>
          failSharedPickerListing(current, sharedPickerErrorMessage(error)),
        );
      } finally {
        handle?.dispose();
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [indexerUrl, reloadKey, sharingKeyHex]);

  const retry = () => setReloadKey((key) => key + 1);

  const statusText = sharedPickerStatusText(listing);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mt-0 mb-3 text-lg">Pick an object to play</h2>
      {statusText ? (
        <p
          aria-busy={listing.phase === "loading"}
          className="text-fg-muted m-0 text-xs"
          role="status">
          {statusText}
        </p>
      ) : null}

      {shouldShowSharedPickerSkeleton(listing) ? (
        <div aria-busy="true" className="flex flex-col gap-1" role="status">
          <span className="text-fg-muted text-xs">
            {SHARED_PICKER_LOADING_TEXT}
          </span>
          {/* Pulsing skeleton playlist rows, shown ONLY while the first page is
              still loading; real rows replace them the moment one lands. */}
          <div
            aria-hidden="true"
            className={`animate-pulse ${SHARED_PICKER_LIST_CONTAINER_CLASS}`}>
            {Array.from({ length: SHARED_PICKER_SKELETON_ROWS }, (_, index) => (
              <div
                className="border-border-default bg-border-muted flex h-9 w-full items-center gap-2 rounded-md border px-3.5 py-2"
                key={index}>
                <span className="bg-fg-muted/30 h-3 w-4 shrink-0 rounded" />
                <span className="bg-fg-muted/30 h-3 w-1/2 rounded" />
                <span className="bg-fg-muted/30 h-3 w-12 rounded max-sm:hidden sm:ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {listing.phase === "ready" && listing.rows.length === 0 ? (
        <p className="text-fg-muted m-0 text-xs">
          No shared objects are accessible with this key.
        </p>
      ) : null}

      {listing.rows.length > 0 ? (
        <div className={SHARED_PICKER_LIST_CONTAINER_CLASS}>
          {listing.rows.map((row) => {
            const selected = isObjectKeySelected(selectedKey, row.id);
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "border-border-default bg-border-muted hover:bg-canvas-subtle flex w-full items-center gap-2 rounded-md border px-3.5 py-2 text-left",
                  selected && "border-accent bg-canvas-subtle",
                )}
                key={row.id}
                onClick={() => onSelectObject(row.id)}
                type="button">
                <span className="text-accent w-4 shrink-0 text-center">
                  {selected ? "✓" : ""}
                </span>
                <span className="min-w-0 flex-1 truncate">{row.name}</span>
                <span className="text-fg-muted shrink-0 text-xs">
                  {formatSharedObjectSize(row.size)}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {listing.phase === "error" ? (
        <>
          <p className="text-danger m-0 text-xs" role="alert">
            {listing.errorMessage}
          </p>
          <button onClick={retry} type="button">
            Retry
          </button>
        </>
      ) : null}
    </div>
  );
}

/**
 * Seed-safe error copy: the visible message is always one fixed plain line.
 * Detailed `SharedObjectsListingError` diagnostics go only to the existing
 * demo logging facility (the typed event-log store, as an `error` line) and
 * never to a browser console; any other error degrades to the same line and is
 * not logged, since raw SDK messages could embed key material.
 */
export function sharedPickerErrorMessage(error: unknown): string {
  if (error instanceof SharedObjectsListingError) {
    useEventLogStore.getState().push(error.message, "error");
  }
  return "Could not reach the sharing indexer for object listing.";
}

/**
 * Status line above the list: null before the first row lands (the skeleton's
 * status region carries the loading text), a `Showing N objects` progress
 * label while rows stream in, a plain `N objects` once finished, and null in
 * error (the alert + Retry owns that copy) or for an empty ready listing.
 */
export function sharedPickerStatusText(
  state: SharedPickerListingState,
): null | string {
  if (state.phase === "loading" && state.rows.length > 0) {
    const count = state.rows.length;
    return `Showing ${count} object${count === 1 ? "" : "s"}`;
  }
  if (state.phase === "ready" && state.totalRows > 0) {
    return `${state.totalRows} object${state.totalRows === 1 ? "" : "s"}`;
  }
  return null;
}

/**
 * Whether to render the pulsing skeleton rows: only while loading and no real
 * row has landed yet.
 */
export function shouldShowSharedPickerSkeleton(
  state: SharedPickerListingState,
): boolean {
  return state.phase === "loading" && state.rows.length === 0;
}
