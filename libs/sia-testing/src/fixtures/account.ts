export interface Account {
  accountKey: string;
  app: AppMetadata;
  lastUsed: string;
  maxPinnedData: number;
  pinnedData: number;
  pinnedSize: number;
  ready: boolean;
  remainingStorage: number;
}

export interface AppMetadata {
  description: string;
  id: string;
  logoURL?: string;
  name: string;
  serviceURL?: string;
}

export function createAccount(overrides: Partial<Account> = {}): Account {
  const app: AppMetadata = {
    description: "fixture app",
    id: "a".repeat(64),
    name: "fixture app",
    serviceURL: "https://example.test",
  };
  return {
    accountKey: "ed25519:fixture-account",
    app: { ...app, ...overrides.app },
    lastUsed: "2026-01-01T00:00:00.000Z",
    maxPinnedData: 10_000,
    pinnedData: 0,
    pinnedSize: 0,
    ready: true,
    remainingStorage: 10_000,
    ...overrides,
  };
}
