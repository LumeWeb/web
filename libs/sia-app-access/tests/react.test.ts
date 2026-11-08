interface NamedSession {
  readonly name: string;
}
import { AccessPhase } from "@/index";
/** Server rendering observes the controller without owning its lifetime. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createSiaAccess, type SiaAccess } from "@/index";
import {
  createSiaAccessContext,
  useSiaAccess,
  useSiaAccessSelector,
} from "@/react";

void test("SSR uses the supplied snapshot and does not start or dispose access", () => {
  let calls = 0;
  const unexpected = async (): Promise<never> => {
    calls++;
    throw Error("unexpected protocol work");
  };
  const access = createSiaAccess<NamedSession>({
    adapter: {
      begin: unexpected,
      generateRecoveryPhrase: unexpected,
      reconnect: unexpected,
      validateRecoveryPhrase: unexpected,
    },
    application: {
      appId: "a".repeat(64),
      description: "",
      name: "Test",
      serviceUrl: "https://app.test",
    },
    indexerUrl: "https://indexer.test",
  });
  const serverSnapshot = Object.freeze({
    ...access.getSnapshot(),
    state: Object.freeze({ phase: AccessPhase.Restoring as const }),
  });
  const bindings = createSiaAccessContext<NamedSession>();
  function View() {
    const direct = useSiaAccess(access, { serverSnapshot });
    const contextual = bindings.useAccess({ serverSnapshot });
    assert.equal(direct.snapshot, serverSnapshot);
    assert.equal(contextual.snapshot, serverSnapshot);
    assert.equal("dispose" in direct.commands, false);
    return createElement("p", null, contextual.snapshot.state.phase);
  }
  assert.match(
    renderToString(
      createElement(bindings.Provider, { access }, createElement(View)),
    ),
    /restoring/,
  );
  assert.equal(calls, 0);
  assert.equal(access.getSnapshot().state.phase, "disconnected");
});

for (const binding of ["direct", "context"] as const) {
  for (const field of ["appId", "indexerUrl"] as const) {
    void test(`${binding} rejects a server snapshot with another ${field}`, () => {
      const unexpected = async (): Promise<never> => {
        throw Error("unexpected protocol work");
      };
      const access = createSiaAccess<number>({
        adapter: {
          begin: unexpected,
          generateRecoveryPhrase: unexpected,
          reconnect: unexpected,
          validateRecoveryPhrase: unexpected,
        },
        application: {
          appId: "a".repeat(64),
          description: "",
          name: "Test",
          serviceUrl: "https://app.test",
        },
        indexerUrl: "https://indexer.test",
      });
      const serverSnapshot = Object.freeze({
        ...access.getSnapshot(),
        scope: Object.freeze({
          ...access.getSnapshot().scope,
          [field]:
            field === "appId"
              ? "b".repeat(64)
              : "https://another-indexer.test/",
        }),
      });
      const bindings = createSiaAccessContext<number>();
      function DirectView() {
        useSiaAccess(access, { serverSnapshot });
        return null;
      }
      function ContextView() {
        bindings.useAccess({ serverSnapshot });
        return null;
      }
      const View = binding === "direct" ? DirectView : ContextView;
      assert.throws(
        () =>
          renderToString(
            createElement(bindings.Provider, { access }, createElement(View)),
          ),
        /scope.*match|match.*scope/i,
      );
    });
  }
}

void test("direct and context selectors use the supplied server snapshot without protocol work", () => {
  const unused = async (): Promise<never> => {
    throw Error("Unexpected adapter work");
  };
  const access = createSiaAccess<number>({
    adapter: {
      begin: unused,
      generateRecoveryPhrase: unused,
      reconnect: unused,
      validateRecoveryPhrase: unused,
    },
    application: {
      appId: "a".repeat(64),
      description: "",
      name: "Test",
      serviceUrl: "https://app.test",
    },
    indexerUrl: "https://indexer.test",
  });
  const serverSnapshot = Object.freeze({
    ...access.getSnapshot(),
    state: Object.freeze({ phase: AccessPhase.Restoring as const }),
  });
  const bindings = createSiaAccessContext<number>();
  function View() {
    const direct = useSiaAccessSelector(
      access,
      (snapshot) => snapshot.state.phase,
      {
        serverSnapshot,
      },
    );
    const contextual = bindings.useSelector(
      (snapshot) => snapshot.state.phase,
      { serverSnapshot },
    );
    assert.equal(direct, "restoring");
    assert.equal(contextual, "restoring");
    return createElement("p", null, direct);
  }
  assert.match(
    renderToString(
      createElement(bindings.Provider, { access }, createElement(View)),
    ),
    /restoring/,
  );
  assert.equal(access.getSnapshot().state.phase, "disconnected");
  access.dispose();
});

void test("context observation outside its provider reports the missing owner", () => {
  const bindings = createSiaAccessContext<number>();
  function View() {
    bindings.useAccess();
    return null;
  }
  assert.throws(() => renderToString(createElement(View)), /Provider/);
});

void test("SSR command bindings retain the controller receiver", async () => {
  const unexpected = async (): Promise<never> => {
    throw Error("unexpected protocol work");
  };
  const base = createSiaAccess<number>({
    adapter: {
      begin: unexpected,
      generateRecoveryPhrase: unexpected,
      reconnect: unexpected,
      validateRecoveryPhrase: unexpected,
    },
    application: {
      appId: "a".repeat(64),
      description: "",
      name: "Test",
      serviceUrl: "https://app.test",
    },
    indexerUrl: "https://indexer.test",
  });
  let cancelled = false;
  const access: SiaAccess<number> = {
    ...base,
    cancel() {
      assert.equal(this, access);
      cancelled = true;
    },
    reconnect() {
      assert.equal(this, access);
      return base.reconnect();
    },
  };
  const bindings = createSiaAccessContext<number>();
  const pending: Promise<unknown>[] = [];
  function View() {
    const direct = useSiaAccess(access);
    const contextual = bindings.useAccess();
    direct.commands.cancel();
    contextual.commands.cancel();
    pending.push(direct.commands.reconnect(), contextual.commands.reconnect());
    return null;
  }
  renderToString(
    createElement(bindings.Provider, { access }, createElement(View)),
  );
  await Promise.all(pending);
  assert.equal(cancelled, true);
  base.dispose();
});
