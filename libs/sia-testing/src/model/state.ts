/** Versioned model checkpoints retain events and approvals without replaying their side effects. */
import type {
  ModelAccount,
  ModelHost,
  ModelObject,
  ModelObjectEvent,
  ModelSlab,
  SharingAttachment,
  SharingKey,
} from "./index.js";

export interface ModelState {
  accounts: {
    account: ModelAccount;
    events: ModelObjectEvent[];
    objects: ModelObject[];
    slabs: string[];
  }[];
  hosts: ModelHost[];
  quotaBytes?: number;
  requestNumber: number;
  requests: {
    approved: boolean;
    expiresAt: string;
    id: string;
    publicKey: string;
  }[];
  sharing: {
    attachments: SharingAttachment[];
    key: SharingKey;
    owner: string;
    revoked: boolean;
  }[];
  slabs: ModelSlab[];
  version: 1;
}

/** Validation rejects identities and slab references that would change ownership when maps are rebuilt. */
export function readModelState(serialized: string): ModelState {
  try {
    const input: unknown = JSON.parse(serialized);
    const state = object(input);
    if (state.version !== 1) throw new Error("unsupported snapshot version");
    integer(state.requestNumber);
    if (state.quotaBytes !== undefined) integer(state.quotaBytes);
    const accounts = array(state.accounts);
    const accountIds = unique(
      accounts.map((entry) => {
        const row = object(entry);
        const account = object(row.account);
        strings(account, ["id", "publicKey"]);
        if (account.id !== account.publicKey) invalid();
        unique(
          array(row.objects).map((value) => {
            checkObject(value);
            return object(value).id;
          }),
        );
        unique(array(row.slabs));
        for (const id of array(row.slabs)) text(id);
        for (const value of array(row.events)) {
          const event = object(value);
          strings(event, ["key", "updatedAt"]);
          date(event.updatedAt);
          bool(event.deleted);
          if (event.object !== undefined) {
            checkObject(event.object);
            if (object(event.object).id !== event.key) invalid();
          }
        }
        return account.id;
      }),
    );
    const slabs = array(state.slabs);
    const slabIds = unique(
      slabs.map((value) => {
        const slab = object(value);
        text(slab.id);
        integer(slab.size);
        return slab.id;
      }),
    );
    for (const entry of accounts) {
      for (const id of array(object(entry).slabs)) {
        if (!slabIds.has(id)) invalid();
      }
    }
    unique(
      array(state.requests).map((value) => {
        const request = object(value);
        strings(request, ["id", "publicKey", "expiresAt"]);
        bool(request.approved);
        date(request.expiresAt);
        const match = /^request-([1-9]\d*)$/.exec(request.id as string);
        if (!match || Number(match[1]) > (state.requestNumber as number))
          invalid();
        return request.id;
      }),
    );
    unique(
      array(state.sharing).map((value) => {
        const share = object(value);
        text(share.owner);
        bool(share.revoked);
        const key = object(share.key);
        strings(key, [
          "account",
          "createdAt",
          "description",
          "nonce",
          "publicKey",
          "updatedAt",
        ]);
        date(key.createdAt);
        date(key.updatedAt);
        if (key.expiresAt !== undefined) date(key.expiresAt);
        for (const field of [
          "objectCount",
          "objectSize",
          "pinnedData",
          "pinnedSize",
        ])
          integer(key[field]);
        if (!accountIds.has(share.owner) || key.account !== share.owner)
          invalid();
        const attachments = array(share.attachments);
        unique(
          attachments.map((item) => {
            const attachment = object(item);
            strings(attachment, [
              "dataSignature",
              "encryptedDataKey",
              "objectID",
            ]);
            strings(
              attachment,
              [
                "encryptedMetadata",
                "encryptedMetadataKey",
                "metadataSignature",
              ],
              true,
            );
            return attachment.objectID;
          }),
        );
        if (key.objectCount !== attachments.length) invalid();
        return key.publicKey;
      }),
    );
    for (const value of array(state.hosts)) {
      const host = object(value);
      text(host.publicKey);
      for (const address of array(host.addresses)) text(address);
      strings(host, ["countryCode"], true);
      if (host.goodForUpload !== undefined) bool(host.goodForUpload);
      for (const field of ["latitude", "longitude"]) {
        if (
          host[field] !== undefined &&
          (typeof host[field] !== "number" || !Number.isFinite(host[field]))
        )
          invalid();
      }
    }
    return state as unknown as ModelState;
  } catch (cause) {
    throw new Error("invalid model snapshot", { cause });
  }
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) invalid();
  return value;
}

function bool(value: unknown): void {
  if (typeof value !== "boolean") invalid();
}

function checkObject(value: unknown): void {
  const row = object(value);
  text(row.id);
  strings(
    row,
    [
      "dataSignature",
      "encryptedDataKey",
      "encryptedMetadata",
      "encryptedMetadataKey",
      "metadataSignature",
    ],
    true,
  );
  if (row.slabs !== undefined) for (const id of array(row.slabs)) text(id);
}

function date(value: unknown): void {
  text(value);
  if (!Number.isFinite(Date.parse(value as string))) invalid();
}

function integer(value: unknown): void {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    invalid();
}

function invalid(): never {
  throw new Error("invalid snapshot record");
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

function strings(
  value: Record<string, unknown>,
  keys: string[],
  optional = false,
): void {
  for (const key of keys)
    if (!optional || value[key] !== undefined) text(value[key]);
}

function text(value: unknown): void {
  if (typeof value !== "string") invalid();
}

function unique(values: unknown[]): Set<unknown> {
  const set = new Set(values);
  if (set.size !== values.length) invalid();
  return set;
}
