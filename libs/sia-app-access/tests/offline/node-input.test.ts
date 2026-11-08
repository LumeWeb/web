/** Node callers can load WASM bytes before adapter work without a file-URL fetch. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PhraseValidation } from "@/index";
import { Facade, sdkEnvironment } from "./environment.ts";

void test(
  "Node byte initialization avoids asset fetching during adapter work",
  { timeout: 30000 },
  async (t) => {
    const environment = sdkEnvironment(t, { facade: Facade.Node });
    const wasm = await import("@siafoundation/sia-storage/wasm");
    const bytes = await readFile(
      new URL(
        import.meta
          .resolve("@siafoundation/sia-storage/wasm/sia_storage_wasm_bg.wasm"),
      ),
    );
    await wasm.default({ module_or_path: new Uint8Array(bytes) });
    const survivor = new wasm.AppKey(new Uint8Array(32).fill(9));
    t.after(() => survivor.free());
    const { createSiaAdapter } = await import("@/sia");
    const adapter = createSiaAdapter();
    const phrase = await adapter.generateRecoveryPhrase();
    assert.equal(
      await adapter.validateRecoveryPhrase(phrase),
      PhraseValidation.Valid,
    );
    assert.deepEqual(survivor.export(), new Uint8Array(32).fill(9));
    const message = new Uint8Array([1, 2, 3]);
    assert.equal(
      survivor.verifySignature(message, survivor.sign(message)),
      true,
    );
    assert.equal(environment.loads, 0);
  },
);
