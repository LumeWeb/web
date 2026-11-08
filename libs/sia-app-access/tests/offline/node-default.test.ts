/** Node adapter utilities must initialize without replacing the platform fetch. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PhraseValidation } from "@/index";

void test(
  "Node adapter initializes from installed assets without manual setup",
  { timeout: 30000 },
  async () => {
    const { createSiaAdapter } = await import("@/sia");
    const adapter = createSiaAdapter();
    const phrase = await adapter.generateRecoveryPhrase();
    assert.equal(
      await adapter.validateRecoveryPhrase(phrase),
      PhraseValidation.Valid,
    );
    assert.equal(
      await adapter.validateRecoveryPhrase("invalid"),
      PhraseValidation.Invalid,
    );
  },
);
