/** In-memory Indexd control-plane state for deterministic SDK fixtures. */
import { type ModelState, readModelState } from "./state.js";

export interface ConnectionRequest {
  expiresAt: Date;
  id: string;
}

/** Public connection metadata; secret approval credentials are not retained. */
export interface ConnectionRequestStatus {
  approved: boolean;
  expiresAt: Date;
  publicKey: string;
}

export interface HostFilter {
  countryCode?: string;
  goodForUpload?: boolean;
  publicKey?: string;
}

export interface IndexdModel {
  accountStats(accountId: string): { objectCount: number; pinnedSize: number };
  approveConnection(id: string, connectKey: string): void;
  attachSharedObject(
    ownerId: string,
    publicKey: string,
    attachment: SharingAttachment,
  ): void;
  caller(publicKey: string): ModelAccount | undefined;
  connectionRequest(id: string): ConnectionRequestStatus | undefined;
  createAccount(input: { publicKey: string }): ModelAccount;
  createSharingKey(
    ownerId: string,
    input: {
      description?: string;
      expiresAt?: string;
      nonce: string;
      publicKey: string;
    },
  ): SharingKey;
  deleteObject(accountId: string, objectId: string): void;
  detachSharedObject(
    ownerId: string,
    publicKey: string,
    objectID: string,
  ): void;
  getSharingKey(ownerId: string, publicKey: string): SharingKey;
  getSlab(accountId: string, slabId: string): ModelSlab;
  hosts(accountId: string, filter?: HostFilter): ModelHost[];
  listRecipientObjects(
    recipientId: string,
    publicKey: string,
  ): SharingAttachment[];
  listSharedObjects(ownerId: string, publicKey: string): SharingAttachment[];
  listSharingKeys(ownerId: string): SharingKey[];
  listSlabs(accountId: string): ModelSlab[];
  object(accountId: string, objectId: string): ModelObject | undefined;
  objectEvents(accountId: string): ModelObjectEvent[];
  pinObject(
    accountId: string,
    object: Omit<ModelObject, "slabs"> & { slabs: string[] },
  ): void;
  pinSlab(accountId: string, slab: ModelSlab): void;
  pruneSlabs(accountId: string): string[];
  registerConnection(id: string, appKey: string): ModelAccount;
  requestConnection(input: {
    appId: string;
    publicKey: string;
  }): ConnectionRequest;
  reset(): void;
  revokeSharingKey(ownerId: string, publicKey: string): void;
  seedObject(accountId: string, object: ModelObject): void;
  serialize(): string;
  sharedObject(
    recipientId: string,
    publicKey: string,
    objectID: string,
  ): SharingAttachment;
  sharedStats(
    recipientId: string,
    publicKey: string,
  ): Pick<
    SharingKey,
    | "createdAt"
    | "objectCount"
    | "objectSize"
    | "pinnedData"
    | "pinnedSize"
    | "updatedAt"
  >;
  snapshot(): { accounts: ModelAccount[] };
  unpinSlab(accountId: string, slabId: string): void;
  validateSignedShareUrl(url: string): {
    expiresAt: number;
    objectID: string;
    publicKey: string;
  };
}

export interface IndexdModelOptions {
  hosts?: ModelHost[];
  now?: () => Date;
  /** Maximum unique pinned bytes per account. Omit for an unlimited account. */
  quotaBytes?: number;
  /** Full checkpoint; snapshot() remains a detached account summary. */
  state?: string;
}

export interface ModelAccount {
  id: string;
  publicKey: string;
}

export interface ModelHost {
  addresses: string[];
  countryCode?: string;
  goodForUpload?: boolean;
  latitude?: number;
  longitude?: number;
  publicKey: string;
}

export interface ModelObject {
  dataSignature?: string;
  encryptedDataKey?: string;
  encryptedMetadata?: string;
  encryptedMetadataKey?: string;
  id: string;
  metadataSignature?: string;
  slabs?: string[];
}

export interface ModelObjectEvent {
  deleted: boolean;
  key: string;
  object?: ModelObject;
  updatedAt: string;
}

export interface ModelSlab {
  id: string;
  size: number;
}

export interface SharingAttachment {
  dataSignature: string;
  encryptedDataKey: string;
  encryptedMetadata?: string;
  encryptedMetadataKey?: string;
  metadataSignature?: string;
  objectID: string;
}

export interface SharingKey {
  account: string;
  createdAt: string;
  description: string;
  expiresAt?: string;
  nonce: string;
  objectCount: number;
  objectSize: number;
  pinnedData: number;
  pinnedSize: number;
  publicKey: string;
  updatedAt: string;
}

export type SharingKeyRecord = SharingAttachment;

interface SharingRecord {
  attachments: Map<string, SharingAttachment>;
  key: SharingKey;
  owner: string;
  revoked: boolean;
}

/** Models Indexd account ownership without treating opaque wire values as verified crypto. */
export function createIndexdModel(
  options: IndexdModelOptions = {},
): IndexdModel {
  if (
    options.state !== undefined &&
    (options.hosts !== undefined || options.quotaBytes !== undefined)
  )
    throw new Error("snapshot owns host and quota settings");
  const saved =
    options.state === undefined ? undefined : readModelState(options.state);
  const now = options.now ?? (() => new Date());
  const accounts = new Map<string, ModelAccount>(
    saved?.accounts.map((row) => [row.account.id, row.account]),
  );
  const requests = new Map<string, ConnectionRequestStatus>(
    saved?.requests.map((row) => [
      row.id,
      {
        approved: row.approved,
        expiresAt: new Date(row.expiresAt),
        publicKey: row.publicKey,
      },
    ]),
  );
  let requestNumber = saved?.requestNumber ?? 0;
  const objects = new Map<string, Map<string, ModelObject>>(
    saved?.accounts.map((row) => [
      row.account.id,
      new Map(row.objects.map((object) => [object.id, object])),
    ]),
  );
  const slabs = new Map<string, ModelSlab>(
    saved?.slabs.map((slab) => [slab.id, slab]),
  );
  const accountSlabs = new Map<string, Set<string>>(
    saved?.accounts.map((row) => [row.account.id, new Set(row.slabs)]),
  );
  const events = new Map<string, ModelObjectEvent[]>(
    saved?.accounts.map((row) => [row.account.id, row.events]),
  );
  const sharing = new Map<string, SharingRecord>(
    saved?.sharing.map((row) => [
      row.key.publicKey,
      {
        attachments: new Map(
          row.attachments.map((attachment) => [
            attachment.objectID,
            attachment,
          ]),
        ),
        key: row.key,
        owner: row.owner,
        revoked: row.revoked,
      },
    ]),
  );
  const hostList = (saved?.hosts ?? options.hosts ?? []).map(copyHost);
  const quotaBytes = saved?.quotaBytes ?? options.quotaBytes;

  function requireAccount(id: string): void {
    if (!accounts.has(id)) throw new Error(`unknown account ${id}`);
  }

  function createAccount({ publicKey }: { publicKey: string }): ModelAccount {
    if (accounts.has(publicKey))
      throw new Error(`account ${publicKey} already exists`);
    const account = { id: publicKey, publicKey };
    accounts.set(account.id, account);
    objects.set(account.id, new Map());
    accountSlabs.set(account.id, new Set());
    events.set(account.id, []);
    return { ...account };
  }

  function ownedShare(ownerId: string, publicKey: string): SharingRecord {
    const record = sharing.get(publicKey);
    if (!record || record.owner !== ownerId)
      throw new Error("sharing key not found");
    return record;
  }

  function activeShare(publicKey: string): SharingRecord {
    const record =
      sharing.get(publicKey) ??
      [...sharing.values()].find((item) =>
        recipientMatches(item.key.publicKey, publicKey),
      );
    if (!record || record.revoked || expired(record.key.expiresAt, now()))
      throw new Error("sharing key unavailable");
    return record;
  }

  function recipientShare(
    recipientId: string,
    publicKey: string,
  ): SharingRecord {
    const record = activeShare(publicKey);
    if (
      recipientId !== publicKey &&
      !recipientMatches(record.key.publicKey, recipientId)
    )
      throw new Error("sharing key unavailable");
    return record;
  }

  function slabBytes(ids: Iterable<string>): number {
    let size = 0;
    for (const id of ids) size += slabs.get(id)?.size ?? 0;
    return size;
  }

  return {
    accountStats(accountId) {
      requireAccount(accountId);
      const records = objects.get(accountId)!;
      const ids = new Set<string>();
      for (const object of records.values())
        for (const slab of object.slabs ?? []) ids.add(slab);
      return { objectCount: records.size, pinnedSize: slabBytes(ids) };
    },
    approveConnection(id, _connectKey) {
      const request = requests.get(id);
      if (!request) throw new Error(`unknown request ${id}`);
      if (now() > request.expiresAt) throw new Error(`request ${id} expired`);
      request.approved = true;
    },
    attachSharedObject(ownerId, publicKey, attachment) {
      const record = activeShare(publicKey);
      if (record.owner !== ownerId) throw new Error("sharing key unavailable");
      if (!objects.get(ownerId)!.has(attachment.objectID))
        throw new Error(`object ${attachment.objectID} not found`);
      // The SDK signs a recipient-specific seal. Returning the owner's fields
      // makes SharedSdk reject it, so retain every supplied attachment field.
      record.attachments.set(attachment.objectID, { ...attachment });
      record.key.objectCount = record.attachments.size;
      record.key.updatedAt = now().toISOString();
    },
    caller(publicKey) {
      const account = accounts.get(publicKey);
      return account && { ...account };
    },
    connectionRequest(id) {
      const request = requests.get(id);
      if (!request) return undefined;
      if (now() > request.expiresAt) throw new Error(`request ${id} expired`);
      return { ...request, expiresAt: new Date(request.expiresAt) };
    },
    createAccount,
    createSharingKey(ownerId, input) {
      requireAccount(ownerId);
      if (sharing.has(input.publicKey))
        throw new Error(`sharing key ${input.publicKey} already exists`);
      const stamp = now().toISOString();
      const key: SharingKey = {
        account: ownerId,
        createdAt: stamp,
        description: input.description ?? "",
        nonce: input.nonce,
        objectCount: 0,
        objectSize: 0,
        pinnedData: 0,
        pinnedSize: 0,
        publicKey: input.publicKey,
        updatedAt: stamp,
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      };
      sharing.set(input.publicKey, {
        attachments: new Map(),
        key,
        owner: ownerId,
        revoked: false,
      });
      return { ...key };
    },
    deleteObject(accountId, objectId) {
      requireAccount(accountId);
      if (!objects.get(accountId)!.delete(objectId))
        throw new Error(`object ${objectId} not found`);
      events
        .get(accountId)!
        .push({ deleted: true, key: objectId, updatedAt: now().toISOString() });
    },
    detachSharedObject(ownerId, publicKey, objectID) {
      const record = ownedShare(ownerId, publicKey);
      record.attachments.delete(objectID);
      record.key.objectCount = record.attachments.size;
      record.key.updatedAt = now().toISOString();
    },
    getSharingKey(ownerId, publicKey) {
      return { ...ownedShare(ownerId, publicKey).key };
    },
    getSlab(accountId, slabId) {
      requireAccount(accountId);
      if (!accountSlabs.get(accountId)!.has(slabId) || !slabs.has(slabId))
        throw new Error(`slab ${slabId} not found`);
      return { ...slabs.get(slabId)! };
    },
    hosts(accountId, filter = {}) {
      requireAccount(accountId);
      return hostList
        .filter(
          (host) =>
            (!filter.countryCode || host.countryCode === filter.countryCode) &&
            (filter.goodForUpload === undefined ||
              host.goodForUpload === filter.goodForUpload) &&
            (!filter.publicKey || host.publicKey === filter.publicKey),
        )
        .map(copyHost);
    },
    listRecipientObjects(recipientId, publicKey) {
      const record = recipientShare(recipientId, publicKey);
      return [...record.attachments.values()].map((item) => ({ ...item }));
    },
    listSharedObjects(ownerId, publicKey) {
      const record = activeShare(publicKey);
      if (ownerId !== record.owner) throw new Error("sharing key unavailable");
      return [...record.attachments.values()].map((item) => ({ ...item }));
    },
    listSharingKeys(ownerId) {
      requireAccount(ownerId);
      return [...sharing.values()]
        .filter((record) => record.owner === ownerId && !record.revoked)
        .map((record) => ({ ...record.key }));
    },
    listSlabs(accountId) {
      requireAccount(accountId);
      return [...accountSlabs.get(accountId)!]
        .filter((id) => slabs.has(id))
        .map((id) => ({ ...slabs.get(id)! }));
    },
    object(accountId, objectId) {
      const object = objects.get(accountId)?.get(objectId);
      return object && copyObject(object);
    },
    objectEvents(accountId) {
      requireAccount(accountId);
      return events.get(accountId)!.map((event) => ({
        ...event,
        ...(event.object ? { object: copyObject(event.object) } : {}),
      }));
    },
    pinObject(accountId, object) {
      requireAccount(accountId);
      if (
        object.encryptedMetadata &&
        decodedBase64Length(object.encryptedMetadata) > 1024
      ) {
        throw new Error("object metadata size limit (1024) exceeded");
      }
      for (const slabId of object.slabs) {
        if (!accountSlabs.get(accountId)!.has(slabId))
          throw new Error(`unpinned slab ${slabId}`);
      }
      const referenced = new Set<string>();
      for (const item of objects.get(accountId)!.values()) {
        if (item.id !== object.id)
          for (const id of item.slabs ?? []) referenced.add(id);
      }
      for (const id of object.slabs) referenced.add(id);
      const nextSize = slabBytes(referenced);
      if (quotaBytes !== undefined && nextSize > quotaBytes)
        throw new Error("account quota exceeded");
      // Repinning metadata must not discard the sealed fields from the prior
      // pin. This also keeps each account's wire record independent.
      const prior = objects.get(accountId)!.get(object.id);
      const stored: ModelObject = {
        ...prior,
        id: object.id,
        slabs: [...object.slabs],
      };
      for (const field of [
        "encryptedMetadata",
        "encryptedDataKey",
        "dataSignature",
        "encryptedMetadataKey",
        "metadataSignature",
      ] as const) {
        const value = object[field];
        if (value !== undefined) stored[field] = value;
      }
      objects.get(accountId)!.set(object.id, stored);
      events.get(accountId)!.push({
        deleted: false,
        key: object.id,
        object: copyObject(stored),
        updatedAt: now().toISOString(),
      });
    },
    pinSlab(accountId, slab) {
      requireAccount(accountId);
      const prior = slabs.get(slab.id);
      if (prior && prior.size !== slab.size)
        throw new Error(`conflicting slab ${slab.id}`);
      slabs.set(slab.id, { ...slab });
      accountSlabs.get(accountId)!.add(slab.id);
    },
    pruneSlabs(accountId) {
      requireAccount(accountId);
      const removed: string[] = [];
      for (const slabId of [...accountSlabs.get(accountId)!]) {
        if (
          ![...objects.get(accountId)!.values()].some((object) =>
            object.slabs?.includes(slabId),
          )
        ) {
          accountSlabs.get(accountId)!.delete(slabId);
          removed.push(slabId);
          if (![...accountSlabs.values()].some((set) => set.has(slabId)))
            slabs.delete(slabId);
        }
      }
      return removed;
    },
    registerConnection(id, appKey) {
      const request = requests.get(id);
      if (!request) throw new Error(`unknown request ${id}`);
      if (now() > request.expiresAt) throw new Error(`request ${id} expired`);
      if (!request.approved) throw new Error(`request ${id} is not approved`);
      const account = createAccount({ publicKey: appKey });
      requests.delete(id);
      return account;
    },
    requestConnection({ appId: _appId, publicKey }) {
      const id = `request-${++requestNumber}`;
      const expiresAt = new Date(now().getTime() + 10 * 60 * 1000);
      requests.set(id, { approved: false, expiresAt, publicKey });
      return { expiresAt: new Date(expiresAt), id };
    },
    reset() {
      accounts.clear();
      objects.clear();
      slabs.clear();
      accountSlabs.clear();
      events.clear();
      requests.clear();
      sharing.clear();
      requestNumber = 0;
    },
    revokeSharingKey(ownerId, publicKey) {
      const record = ownedShare(ownerId, publicKey);
      record.revoked = true;
      record.key.updatedAt = now().toISOString();
    },
    seedObject(accountId, object) {
      requireAccount(accountId);
      objects.get(accountId)!.set(object.id, copyObject(object));
    },
    serialize() {
      const state: ModelState = {
        accounts: [...accounts.values()].map((account) => ({
          account,
          events: events.get(account.id)!,
          objects: [...objects.get(account.id)!.values()],
          slabs: [...accountSlabs.get(account.id)!],
        })),
        hosts: hostList,
        ...(quotaBytes === undefined ? {} : { quotaBytes }),
        requestNumber,
        requests: [...requests.entries()].map(([id, request]) => ({
          ...request,
          expiresAt: request.expiresAt.toISOString(),
          id,
        })),
        sharing: [...sharing.values()].map((record) => ({
          attachments: [...record.attachments.values()],
          key: record.key,
          owner: record.owner,
          revoked: record.revoked,
        })),
        slabs: [...slabs.values()],
        version: 1,
      };
      const serialized = JSON.stringify(state);
      // JSON converts nonfinite numbers to null; reject them before a caller replaces a checkpoint file.
      readModelState(serialized);
      return serialized;
    },
    sharedObject(recipientId, publicKey, objectID) {
      const record = recipientShare(recipientId, publicKey);
      const attachment = record.attachments.get(objectID);
      if (!attachment) throw new Error(`object ${objectID} not shared`);
      return { ...attachment };
    },
    sharedStats(recipientId, publicKey) {
      const record = recipientShare(recipientId, publicKey);
      let objectSize = 0;
      for (const attachment of record.attachments.values()) {
        objectSize += slabBytes(
          objects.get(record.owner)!.get(attachment.objectID)?.slabs ?? [],
        );
      }
      return {
        createdAt: record.key.createdAt,
        objectCount: record.attachments.size,
        objectSize,
        pinnedData: 0,
        pinnedSize: 0,
        updatedAt: record.key.updatedAt,
      };
    },
    snapshot() {
      return {
        accounts: [...accounts.values()].map((account) => ({ ...account })),
      };
    },
    unpinSlab(accountId, slabId) {
      requireAccount(accountId);
      if (!accountSlabs.get(accountId)!.has(slabId))
        throw new Error(`slab ${slabId} not found`);
      for (const object of objects.get(accountId)!.values())
        if (object.slabs?.includes(slabId))
          throw new Error(`slab ${slabId} is still referenced`);
      accountSlabs.get(accountId)!.delete(slabId);
      if (![...accountSlabs.values()].some((set) => set.has(slabId)))
        slabs.delete(slabId);
    },
    validateSignedShareUrl(rawUrl) {
      const url = new URL(rawUrl);
      if (url.hash) throw new Error("share URL fragments are not accepted");
      const sc = url.searchParams.get("sc");
      const ss = url.searchParams.get("ss");
      const sv = url.searchParams.get("sv");
      if (
        !sc ||
        !ss ||
        !sv ||
        !/^[A-Za-z0-9_-]+$/.test(sc) ||
        !/^[A-Za-z0-9_-]+$/.test(ss)
      )
        throw new Error("invalid signed share URL");
      const expiresAt = Number(sv);
      if (
        !Number.isSafeInteger(expiresAt) ||
        expiresAt < Math.floor(now().getTime() / 1000)
      )
        throw new Error("share URL expired");
      const match = /\/objects\/([^/]+)\/shared$/.exec(url.pathname);
      if (!match?.[1]) throw new Error("invalid share URL path");
      return { expiresAt, objectID: match[1], publicKey: sc };
    },
  };
}

function copyHost(host: ModelHost): ModelHost {
  return { ...host, addresses: [...host.addresses] };
}

/** Detached slab arrays prevent callers from bypassing pin validation through snapshots. */
function copyObject(object: ModelObject): ModelObject {
  return { ...object, ...(object.slabs ? { slabs: [...object.slabs] } : {}) };
}

function decodedBase64Length(value: string): number {
  try {
    return atob(value).length;
  } catch {
    throw new Error("invalid encrypted metadata encoding");
  }
}

function expired(value: string | undefined, now: Date): boolean {
  return value !== undefined && Date.parse(value) <= now.getTime();
}

function recipientMatches(publicKey: string, recipient: string): boolean {
  const normalizedPublic = publicKey
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const normalizedRecipient = recipient
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return (
    recipient === publicKey ||
    wirePublicKeyMatches(publicKey, recipient) ||
    normalizedPublic === normalizedRecipient
  );
}

function wirePublicKeyMatches(publicKey: string, wireKey: string): boolean {
  const encoded =
    wireKey.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (wireKey.length % 4)) % 4);
  try {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const hex = [...bytes]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const base64 = btoa(String.fromCharCode(...bytes));
    return (
      publicKey.endsWith(`:${hex}`) ||
      publicKey.endsWith(`:${base64}`) ||
      publicKey.endsWith(`:${base64.replace(/=+$/, "")}`)
    );
  } catch {
    return false;
  }
}
