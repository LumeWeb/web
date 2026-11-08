/** Public declarations must preserve owned buffers and generic session types without DOM or Node ambient types. */
import {
  AccessOutcome,
  CredentialConfirmation,
  createMemoryCredentialStore,
} from "../../dist/index.js";
import type {
  CredentialScope,
  CredentialStore,
  MemoryCredentialStore,
  SiaAccess,
  SiaAccessAdapter,
  SubmitRecoveryPhraseResult,
} from "../../dist/index.js";

const memory: MemoryCredentialStore = createMemoryCredentialStore();
const credentials: CredentialStore = memory;
declare const scope: CredentialScope;
const read: Promise<Uint8Array | null> = credentials.read(scope);
const write: Promise<void> = credentials.write(scope, new Uint8Array(32));
void read;
void write;
// @ts-expect-error Credential scope identities are readonly.
scope.appId = "changed";

declare const access: SiaAccess<{ readonly id: string }>;
const borrowed: Promise<string> = access.withSession((session) => session.id);
void borrowed;
// @ts-expect-error The session type must not become any.
access.withSession((session) => session.unknownProperty);

declare const adapter: SiaAccessAdapter<{ readonly id: string }>;
const phrase: Promise<string> = adapter.generateRecoveryPhrase();
void phrase;

declare const result: SubmitRecoveryPhraseResult;
if (result.kind === AccessOutcome.Ready) {
  const confirmed: CredentialConfirmation.Confirmed = result.credentials;
  void confirmed;
}
