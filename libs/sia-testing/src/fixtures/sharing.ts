export interface KeyStats {
  createdAt: string;
  expiresAt?: string;
  objectCount: number;
  objectSize: number;
  pinnedData: number;
  pinnedSize: number;
  updatedAt: string;
}

export interface SharedObjectAttachment {
  dataSignature: string;
  encryptedDataKey: string;
  encryptedMetadata?: string;
  encryptedMetadataKey?: string;
  metadataSignature?: string;
  objectID: string;
}

export interface SharingKey extends KeyStats {
  account: string;
  description: string;
  nonce: string;
  publicKey: string;
}

export function createSharedObjectAttachment(
  overrides: Partial<SharedObjectAttachment> = {},
): SharedObjectAttachment {
  return {
    dataSignature: "Zml4dHVyZS1kYXRhLXNpZ25hdHVyZQ==",
    encryptedDataKey: "Zml4dHVyZS1kYXRhLWtleQ==",
    encryptedMetadata: "Zml4dHVyZS1tZXRhZGF0YQ==",
    encryptedMetadataKey: "Zml4dHVyZS1tZXRhZGF0YS1rZXk=",
    metadataSignature: "Zml4dHVyZS1tZXRhZGF0YS1zaWduYXR1cmU=",
    objectID: "a".repeat(64),
    ...overrides,
  };
}

export function createSharingKey(
  overrides: Partial<SharingKey> = {},
): SharingKey {
  return {
    account: "ed25519:fixture-account",
    createdAt: "2026-01-01T00:00:00.000Z",
    description: "fixture sharing key",
    nonce: "b".repeat(64),
    objectCount: 0,
    objectSize: 0,
    pinnedData: 0,
    pinnedSize: 0,
    publicKey: "ed25519:fixture-sharing-key",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
