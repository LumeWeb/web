import type { PinnedSector } from "./objects.js";

export interface SlabPinParams {
  encryptionKey: string;
  minShards: number;
  sectors: PinnedSector[];
  version: number;
}

export function createSlabPinParams(
  overrides: Partial<SlabPinParams> = {},
): SlabPinParams {
  const sectors = [
    {
      hostKey: "ed25519:fixture-host",
      root: "a".repeat(64),
      uploadedAt: "2026-01-01T00:00:00.000Z",
    },
  ];
  return {
    encryptionKey: "Zml4dHVyZS1lbmNyeXB0aW9uLWtleQ==",
    minShards: 1,
    sectors: (overrides.sectors ?? sectors).map((sector) => ({ ...sector })),
    version: 0,
    ...overrides,
  };
}
