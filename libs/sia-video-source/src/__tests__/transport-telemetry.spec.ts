import { describe, expect, it, vi } from "vitest";
import { reportTransportTelemetry } from "../transport-telemetry.ts";

describe("transport telemetry", () => {
  it("reports telemetry when a callback is provided", () => {
    const callback = vi.fn();
    const telemetry = { bytesDownloaded: 42, status: "downloading" as const };

    reportTransportTelemetry(callback, telemetry);

    expect(callback).toHaveBeenCalledWith(telemetry);
  });

  it("does not throw when a callback fails", () => {
    const callback = vi.fn(() => {
      throw new Error("telemetry failure");
    });

    expect(() =>
      reportTransportTelemetry(callback, {
        bytesDownloaded: 0,
        status: "idle",
      }),
    ).not.toThrow();
  });
});
