/** Render-prop views leave markup and controller ownership with the application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccessPhase, type AccessSnapshot } from "@/index";
import * as react from "@/react";
import type { SiaAccessBinding } from "@/react";
import { fixture } from "./helpers/core-fixture.ts";
import type { TestSession } from "./helpers/core-fixture.ts";

for (const contextual of [false, true]) {
  const name = contextual ? "context" : "direct";
  void test(`${name} view returns caller markup and styling without a library wrapper`, () => {
    const f = fixture();
    const bindings = react.createSiaAccessContext<TestSession>();
    const serverSnapshot: AccessSnapshot = {
      ...f.access.getSnapshot(),
      state: { phase: AccessPhase.Restoring },
    };
    let calls = 0;
    const children = (binding: SiaAccessBinding<TestSession>): ReactNode => {
      calls++;
      assert.equal(binding.snapshot, serverSnapshot);
      assert.equal("dispose" in binding.commands, false);
      return createElement(
        "button",
        {
          className: "application-button",
          style: { color: "purple" },
          type: "button",
        },
        binding.snapshot.state.phase,
      );
    };
    const element = contextual
      ? createElement(
          bindings.Provider,
          { access: f.access },
          createElement(bindings.View, { children, serverSnapshot }),
        )
      : createElement(react.SiaAccessView<TestSession>, {
          access: f.access,
          children,
          serverSnapshot,
        });
    try {
      assert.equal(
        renderToStaticMarkup(element),
        '<button class="application-button" style="color:purple" type="button">restoring</button>',
      );
      assert.equal(calls, 1);
      assert.equal(
        f.access.getSnapshot().state.phase,
        AccessPhase.Disconnected,
      );
      assert.deepEqual(f.counts(), { ended: 0, registrations: 0, retired: 0 });
    } finally {
      f.access.dispose();
    }
  });

  void test(`${name} view accepts no styling and can render nothing`, () => {
    const f = fixture();
    const bindings = react.createSiaAccessContext<TestSession>();
    const children = () => null;
    try {
      const element = contextual
        ? createElement(
            bindings.Provider,
            { access: f.access },
            createElement(bindings.View, { children }),
          )
        : createElement(react.SiaAccessView<TestSession>, {
            access: f.access,
            children,
          });
      assert.equal(renderToStaticMarkup(element), "");
      assert.equal(
        f.access.getSnapshot().state.phase,
        AccessPhase.Disconnected,
      );
    } finally {
      f.access.dispose();
    }
  });

  void test(`${name} view rejects hydration data for another controller scope`, () => {
    const f = fixture();
    const bindings = react.createSiaAccessContext<TestSession>();
    const current = f.access.getSnapshot();
    const serverSnapshot = {
      ...current,
      scope: { ...current.scope, appId: "b".repeat(64) },
    };
    const children = () => null;
    try {
      const element = contextual
        ? createElement(
            bindings.Provider,
            { access: f.access },
            createElement(bindings.View, { children, serverSnapshot }),
          )
        : createElement(react.SiaAccessView<TestSession>, {
            access: f.access,
            children,
            serverSnapshot,
          });
      assert.throws(() => renderToStaticMarkup(element), /scope.*match/i);
    } finally {
      f.access.dispose();
    }
  });
}

void test("context view outside its provider reports the missing controller", () => {
  const bindings = react.createSiaAccessContext<TestSession>();
  assert.throws(
    () =>
      renderToStaticMarkup(
        createElement(bindings.View, { children: () => null }),
      ),
    /Provider/,
  );
});
