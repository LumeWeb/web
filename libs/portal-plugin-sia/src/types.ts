/** Matches the Go dto.AppResponse struct from PR #26. */
export interface AppResponse {
  /** Hex-encoded ed25519 public key of the app account */
  publicKey: string;
  name: string;
  description: string;
  logoURL: string;
  serviceURL: string;
  /** Bytes of data pinned by this app */
  pinnedData: number;
  /** ISO 8601 timestamp of last usage */
  lastUsed: string;
}
