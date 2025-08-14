import { describe, expect, it, vi } from "vitest";
import { handleConfirm } from "./handleConfirm";
import type { DialogConfig } from "../Dialog.types";

describe("handleConfirm", () => {
  it("should do nothing if no dialog provided", async () => {
    const closeMock = vi.fn();
    await handleConfirm(undefined, closeMock);
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("should call onConfirm for alert/confirm dialogs", async () => {
    const onConfirmMock = vi.fn();
    const closeMock = vi.fn();
    const dialog = {
      type: "confirm",
      onConfirm: onConfirmMock,
      dismissable: true,
    } as DialogConfig;

    await handleConfirm(dialog, closeMock);
    expect(onConfirmMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  it("should not call onConfirm for other dialog types", async () => {
    const onConfirmMock = vi.fn();
    const closeMock = vi.fn();
    const dialog = {
      type: "custom",
      onConfirm: onConfirmMock,
      dismissable: true,
    } as DialogConfig;

    await handleConfirm(dialog, closeMock);
    expect(onConfirmMock).not.toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  });

  it("should not close if not dismissable and onConfirm fails", async () => {
    const onConfirmMock = vi.fn().mockRejectedValue(new Error("Failed"));
    const closeMock = vi.fn();
    const dialog = {
      type: "confirm",
      onConfirm: onConfirmMock,
      dismissable: false,
    } as DialogConfig;

    await expect(handleConfirm(dialog, closeMock)).rejects.toThrow("Failed");
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("should close if dismissable even when onConfirm fails", async () => {
    const onConfirmMock = vi.fn().mockRejectedValue(new Error("Failed"));
    const closeMock = vi.fn();
    const dialog = {
      type: "confirm",
      onConfirm: onConfirmMock,
      dismissable: true,
    } as DialogConfig;

    await handleConfirm(dialog, closeMock);
    expect(closeMock).toHaveBeenCalled();
  });
});
