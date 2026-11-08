/** Private event payload checks compensate for Robot3's permissive send type. */
import { AccessEvent, createAccessMachine } from "../../dist/access-machine.js";
import { AccessIntent, PhraseValidation } from "../../dist/index.js";

export function inspectPrivateEvents(): void {
  const machine = createAccessMachine();
  machine.send({ intent: AccessIntent.Existing, type: AccessEvent.Authorize });
  machine.send({
    type: AccessEvent.Validated,
    validation: PhraseValidation.Valid,
  });
  // @ts-expect-error Authorize requires its intent payload.
  machine.send({ type: AccessEvent.Authorize });
  // @ts-expect-error A validation result cannot substitute for matching.
  machine.send({ matches: PhraseValidation.Valid, type: AccessEvent.Matched });
  // @ts-expect-error Failure events require correlated failure observations.
  machine.send({ type: AccessEvent.Failed });
  // @ts-expect-error Machine internals never reach the controller wrapper.
  void machine.context;
}
