export interface ObjectEvent {
  deleted: boolean;
  key: string;
  object?: SealedObject;
  updatedAt: string;
}

export interface ObjectSlab {
  id: string;
  length: number;
  offset: number;
}

export interface PinnedSector {
  hostKey: string;
  root: string;
  uploadedAt?: string;
}

export interface PinObjectRequest {
  dataSignature: string;
  encryptedDataKey: string;
  encryptedMetadata?: string;
  encryptedMetadataKey?: string;
  id: string;
  metadataSignature?: string;
  slabs: ObjectSlab[];
}

export interface SealedObject {
  createdAt: string;
  dataSignature: string;
  encryptedDataKey: string;
  encryptedMetadata?: string;
  encryptedMetadataKey?: string;
  id: string;
  metadataSignature?: string;
  slabs: SlabSlice[];
  updatedAt: string;
}

export interface SlabSlice {
  encryptionKey: string;
  id: string;
  length: number;
  minShards: number;
  offset: number;
  sectors: PinnedSector[];
  version: number;
}

const hash = "a".repeat(64);
const timestamp = "2026-01-01T00:00:00.000Z";

export function createSealedObject(
  overrides: Partial<SealedObject> = {},
): SealedObject {
  const sectors: PinnedSector[] = [
    { hostKey: "ed25519:fixture-host", root: hash },
  ];
  const defaults: SealedObject = {
    createdAt: timestamp,
    dataSignature: "Zml4dHVyZS1kYXRhLXNpZ25hdHVyZQ==",
    encryptedDataKey: "Zml4dHVyZS1kYXRhLWtleQ==",
    encryptedMetadata: "Zml4dHVyZS1tZXRhZGF0YQ==",
    encryptedMetadataKey: "Zml4dHVyZS1tZXRhZGF0YS1rZXk=",
    id: hash,
    metadataSignature: "Zml4dHVyZS1tZXRhZGF0YS1zaWduYXR1cmU=",
    slabs: [
      {
        encryptionKey: "Zml4dHVyZS1lbmNyeXB0aW9uLWtleQ==",
        id: hash,
        length: 1,
        minShards: 1,
        offset: 0,
        sectors,
        version: 0,
      },
    ],
    updatedAt: timestamp,
  };
  return {
    ...defaults,
    ...overrides,
    slabs: (overrides.slabs ?? defaults.slabs).map((slab) => ({
      ...slab,
      sectors: slab.sectors.map((sector) => ({ ...sector })),
    })),
  };
}

/** Opaque strings are structurally valid wire data, not cryptographic evidence. */
export const sdk014FixtureOrigin =
  "@siafoundation/sia-storage 0.1.4 compatibility suite";

export function createMalformedPinObjectRequest(): PinObjectRequest {
  return { ...createPinObjectRequest(), encryptedMetadata: "%%%not-base64%%%" };
}

export function createPinObjectRequest(
  overrides: Partial<PinObjectRequest> = {},
): PinObjectRequest {
  const defaults: PinObjectRequest = {
    dataSignature: "Zml4dHVyZS1kYXRhLXNpZ25hdHVyZQ==",
    encryptedDataKey: "Zml4dHVyZS1kYXRhLWtleQ==",
    encryptedMetadata: "Zml4dHVyZS1tZXRhZGF0YQ==",
    encryptedMetadataKey: "Zml4dHVyZS1tZXRhZGF0YS1rZXk=",
    id: hash,
    metadataSignature: "Zml4dHVyZS1tZXRhZGF0YS1zaWduYXR1cmU=",
    slabs: [{ id: hash, length: 1, offset: 0 }],
  };
  return {
    ...defaults,
    ...overrides,
    slabs: (overrides.slabs ?? defaults.slabs).map((slab) => ({ ...slab })),
  };
}
