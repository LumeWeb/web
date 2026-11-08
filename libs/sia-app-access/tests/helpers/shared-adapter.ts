/** Test-only translation to synthetic auth; existing-key phrase matching is unsupported. */
import { PhraseValidation } from "@/index";
import {
  createMockApplication,
  createMockAuth,
} from "@lumeweb/sia-testing/client";
import type {
  ApplicationPort,
  MockConnection,
  MockCredential,
} from "@lumeweb/sia-testing/client";
import type { AccessSession, SiaAccessAdapter } from "@/index";
export function sharedAdapter(
  connection: MockConnection,
  fixturePhrase: string,
  applicationConnection: MockConnection,
): SiaAccessAdapter<ApplicationPort> {
  function session(credential: MockCredential): AccessSession<ApplicationPort> {
    const value = createMockApplication(applicationConnection, credential);
    return {
      dispose() {
        void value.close();
      },
      exportAppKey: () =>
        Uint8Array.from(credential.keyHex.match(/../g)!, (byte) =>
          Number.parseInt(byte, 16),
        ),
      value,
    };
  }
  return {
    async begin(_scope, application) {
      const auth = createMockAuth(connection);
      try {
        const request = await auth.requestConnection({
          ...application,
          id: application.appId,
        });
        return {
          approvalUrl: request.responseUrl,
          dispose() {
            void auth.close();
          },
          async matchesExistingAppKey() {
            throw Error(
              "Shared synthetic auth does not model existing-key phrase matching",
            );
          },
          async register(phrase) {
            try {
              return session(await auth.register(request, phrase));
            } finally {
              await auth.close();
            }
          },
          waitForApproval: () => auth.waitForApproval(request),
        };
      } catch (error) {
        await auth.close();
        throw error;
      }
    },
    async generateRecoveryPhrase() {
      return fixturePhrase;
    },
    async reconnect(_scope, _application, bytes) {
      const auth = createMockAuth(applicationConnection);
      try {
        const key = Array.from(bytes, (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join("");
        const credential = await auth.connected(key);
        return credential ? session(credential) : null;
      } finally {
        await auth.close();
      }
    },
    async validateRecoveryPhrase(phrase) {
      return phrase === fixturePhrase
        ? PhraseValidation.Valid
        : PhraseValidation.Invalid;
    },
  };
}
