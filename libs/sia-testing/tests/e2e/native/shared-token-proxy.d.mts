import type { SharedTokenObserver } from "../support/shared-token-observer.js";
import type { TokenEvidence } from "./shared-token-checks.ts";
/** Owns one loopback listener and the bounded observation tasks created by its requests. */
export interface SharedTokenProxy {
  close(): Promise<void>;
  controlURL: string;
  drain(): Promise<void>;
  evidence(): null | TokenEvidence;
  routing(): { forwardedRequests: number };
  url: string;
}
export function nativeAppOrigin(appURL: string, adminURL: string): string;
export function scopedProxyEnvironment(
  environment: NodeJS.ProcessEnv,
  proxyURL: string,
): NodeJS.ProcessEnv;
export function startSharedTokenProxy(options: {
  appOrigin: string;
  drainTimeoutMs?: number;
  maxBodyBytes?: number | undefined;
  maxCaptureBytes?: number;
  maxPendingRequests?: number;
  maxRecords?: number;
  maxResponses?: number;
  observer: SharedTokenObserver;
}): Promise<SharedTokenProxy>;
