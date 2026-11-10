/** Allocates SDK sessions only when sign-in or shared-object listing starts. */
import type { ObjectSummary } from "@siafoundation/sia-storage";
import { APP_META } from "./constants";
import { fromHex } from "./hex";
export interface AuthRequest {
  free(): void;
  matchesExistingAppKey(phrase: string): Promise<boolean>;
  register(phrase: string): Promise<AuthSession>;
  responseUrl(): string;
  waitForApproval(): Promise<void>;
}
export interface AuthSession {
  appKey(): { export(): Uint8Array; free(): void };
  free(): void;
}
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
/** SDK sessions hold WASM resources, so callers retain the seed rather than serialize the session. */
export async function connectAppKey(
  indexerUrl: string,
  userKeyHex: string,
): Promise<AuthSession> {
  const { AppKey, Builder, initSia } =
    await import("@siafoundation/sia-storage");
  await initSia();
  const key = new AppKey(fromHex(userKeyHex));
  const builder = new Builder(indexerUrl, APP_META);
  const sdk = await builder.connected(key);
  builder.free();
  if (!sdk)
    throw new Error("The Sia app key is not registered with the indexer.");
  return sdk;
}
/** The WASM chunk is deferred until the application receives a sharing seed. */
export async function connectSharedObjects(
  indexerUrl: string,
  seedHex: string,
): Promise<ListingSession> {
  const { initSia, SharedSdk } = await import("@siafoundation/sia-storage");
  await initSia();
  return SharedSdk.connect(indexerUrl, seedHex);
}
export async function openAuthRequest(
  indexerUrl: string,
): Promise<AuthRequest> {
  const { Builder, initSia } = await import("@siafoundation/sia-storage");
  await initSia();
  const request = new Builder(indexerUrl, APP_META);
  await request.requestConnection();
  return request;
}
