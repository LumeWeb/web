/** Separate request/client controllers deliberately collide in scope and local sequence. */
import {
  createElement as h,
  StrictMode,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { AccessIntent, AccessOutcome, PhraseValidation } from "@/index";
import {
  createSiaAccessContext,
  useSiaApproval,
  useSiaRecoveryPhrase,
  useSiaSaveRecovery,
} from "@/react";
import type {
  ApprovalTask,
  RecoveryPhraseTask,
  SaveRecoveryTask,
} from "@/react";
import { credentialStore, fixture } from "../helpers/core-fixture.ts";
import type { TestSession } from "../helpers/core-fixture.ts";
import { deferred } from "../helpers/core-async.ts";
const context = createSiaAccessContext<TestSession>();
function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
async function correlation() {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  const generated = deferred<string>();
  f.adapter.generateRecoveryPhrase = () => generated.promise;
  f.adapter.validateRecoveryPhrase = async () => PhraseValidation.Invalid;
  let generation: Promise<GeneratedRecoveryPhrase> | undefined;
  let submission: Promise<SubmitRecoveryPhraseResult> | undefined;
  let submittedInput: string | undefined;
  const access = {
    ...f.access,
    generateRecoveryPhrase() {
      generation = f.access.generateRecoveryPhrase();
      return generation;
    },
    submitRecoveryPhrase(input: string) {
      submittedInput = input;
      submission = f.access.submitRecoveryPhrase(input);
      return submission;
    },
  };
  const current: { task: null | RecoveryPhraseTask } = { task: null };
  function View() {
    current.task = useSiaRecoveryPhrase(access);
    return null;
  }
  const root = createRoot(document.getElementById("root")!);
  root.render(h(StrictMode, null, h(View)));
  for (let i = 0; i < 8; i++)
    await new Promise((resolve) => setTimeout(resolve, 0));
  check(current.task, "live task committed");
  let applicationValue = "app input";
  const pendingGeneration = current.task.generate();
  check(
    pendingGeneration === generation,
    "generation promise forwarded unchanged",
  );
  applicationValue = "edited by app";
  generated.resolve("generated outcome");
  const result = await pendingGeneration;
  check(
    result === (await generation),
    "generation outcome forwarded unchanged",
  );
  check(
    result.kind === AccessOutcome.Generated &&
      result.phrase === "generated outcome",
    "generation returns phrase to caller",
  );
  check(
    applicationValue === "edited by app",
    "generation never writes application value",
  );
  const pendingSubmission = current.task.submit(applicationValue);
  check(
    pendingSubmission === submission,
    "submission promise forwarded unchanged",
  );
  const outcome = await pendingSubmission;
  check(
    outcome === (await submission),
    "submission outcome forwarded unchanged",
  );
  check(
    outcome.kind === AccessOutcome.InvalidPhrase,
    "SDK supplies semantic correction",
  );
  check(
    submittedInput === applicationValue,
    "submission forwards application input",
  );
  check(
    !("issue" in current.task) && !("value" in current.task),
    "task owns no errors or values",
  );
  root.unmount();
  check(
    applicationValue === "edited by app",
    "unmount never resets application value",
  );
  f.access.dispose();
  return "PASS";
}
async function run(kind: string, contextual: boolean) {
  const server = fixture(
    credentialStore({
      async write() {
        throw Error("save");
      },
    }),
  );
  let writes = 0;
  const live = fixture(
    credentialStore({
      async write() {
        if (++writes === 1) throw Error("save");
      },
    }),
  );
  if (kind === "approval") {
    server.connection.waitForApproval = () => deferred<void>().promise;
    live.connection.waitForApproval = () => deferred<void>().promise;
    void server.access.authorize(AccessIntent.Create);
    void live.access.authorize(AccessIntent.Existing);
    await Promise.resolve();
    await Promise.resolve();
  } else {
    await server.access.authorize(AccessIntent.Create);
    await live.access.authorize(AccessIntent.Existing);
    if (kind === "save") {
      await server.access.submitRecoveryPhrase("server input");
      await live.access.submitRecoveryPhrase("live input");
    }
  }
  const serverSnapshot = server.access.getSnapshot();
  check(serverSnapshot !== live.access.getSnapshot(), "independent snapshots");
  check(
    serverSnapshot.presentation.interaction?.sequence ===
      live.access.getSnapshot().presentation.interaction?.sequence,
    "colliding sequences",
  );
  let generated = 0;
  live.adapter.generateRecoveryPhrase = async () => {
    generated++;
    return "generated";
  };
  let escapedApproval: ApprovalTask | null = null;
  let escapedPhrase: null | RecoveryPhraseTask = null;
  let escapedSave: null | SaveRecoveryTask = null;
  const current: {
    approval: ApprovalTask | null;
    phrase: null | RecoveryPhraseTask;
    save: null | SaveRecoveryTask;
  } = { approval: null, phrase: null, save: null };
  let hydrating = false;
  let captured = false;
  function stale() {
    escapedApproval?.cancel();
    escapedPhrase?.cancel();
    void escapedPhrase?.submit("server closure input");
    void escapedPhrase?.generate();
    escapedSave?.cancel();
    void escapedSave?.retrySave();
    escapedSave?.continueWithoutSaving();
  }
  function useCapturedTasks(
    approval: ApprovalTask | null,
    phrase: null | RecoveryPhraseTask,
    save: null | SaveRecoveryTask,
  ) {
    if (hydrating && !captured) {
      captured = true;
      escapedApproval = approval;
      escapedPhrase = phrase;
      escapedSave = save;
    }
    current.approval = approval;
    current.phrase = phrase;
    current.save = save;
    useLayoutEffect(() => {
      if (hydrating) stale();
    }, []);
  }
  function DirectView() {
    const options = { serverSnapshot };
    const approval = useSiaApproval(live.access, options);
    const phrase = useSiaRecoveryPhrase(live.access, options);
    const save = useSiaSaveRecovery(live.access, options);
    useCapturedTasks(approval, phrase, save);
    return h("p", null, "request presentation");
  }
  function ContextView() {
    const options = { serverSnapshot };
    const approval = context.useApproval(options);
    const phrase = context.useRecoveryPhrase(options);
    const save = context.useSaveRecovery(options);
    useCapturedTasks(approval, phrase, save);
    return h("p", null, "request presentation");
  }
  const View = contextual ? ContextView : DirectView;
  const tree = h(
    StrictMode,
    null,
    h(context.Provider, { access: live.access }, h(View)),
  );
  const container = document.getElementById("root")!;
  container.innerHTML = renderToString(tree);
  hydrating = true;
  const root = hydrateRoot(container, tree);
  for (let i = 0; i < 8; i++)
    await new Promise((resolve) => setTimeout(resolve, 0));
  check(captured, "hydration render captured");
  stale();
  await Promise.resolve();
  check(
    live.access.getSnapshot().presentation.interaction !== null,
    "stale actions did not cancel",
  );
  check(generated === 0, "server closures did not generate");
  if (kind === "approval") {
    check(current.approval, "live approval reconciled");
    current.approval.cancel();
    check(
      live.access.getSnapshot().presentation.interaction === null,
      "live cancel works",
    );
  } else if (kind === "phrase") {
    check(current.phrase, "live phrase reconciled");
    check(
      (await current.phrase.generate()).kind === AccessOutcome.Generated,
      "live generation works",
    );
    check(Number(generated) === 1, "only live generation ran");
  } else {
    check(current.save, "live save reconciled");
    check(
      (await current.save.retrySave()).kind === AccessOutcome.Ready,
      "live retry works",
    );
    check(writes === 2, "only live retry wrote");
  }
  root.unmount();
  server.access.dispose();
  live.access.dispose();
  return "PASS";
}
Object.assign(window, { taskHydration: { correlation, run } });

import type {
  GeneratedRecoveryPhrase,
  SubmitRecoveryPhraseResult,
} from "@/index";

/** Retained actions run in the replacement commit, before passive lease cleanup. */
async function replacement(action: string, contextual: boolean) {
  let writes = 0;
  let generated = 0;
  const old = fixture(
    credentialStore({
      async write() {
        writes++;
        throw Error("save");
      },
    }),
  );
  const next = fixture();
  old.adapter.generateRecoveryPhrase = async () => {
    generated++;
    return "generated";
  };
  if (action === "approval.cancel") {
    old.connection.waitForApproval = () => deferred<void>().promise;
    void old.access.authorize(AccessIntent.Create);
    await Promise.resolve();
    await Promise.resolve();
  } else {
    await old.access.authorize(AccessIntent.Create);
    if (action.startsWith("save."))
      await old.access.submitRecoveryPhrase("input");
  }
  await next.access.authorize(AccessIntent.Create);
  const before = old.access.getSnapshot();
  const counts = old.counts();
  const initialWrites = writes;
  let retained: (() => unknown) | undefined;
  let result: unknown;
  let invoked = false;
  let committed: (() => void) | undefined;
  const mounted = new Promise<void>((resolve) => {
    committed = resolve;
  });
  function Capture({
    access,
    replacing,
  }: {
    readonly access: typeof old.access;
    readonly replacing: boolean;
  }) {
    const approval = useSiaApproval(access);
    const phrase = useSiaRecoveryPhrase(access);
    const save = useSiaSaveRecovery(access);
    useReplacementCapture(approval, phrase, save, replacing);
    return null;
  }
  function ContextCapture({ replacing }: { readonly replacing: boolean }) {
    const approval = context.useApproval();
    const phrase = context.useRecoveryPhrase();
    const save = context.useSaveRecovery();
    useReplacementCapture(approval, phrase, save, replacing);
    return null;
  }
  function useReplacementCapture(
    approval: ApprovalTask | null,
    phrase: null | RecoveryPhraseTask,
    save: null | SaveRecoveryTask,
    replacing: boolean,
  ) {
    useLayoutEffect(() => {
      if (replacing) {
        check(retained, "old committed action captured");
        invoked = true;
        result = retained();
      }
    }, [replacing]);
    useEffect(() => {
      if (replacing) return;
      if (action === "approval.cancel") {
        check(approval, "approval task available");
        retained = () => approval.cancel();
      } else if (action === "phrase.cancel") {
        check(phrase, "phrase task available");
        retained = () => phrase.cancel();
      } else if (action === "phrase.generate") {
        check(phrase, "phrase task available");
        retained = () => phrase.generate();
      } else if (action === "phrase.submit") {
        check(phrase, "phrase task available");
        retained = () => phrase.submit("old input");
      } else if (action === "save.cancel") {
        check(save, "save task available");
        retained = () => save.cancel();
      } else if (action === "save.retry") {
        check(save, "save task available");
        retained = () => save.retrySave();
      } else {
        check(save, "save task available");
        retained = () => save.continueWithoutSaving();
      }
      committed?.();
    }, [approval, phrase, save, replacing]);
  }
  function tree(access: typeof old.access, replacing: boolean) {
    return contextual
      ? h(context.Provider, { access }, h(ContextCapture, { replacing }))
      : h(Capture, { access, replacing });
  }
  const root = createRoot(document.getElementById("root")!);
  try {
    root.render(tree(old.access, false));
    await mounted;
    root.render(tree(next.access, true));
    for (let i = 0; i < 8; i++)
      await new Promise((resolve) => setTimeout(resolve, 0));
    check(invoked, "replacement layout effect ran");
    const outcome = await result;
    return {
      generated,
      outcome,
      registrations: old.counts().registrations - counts.registrations,
      unchanged: old.access.getSnapshot() === before,
      writes: writes - initialWrites,
    };
  } finally {
    root.unmount();
    old.access.dispose();
    next.access.dispose();
  }
}
Object.assign(window, { taskReplacement: { replacement } });

/** Descendant mount effects precede the parent task's passive activation. */
async function activation(contextual: boolean) {
  const f = fixture();
  await f.access.authorize(AccessIntent.Create);
  let generated = 0;
  f.adapter.generateRecoveryPhrase = async () => {
    generated++;
    return "generated after activation";
  };
  const committed = deferred<void>();
  const captured: { task: null | RecoveryPhraseTask } = { task: null };
  let layout: Promise<GeneratedRecoveryPhrase> | undefined;
  let passive: Promise<GeneratedRecoveryPhrase> | undefined;
  let enabled = false;
  function Child({ task }: { readonly task: RecoveryPhraseTask }) {
    const invoked = useRef({ layout: false, passive: false });
    useLayoutEffect(() => {
      if (invoked.current.layout) return;
      invoked.current.layout = true;
      layout = task.generate();
    }, [task]);
    useEffect(() => {
      if (invoked.current.passive) return;
      invoked.current.passive = true;
      passive = task.generate();
    }, [task]);
    return null;
  }
  function useProbe(task: null | RecoveryPhraseTask) {
    check(task, "phrase task is present");
    captured.task = task;
    enabled = task.canGenerate;
    useEffect(() => {
      committed.resolve();
    }, []);
    return h(Child, { task });
  }
  function Direct() {
    return useProbe(useSiaRecoveryPhrase(f.access));
  }
  function Contextual() {
    return useProbe(context.useRecoveryPhrase());
  }
  const root = createRoot(document.getElementById("root")!);
  try {
    root.render(
      contextual
        ? h(context.Provider, { access: f.access }, h(Contextual))
        : h(Direct),
    );
    await committed.promise;
    check(captured.task && layout && passive, "mount effects completed");
    const before = generated;
    const after = await captured.task.generate();
    return {
      after,
      before,
      enabled,
      generated,
      layout: await layout,
      passive: await passive,
    };
  } finally {
    root.unmount();
    f.access.dispose();
  }
}
Object.assign(window, { taskActivation: { activation } });

declare global {
  interface Window {
    readonly taskActivation: { readonly activation: typeof activation };
    readonly taskHydration: {
      readonly correlation: typeof correlation;
      readonly run: typeof run;
    };
    readonly taskReplacement: { readonly replacement: typeof replacement };
  }
}
