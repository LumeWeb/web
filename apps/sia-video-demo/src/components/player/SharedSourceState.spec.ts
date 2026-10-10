import { describe, expect, it } from "vitest";
import { sharedSourceState } from "./SharedSourceState";

const SHARING_KEY_HEX = "cd".repeat(32);
const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const OTHER_KEY =
  "ffeeddccbbaa99887766554433221100a1b2c3d4e5f60718293a4b5c6d7e8f90";

describe("sharedSourceState", () => {
  it("arms a selected shared source identity from sharing-key presence + object key", async () => {
    const state = await sharedSourceState(SHARING_KEY_HEX, OBJECT_KEY);
    expect(state.status).toBe("armed");
    if (state.status !== "armed") return;
    expect(state.source.objectKey).toBe(OBJECT_KEY);
    expect(state.source.sourceId).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is unarmed with no sharing key even when an object key is selected", async () => {
    for (const seed of [null, undefined, ""]) {
      const state = await sharedSourceState(seed, OBJECT_KEY);
      expect(state.status).toBe("unarmed");
      if (state.status !== "unarmed") continue;
      expect(state.source).toBeNull();
    }
  });

  it("is unarmed with no selected object key", async () => {
    for (const key of [null, undefined, "", "   "]) {
      const state = await sharedSourceState(SHARING_KEY_HEX, key);
      expect(state.status).toBe("unarmed");
    }
  });

  it("is unarmed for a malformed object key", async () => {
    const state = await sharedSourceState(SHARING_KEY_HEX, "nope");
    expect(state.status).toBe("unarmed");
  });

  it("is unarmed for a malformed sharing key seed", async () => {
    const state = await sharedSourceState("not-hex", OBJECT_KEY);
    expect(state.status).toBe("unarmed");
  });

  it("derives a stable identity deterministically for the same inputs", async () => {
    const a = await sharedSourceState(SHARING_KEY_HEX, OBJECT_KEY);
    const b = await sharedSourceState(SHARING_KEY_HEX, OBJECT_KEY);
    expect(a.status).toBe("armed");
    expect(b.status).toBe("armed");
    if (a.status !== "armed" || b.status !== "armed") return;
    expect(a.source.sourceId).toBe(b.source.sourceId);
  });

  it("produces a different identity for a different object key", async () => {
    const a = await sharedSourceState(SHARING_KEY_HEX, OBJECT_KEY);
    const b = await sharedSourceState(SHARING_KEY_HEX, OTHER_KEY);
    expect(a.status).toBe("armed");
    expect(b.status).toBe("armed");
    if (a.status !== "armed" || b.status !== "armed") return;
    expect(a.source.sourceId).not.toBe(b.source.sourceId);
  });

  it("never leaks the sharing seed into the source identity or state", async () => {
    const state = await sharedSourceState(SHARING_KEY_HEX, OBJECT_KEY);
    expect(state.status).toBe("armed");
    if (state.status !== "armed") return;
    expect(state.source.sourceId).not.toContain(SHARING_KEY_HEX);
    expect(state.source.sourceId).not.toBe(SHARING_KEY_HEX);
    expect(state).not.toHaveProperty("seed");
    expect(JSON.stringify(state)).not.toContain(SHARING_KEY_HEX);
  });
});
