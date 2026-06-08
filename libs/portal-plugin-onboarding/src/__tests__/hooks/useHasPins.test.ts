import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "vitest-browser-react";

vi.mock("@lumeweb/portal-plugin-ipfs", () => ({
  usePinsCount: vi.fn(),
}));

import { usePinsCount } from "@lumeweb/portal-plugin-ipfs";
import { useHasPins } from "@/hooks/useHasPins";

const mockUsePinsCount = vi.mocked(usePinsCount);

describe("useHasPins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasPins: true when count > 0", async () => {
    mockUsePinsCount.mockReturnValue({
      hasPins: true,
      isBusy: false,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useHasPins());
    expect(result.current.hasPins).toBe(true);
  });

  it("returns hasPins: false when count === 0", async () => {
    mockUsePinsCount.mockReturnValue({
      hasPins: false,
      isBusy: false,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useHasPins());
    expect(result.current.hasPins).toBe(false);
  });

  it("passes through isBusy", async () => {
    mockUsePinsCount.mockReturnValue({
      hasPins: false,
      isBusy: true,
      hasError: false,
    } as any);

    const { result } = await renderHook(() => useHasPins());
    expect(result.current.isBusy).toBe(true);
  });

  it("passes through hasError", async () => {
    mockUsePinsCount.mockReturnValue({
      hasPins: false,
      isBusy: false,
      hasError: true,
    } as any);

    const { result } = await renderHook(() => useHasPins());
    expect(result.current.hasError).toBe(true);
  });
});
