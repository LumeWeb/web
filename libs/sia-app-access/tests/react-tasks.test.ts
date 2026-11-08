import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createSiaAccess } from "@/index";
import * as react from "@/react";

void test("task hooks render no interaction effects on the server", (t) => {
  const errors = t.mock.method(console, "error");
  const unexpected = async (): Promise<never> => {
    throw Error("unexpected protocol work");
  };
  const access = createSiaAccess({
    adapter: {
      begin: unexpected,
      generateRecoveryPhrase: unexpected,
      reconnect: unexpected,
      validateRecoveryPhrase: unexpected,
    },
    application: {
      appId: "a".repeat(64),
      description: "",
      name: "test",
      serviceUrl: "https://app.test",
    },
    indexerUrl: "https://indexer.test",
  });
  function View() {
    assert.equal(react.useSiaRecoveryPhrase(access), null);
    assert.equal(react.useSiaApproval(access), null);
    assert.equal(react.useSiaSaveRecovery(access), null);
    return createElement("p", null, "application markup");
  }
  assert.equal(
    renderToString(createElement(View)),
    "<p>application markup</p>",
  );
  assert.equal(errors.mock.callCount(), 0);
  access.dispose();
});

import { fixture } from "./helpers/core-fixture.ts";
import { AccessIntent } from "@/index";
void test("task SSR exposes Sia metadata without owning form values or errors", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  const serverSnapshot = f.access.getSnapshot();
  const context = react.createSiaAccessContext();
  function View() {
    const controlled = react.useSiaRecoveryPhrase(f.access, { serverSnapshot });
    assert.equal("useSiaRecoveryPhraseDraft" in react, false);
    assert.equal(
      controlled?.interaction.sequence,
      serverSnapshot.presentation.interaction?.sequence,
    );
    assert.ok(controlled);
    assert.equal("value" in controlled, false);
    assert.equal("issue" in controlled, false);
    assert.equal("setValue" in controlled, false);
    assert.equal(react.useSiaApproval(f.access), null);
    return createElement("p", null, controlled?.intent);
  }
  assert.equal(
    renderToString(
      createElement(
        context.Provider,
        { access: f.access },
        createElement(View),
      ),
    ),
    "<p>create</p>",
  );
  f.access.dispose();
});
void test("task SSR rejects a snapshot from a different credential scope", () => {
  const f = fixture();
  const snapshot = f.access.getSnapshot();
  function View() {
    react.useSiaApproval(f.access, {
      serverSnapshot: {
        ...snapshot,
        scope: { ...snapshot.scope, appId: "b".repeat(64) },
      },
    });
    return null;
  }
  assert.throws(() => renderToString(createElement(View)), /scope.*match/);
  f.access.dispose();
});

import { AccessOutcome } from "@/index";
void test("server phrase task actions stay unavailable and expose no form manager API", async () => {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  const captured: { task: null | react.RecoveryPhraseTask } = { task: null };
  function View() {
    captured.task = react.useSiaRecoveryPhrase(f.access);
    return null;
  }
  renderToString(createElement(View));
  assert.ok(captured.task);
  assert.equal(Object.isFrozen(captured.task), true);
  assert.deepEqual(await captured.task.submit("application input"), {
    kind: AccessOutcome.Unavailable,
  });
  assert.deepEqual(await captured.task.generate(), {
    kind: AccessOutcome.Unavailable,
  });
  captured.task.cancel();
  assert.ok(f.access.getSnapshot().presentation.phrase);
  for (const removed of [
    "createRecoveryPhraseField",
    "useSiaRecoveryPhraseDraft",
    "PhraseRequestStatus",
  ])
    assert.equal(removed in react, false);
  f.access.dispose();
});
