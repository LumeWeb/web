/** SDK session types retain application operations while disposal stays with access. */
import { createSiaAccess } from "../../dist/index.js";
import type { SiaAccessAdapter } from "../../dist/index.js";
import {
  createSiaAccess as createSiaSdkAccess,
  createSiaAdapter,
} from "../../dist/sia.js";
import type { SiaSession } from "../../dist/sia.js";

export const adapter: SiaAccessAdapter<SiaSession> = createSiaAdapter();
export const access = createSiaAccess({
  adapter,
  application: {
    appId: "a".repeat(64),
    description: "",
    name: "SDK caller",
    serviceUrl: "https://app.example/",
  },
  indexerUrl: "https://indexer.example/",
});
export const defaultAccess = createSiaSdkAccess({
  application: {
    appId: "a".repeat(64),
    description: "",
    name: "SDK caller",
    serviceUrl: "https://app.example/",
  },
  indexerUrl: "https://indexer.example/",
});
export const defaultPublicKey: Promise<string> = defaultAccess.withSession(
  (session) => {
    const key = session.appKey();
    try {
      return key.publicKey();
    } finally {
      key.free();
    }
  },
);

export const publicKey: Promise<string> = access.withSession((session) => {
  const key = session.appKey();
  try {
    return key.publicKey();
  } finally {
    key.free();
  }
});
export function checkDisposal(session: SiaSession): void {
  // @ts-expect-error Session disposal belongs to the access controller.
  session.free();
  // @ts-expect-error Symbol disposal must not bypass session borrowing.
  session[Symbol.dispose]();
}
