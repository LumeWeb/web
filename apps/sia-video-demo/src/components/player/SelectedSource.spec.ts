import { describe, expect, it } from "vitest";
import { fromHex } from "../../lib/hex";
import { publishSuppliers } from "./PublishSuppliers";
import { sharedSuppliers } from "./SharedSuppliers";
import {
  initialSelectedSourceState,
  normalizeSelectedSource,
  type SelectedSourceDeps,
  selectedSourceReducer,
  SHARED_OBJECT_SELECTED,
} from "./SelectedSource";

const APP_KEY_HEX = "ab".repeat(32);
const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const OTHER_OBJECT_KEY =
  "ffeeddccbbaa99887766554433221100a1b2c3d4e5f60718293a4b5c6d7e8f90";
const SHARE_URL = `https://indexer.example/objects/${OBJECT_KEY}/shared#encryption_key=AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA`;
const SHARING_KEY_HEX = "cd".repeat(32);
const SOURCE_ID = "11".repeat(32);

function armedSharedSource() {
  return { objectKey: OBJECT_KEY, sourceId: SOURCE_ID };
}

function basePublishDeps(): SelectedSourceDeps {
  return {
    mode: "publish",
    publishSuppliers: publishSuppliers({
      appKeyHex: APP_KEY_HEX,
    }),
    sharedArmed: armedSharedSource(),
    sharedSuppliers: sharedSuppliers({
      sharingKeyHex: SHARING_KEY_HEX,
    }),
  };
}

function sharedModeDeps(): SelectedSourceDeps {
  return { ...basePublishDeps(), mode: "shared" };
}

describe("initialSelectedSourceState", () => {
  it("starts with no publish text and no shared object selected", () => {
    expect(initialSelectedSourceState()).toEqual({
      publish: { input: "" },
      shared: { objectKey: null },
    });
  });

  it("canonicalizes a preselected share-fragment object key", () => {
    expect(initialSelectedSourceState(OBJECT_KEY.toUpperCase())).toEqual({
      publish: { input: "" },
      shared: { objectKey: OBJECT_KEY },
    });
    expect(initialSelectedSourceState(`0x${OBJECT_KEY}`)).toEqual({
      publish: { input: "" },
      shared: { objectKey: OBJECT_KEY },
    });
  });

  it("treats a malformed preselected key as no selection", () => {
    expect(initialSelectedSourceState("not-hex")).toEqual({
      publish: { input: "" },
      shared: { objectKey: null },
    });
  });
});

describe("selectedSourceReducer", () => {
  it("records publish input without touching the shared selection", () => {
    const prev = initialSelectedSourceState(OBJECT_KEY);
    const next = selectedSourceReducer(prev, {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    expect(next.publish.input).toBe(SHARE_URL);
    expect(next.shared).toEqual(prev.shared);
  });

  it("canonicalizes a shared object selection without toggling off a matching key", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(), {
      objectKey: OBJECT_KEY.toUpperCase(),
      type: SHARED_OBJECT_SELECTED,
    });
    expect(next.shared.objectKey).toBe(OBJECT_KEY);
    const again = selectedSourceReducer(next, {
      objectKey: OBJECT_KEY,
      type: SHARED_OBJECT_SELECTED,
    });
    expect(again.shared.objectKey).toBe(OBJECT_KEY);
  });

  it("drops a malformed shared object selection instead of throwing", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      objectKey: "not-hex",
      type: SHARED_OBJECT_SELECTED,
    });
    expect(next.shared.objectKey).toBeNull();
  });

  it("toggles the shared selection on for a canonical clicked row", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(), {
      objectKey: `0x${OBJECT_KEY}`,
      type: "shared-object-toggled",
    });
    expect(next.shared.objectKey).toBe(OBJECT_KEY);
  });

  it("toggles the shared selection off when the selected row is clicked again", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      objectKey: OBJECT_KEY,
      type: "shared-object-toggled",
    });
    expect(next.shared.objectKey).toBeNull();
  });

  it("switches the shared selection to a different clicked row", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      objectKey: OTHER_OBJECT_KEY,
      type: "shared-object-toggled",
    });
    expect(next.shared.objectKey).toBe(OTHER_OBJECT_KEY);
  });

  it("ignores a malformed clicked row and keeps the current selection", () => {
    const prev = initialSelectedSourceState(OBJECT_KEY);
    expect(
      selectedSourceReducer(prev, {
        objectKey: "not-hex",
        type: "shared-object-toggled",
      }).shared.objectKey,
    ).toBe(OBJECT_KEY);
    expect(
      selectedSourceReducer(initialSelectedSourceState(), {
        objectKey: "not-hex",
        type: "shared-object-toggled",
      }).shared.objectKey,
    ).toBeNull();
  });

  it("clears the shared selection when the mode becomes publish, keeping publish text", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const next = selectedSourceReducer(prev, {
      mode: "publish",
      type: "mode-changed",
    });
    expect(next.shared.objectKey).toBeNull();
    expect(next.publish.input).toBe(SHARE_URL);
  });

  it("retains both per-mode selections when the mode becomes shared", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const next = selectedSourceReducer(prev, {
      mode: "shared",
      type: "mode-changed",
    });
    expect(next.shared).toEqual(prev.shared);
    expect(next.publish).toEqual(prev.publish);
  });

  it("cleared wipes both per-mode selections", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const next = selectedSourceReducer(prev, { type: "cleared" });
    expect(next).toEqual(initialSelectedSourceState());
  });

  it("never stores a credential seed in the selection state", () => {
    const next = selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const serialized = JSON.stringify(next);
    expect(next).not.toHaveProperty("sharingKeyHex");
    expect(next).not.toHaveProperty("seed");
    expect(serialized).not.toContain(APP_KEY_HEX);
    expect(serialized).not.toContain(SHARING_KEY_HEX);
  });
});

describe("normalizeSelectedSource", () => {
  it("is null before a publish source is armed", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(), {
      type: "cleared",
    });
    expect(normalizeSelectedSource(prev, basePublishDeps())).toBeNull();
  });

  it("lifts an armed publish source into the publish union with its supplier", () => {
    const state = selectedSourceReducer(initialSelectedSourceState(), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const selected = normalizeSelectedSource(state, basePublishDeps());
    expect(selected).not.toBeNull();
    if (selected === null || selected.mode !== "publish") return;
    expect(selected.source.objectKey).toBe(OBJECT_KEY);
    expect(selected.source.fetchForm).toBe(
      SHARE_URL.replace("https://", "sia://"),
    );
    expect(selected.supplier?.getAppKeySeed()).toEqual(fromHex(APP_KEY_HEX));
  });

  it("carries a null supplier when no app-key session is present", () => {
    const state = selectedSourceReducer(initialSelectedSourceState(), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const selected = normalizeSelectedSource(state, {
      ...basePublishDeps(),
      publishSuppliers: publishSuppliers({
        appKeyHex: null,
      }),
    });
    if (selected === null || selected.mode !== "publish") return;
    expect(selected.supplier).toBeNull();
  });

  it("is null for an invalid publish input", () => {
    const state = selectedSourceReducer(initialSelectedSourceState(), {
      input: "https://example.com/watch?v=1",
      type: "publish-input-changed",
    });
    expect(normalizeSelectedSource(state, basePublishDeps())).toBeNull();
  });

  it("lifts an armed shared source into the shared union with its supplier", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(), {
      objectKey: OBJECT_KEY,
      type: SHARED_OBJECT_SELECTED,
    });
    const selected = normalizeSelectedSource(prev, sharedModeDeps());
    expect(selected).not.toBeNull();
    if (selected === null || selected.mode !== "shared") return;
    expect(selected.source.objectKey).toBe(OBJECT_KEY);
    expect(selected.source.sourceId).toBe(SOURCE_ID);
    expect(selected.supplier?.getSharingKeySeed()).toEqual(
      fromHex(SHARING_KEY_HEX),
    );
  });

  it("is null while no shared armed source is available", () => {
    const prev = selectedSourceReducer(initialSelectedSourceState(), {
      objectKey: OBJECT_KEY,
      type: SHARED_OBJECT_SELECTED,
    });
    expect(
      normalizeSelectedSource(prev, { ...sharedModeDeps(), sharedArmed: null }),
    ).toBeNull();
  });

  it("produces the publish variant when the mode is publish, ignoring shared state", () => {
    const state = selectedSourceReducer(
      initialSelectedSourceState(OBJECT_KEY),
      { input: SHARE_URL, type: "publish-input-changed" },
    );
    const selected = normalizeSelectedSource(state, basePublishDeps());
    if (selected === null || selected.mode !== "publish") return;
    expect(selected.source.fetchForm).toContain("sia://");
  });

  it("a cleared or mode-changed selection no longer produces a source", () => {
    const prev = selectedSourceReducer(
      selectedSourceReducer(initialSelectedSourceState(OBJECT_KEY), {
        objectKey: OBJECT_KEY,
        type: SHARED_OBJECT_SELECTED,
      }),
      { mode: "publish", type: "mode-changed" },
    );
    expect(normalizeSelectedSource(prev, sharedModeDeps())).toBeNull();
  });

  it("never leaks a credential seed into the union model", () => {
    const state = selectedSourceReducer(initialSelectedSourceState(), {
      input: SHARE_URL,
      type: "publish-input-changed",
    });
    const publishSelected = normalizeSelectedSource(state, basePublishDeps());
    expect(publishSelected).not.toBeNull();
    if (publishSelected === null) return;
    expect(publishSelected).not.toHaveProperty("seed");
    expect(publishSelected).not.toHaveProperty("sharingKeyHex");
    expect(JSON.stringify(publishSelected)).not.toContain(APP_KEY_HEX);
    expect(JSON.stringify(publishSelected)).not.toContain(SHARING_KEY_HEX);
    if (publishSelected.mode === "publish") {
      // The armed source never carries a separate encryption-key field (the
      // URL fragment inside fetchForm is the share form, not a seed in state).
      expect(publishSelected.source).not.toHaveProperty("encryptionKey");
    }

    const sharedSelected = normalizeSelectedSource(
      selectedSourceReducer(initialSelectedSourceState(), {
        objectKey: OBJECT_KEY,
        type: SHARED_OBJECT_SELECTED,
      }),
      sharedModeDeps(),
    );
    expect(sharedSelected).not.toBeNull();
    if (sharedSelected === null) return;
    expect(sharedSelected).not.toHaveProperty("seed");
    expect(JSON.stringify(sharedSelected)).not.toContain(SHARING_KEY_HEX);
    expect(JSON.stringify(sharedSelected)).not.toContain(APP_KEY_HEX);
  });
});
