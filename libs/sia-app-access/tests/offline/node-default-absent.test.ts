/** Missing native addons must not force Node callers through file-URL fetch. */
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { PhraseValidation } from "@/index";

void test(
  "Node initializes installed WASM assets without a native facade or fetch replacement",
  { timeout: 30000 },
  async (t) => {
    const hooks = registerHooks({
      resolve(specifier, context, next) {
        if (specifier === "@siafoundation/sia-storage")
          throw Error("native facade unavailable");
        return next(specifier, context);
      },
    });
    t.after(() => hooks.deregister());
    const { createSiaAdapter } = await import("@/sia");
    const adapter = createSiaAdapter();
    const phrase = await adapter.generateRecoveryPhrase();
    assert.equal(
      await adapter.validateRecoveryPhrase(phrase),
      PhraseValidation.Valid,
    );
  },
);
