import assert from "node:assert/strict";
import { test } from "node:test";
import { Facade, sdkEnvironment } from "./environment.ts";
import { PhraseValidation } from "@/index";

// SDK initialization and module caches are irreversible; this named case owns a fresh test process.
void test(
  "Node facade selection uses actual WASM utilities",
  { timeout: 30000 },
  async (t) => {
    const environment = sdkEnvironment(t, { facade: Facade.Node });
    const wasm = await import("@siafoundation/sia-storage/wasm");
    const { createSiaAdapter } = await import("@/sia");
    const adapter = createSiaAdapter();
    const phrase = await adapter.generateRecoveryPhrase();
    assert.equal(
      await adapter.validateRecoveryPhrase(phrase),
      PhraseValidation.Valid,
    );
    const survivor = new wasm.AppKey(new Uint8Array(32).fill(9));
    t.after(() => survivor.free());
    const publicKey = survivor.publicKey();
    await Promise.all(
      Array.from({ length: 8 }, () => adapter.generateRecoveryPhrase()),
    );
    assert.equal(survivor.publicKey(), publicKey);
    assert.deepEqual(survivor.export(), new Uint8Array(32).fill(9));
    const message = new Uint8Array([1, 2, 3]);
    assert.equal(
      survivor.verifySignature(message, survivor.sign(message)),
      true,
    );
    assert.equal(
      await adapter.validateRecoveryPhrase("invalid"),
      PhraseValidation.Invalid,
    );
    assert.equal(environment.loads, 1);
  },
);
