/** Live profiles carry borrowed authority; resource ownership is tracked separately from account credentials. */
import type { AppDefinition } from "../types.js";
export type LiveAuthentication =
  | { readonly appKeyHex: string; readonly kind: "app-key" }
  | {
      readonly connectKey: string;
      readonly kind: "register";
      readonly phrase: string;
    }
  | {
      readonly kind: "preauthorized";
      readonly phrase: string;
      readonly preauthorizedKeyHex: string;
    };
export interface LiveConsent {
  readonly apiBaseUrl: string;
  readonly mutations: true;
  readonly transfers: true;
}
export interface LiveLimits {
  readonly cleanupDeadlineMs: number;
  readonly deadlineMs: number;
  readonly maxDecodedDownloadBytes: number;
  readonly maxLogicalUploadBytes: number;
  readonly maxObjects: number;
  readonly maxObservedShardBytes: number;
  readonly maxShares: number;
}
export interface LiveProfileDocument {
  readonly apiBaseUrl: string;
  readonly app: AppDefinition;
  readonly auth: LiveAuthentication;
  readonly encoding: UploadEncoding;
  readonly limits: LiveLimits;
  readonly version: 1;
}
export interface UploadEncoding {
  readonly dataShards: number;
  readonly maxBufferedSlabs: number;
  readonly parityShards: number;
}
declare const privateProfile: unique symbol;
export interface LiveProfile {
  readonly [privateProfile]: true;
}
