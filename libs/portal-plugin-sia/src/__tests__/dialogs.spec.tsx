import { describe, expect, it, vi } from "vitest";

// Mock portal-framework-ui to avoid pulling in indexedDB/BrowserLevel at import time
vi.mock("@lumeweb/portal-framework-ui", () => ({
  DialogTypes: {
    ALERT: "alert",
    CONFIRM: "confirm",
    CUSTOM: "custom",
  },
  isConfirmDialog: (config: any) =>
    config?.type === ("confirm" as string),
}));

import { disconnectAppDialogConfig } from "@/ui/dialogs/disconnectAppDialog";
import { pruneDialogConfig } from "@/ui/dialogs/pruneDialog";
import {
  DialogTypes,
  isConfirmDialog,
  type ConfirmDialogConfig,
  type DialogConfig,
} from "@lumeweb/portal-framework-ui";

function asConfirm(config: DialogConfig): ConfirmDialogConfig {
  if (isConfirmDialog(config)) return config as ConfirmDialogConfig;
  throw new Error("Expected a confirm dialog");
}

describe("disconnectAppDialogConfig", () => {
  it("returns a destructive confirm dialog with the app name in the description", () => {
    const onConfirm = () => {};
    const config = disconnectAppDialogConfig("MyApp", onConfirm);
    const confirm = asConfirm(config);

    expect(confirm.type).toBe(DialogTypes.CONFIRM);
    expect(confirm.variant).toBe("destructive");
    expect(confirm.title).toBe("Disconnect App");
    expect(confirm.confirmText).toBe("Disconnect");
    expect(confirm.onConfirm).toBe(onConfirm);
    expect(confirm.description).toContain("MyApp");
    expect(confirm.description).toContain("revoke its access");
    expect(confirm.description).toContain("cannot be undone");
  });

  it("includes the app name quoted in the description", () => {
    const config = asConfirm(disconnectAppDialogConfig("StorageApp", () => {}));

    expect(config.description).toContain('"StorageApp"');
  });

  it("preserves the onConfirm callback reference", () => {
    let called = false;
    const config = disconnectAppDialogConfig("App", () => {
      called = true;
    });
    const confirm = asConfirm(config);

    confirm.onConfirm();
    expect(called).toBe(true);
  });
});

describe("pruneDialogConfig", () => {
  it("returns a confirm dialog with cleanup messaging", () => {
    const onConfirm = () => {};
    const config = pruneDialogConfig(onConfirm);
    const confirm = asConfirm(config);

    expect(confirm.type).toBe(DialogTypes.CONFIRM);
    expect(confirm.title).toBe("Clean Up Storage");
    expect(confirm.confirmText).toBe("Clean Up");
    expect(confirm.onConfirm).toBe(onConfirm);
  });

  it("describes orphaned data removal without being destructive", () => {
    const config = asConfirm(pruneDialogConfig(() => {}));

    expect(config.description).toContain("orphaned data");
    expect(config.description).toContain("no longer referenced");
    expect(config.description).toContain("reclaim space");
    expect(config.description).toContain("does not affect");
    expect(config.variant).toBeUndefined();
  });

  it("preserves the onConfirm callback reference", () => {
    let called = false;
    const config = pruneDialogConfig(() => {
      called = true;
    });
    const confirm = asConfirm(config);

    confirm.onConfirm();
    expect(called).toBe(true);
  });
});
