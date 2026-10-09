/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-interfaces, perfectionist/sort-object-types, perfectionist/sort-classes, perfectionist/sort-exports */
/** Backend-neutral, opt-in transport telemetry. */
export type SiaTransportStatus = "connecting" | "downloading" | "idle";

/** Cumulative bytes transferred by the active transport load. */
export interface SiaTransportTelemetry {
  readonly status: SiaTransportStatus;
  readonly bytesDownloaded: number;
}

export type SiaTransportTelemetryCallback = (
  telemetry: SiaTransportTelemetry,
) => void;

/** Invoke app telemetry defensively: observability must never affect playback. */
export function reportTransportTelemetry(
  callback: SiaTransportTelemetryCallback | undefined,
  telemetry: SiaTransportTelemetry,
): void {
  if (!callback) return;
  try {
    callback(telemetry);
  } catch {
    // User callbacks are outside the playback error boundary.
  }
}
