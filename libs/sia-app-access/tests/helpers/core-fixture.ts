/** Controlled ports expose resource retirement and partial effects without implementing auth. */
import { createSiaAccess, PhraseValidation } from "@/index";
import type {
  AccessConnection,
  AccessSession,
  CredentialStore,
  SiaAccessAdapter,
  SiaAccessInteractions,
} from "@/index";
export interface TestSession {
  readonly id: number;
}
interface AccessFixture {
  readonly access: SiaAccessInteractions<TestSession>;
  readonly adapter: SiaAccessAdapter<TestSession>;
  readonly connection: AccessConnection<TestSession>;
  counts(): FixtureCounts;
  readonly session: AccessSession<TestSession>;
}
interface FixtureCounts {
  readonly ended: number;
  readonly registrations: number;
  readonly retired: number;
}

export const app = {
  appId: "a".repeat(64),
  description: "",
  name: "app",
  serviceUrl: "https://app/",
};
// Default inert storage lets each race test show only the boundary it controls.
export function credentialStore(
  overrides: Partial<CredentialStore>,
): CredentialStore {
  return {
    async read() {
      return null;
    },
    async remove() {
      return;
    },
    async write() {
      return;
    },
    ...overrides,
  };
}

export function fixture(store?: CredentialStore): AccessFixture {
  let ended = 0,
    registrations = 0,
    retired = 0;
  const session: AccessSession<TestSession> = {
    dispose() {
      ended++;
    },
    exportAppKey: () => new Uint8Array(32).fill(9),
    value: { id: 7 },
  };
  const connection: AccessConnection<TestSession> = {
    approvalUrl: "https://approve/",
    dispose() {
      retired++;
    },
    async matchesExistingAppKey() {
      return true;
    },
    async register() {
      registrations++;
      return session;
    },
    async waitForApproval() {
      return;
    },
  };
  const adapter: SiaAccessAdapter<TestSession> = {
    async begin() {
      return connection;
    },
    async generateRecoveryPhrase() {
      return "secret phrase";
    },
    async reconnect() {
      return session;
    },
    async validateRecoveryPhrase() {
      return PhraseValidation.Valid;
    },
  };
  const access = createSiaAccess({
    adapter,
    application: app,
    indexerUrl: "https://indexer/",
    ...(store ? { credentials: store } : {}),
  });
  return {
    access,
    adapter,
    connection,
    counts: () => ({ ended, registrations, retired }),
    session,
  };
}
