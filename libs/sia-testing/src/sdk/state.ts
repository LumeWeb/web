/** Payload checkpoints pair owned bytes with a full model checkpoint; fault controls remain session-local. */
import { createIndexdModel, type IndexdModel } from "../model/index.js";

export interface PayloadRecord {
  bytes: Uint8Array;
  slabId: string;
}

export type PayloadStore = Map<string, Map<string, PayloadRecord>>;

interface NetworkState {
  model: string;
  payloads: { accountId: string; data: string; id: string }[];
  version: 1;
}

export function payloadSlabId(accountId: string, id: string): string {
  return `mock:${JSON.stringify([accountId, id])}`;
}

/** The restored model validates slab ownership before any saved payload becomes visible. */
export function readNetworkState(
  serialized: string,
  now?: () => Date,
): { model: IndexdModel; payloads: PayloadStore } {
  try {
    const input: unknown = JSON.parse(serialized);
    const state = input as null | Partial<NetworkState>;
    if (
      !state ||
      state.version !== 1 ||
      typeof state.model !== "string" ||
      !Array.isArray(state.payloads)
    )
      throw new Error("invalid snapshot structure");
    const model = createIndexdModel({
      ...(now ? { now } : {}),
      state: state.model,
    });
    const payloads: PayloadStore = new Map();
    for (const entry of state.payloads) {
      if (
        !entry ||
        typeof entry.accountId !== "string" ||
        typeof entry.id !== "string" ||
        !entry.id ||
        typeof entry.data !== "string"
      )
        throw new Error("invalid snapshot payload");
      const binary = atob(entry.data);
      if (btoa(binary) !== entry.data)
        throw new Error("invalid snapshot encoding");
      const bytes = Uint8Array.from(binary, (character) =>
        character.charCodeAt(0),
      );
      const slabId = payloadSlabId(entry.accountId, entry.id);
      if (model.getSlab(entry.accountId, slabId).size !== bytes.byteLength)
        throw new Error("snapshot payload size does not match its slab");
      let owned = payloads.get(entry.accountId);
      if (!owned) {
        owned = new Map();
        payloads.set(entry.accountId, owned);
      }
      if (owned.has(entry.id)) throw new Error("duplicate snapshot payload");
      owned.set(entry.id, { bytes, slabId });
    }
    return { model, payloads };
  } catch (cause) {
    throw new Error("invalid mock network snapshot", { cause });
  }
}

/** Externally pruned slabs and reset accounts must not revive stale payloads on restart. */
export function serializeNetworkState(
  model: IndexdModel,
  payloads: PayloadStore,
): string {
  const saved: NetworkState = {
    model: model.serialize(),
    payloads: [],
    version: 1,
  };
  for (const account of model.snapshot().accounts) {
    const pinned = new Map(
      model.listSlabs(account.id).map((slab) => [slab.id, slab.size]),
    );
    for (const [id, payload] of payloads.get(account.id) ?? []) {
      if (pinned.get(payload.slabId) !== payload.bytes.byteLength) continue;
      // Spreading a large byte array into fromCharCode would exceed the engine's argument limit.
      let binary = "";
      for (const byte of payload.bytes) binary += String.fromCharCode(byte);
      saved.payloads.push({ accountId: account.id, data: btoa(binary), id });
    }
  }
  return JSON.stringify(saved);
}
