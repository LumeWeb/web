/** Command effect snapshots remain readonly while their owner records dispatched effects. */
import type { CommandScope } from "@/command-scope";
import { CredentialEffect, RegistrationEffect } from "@/index";

export function commandEffectsAreReadonly(op: CommandScope<unknown>): void {
  // @ts-expect-error Raw effect snapshots cannot be edited.
  op.effects.credentials = CredentialEffect.Write;
  // @ts-expect-error Raw effect snapshots cannot be replaced.
  op.effects = {
    credentials: CredentialEffect.None,
    registration: RegistrationEffect.None,
  };
}
