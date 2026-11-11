/** Connects sharing seeds for independent, read-only object listing. */
import type { ObjectSummary } from "@siafoundation/sia-storage";
export interface ListingSession {
  free(): void;
  objectSummaries(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly ListingSummary[]>;
}
export type ListingSummary = Pick<
  ObjectSummary,
  "free" | "id" | "metadata" | "size"
>;
/** The WASM chunk is deferred until the application receives a sharing seed. */
export async function connectSharedObjects(
  indexerUrl: string,
  seedHex: string,
): Promise<ListingSession> {
  const { initSia, SharedSdk } = await import("@siafoundation/sia-storage");
  await initSia();
  return SharedSdk.connect(indexerUrl, seedHex);
}
