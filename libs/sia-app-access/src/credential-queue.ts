/** Scoped credential calls retain store order across cancelled commands. */
import type { CredentialScope, CredentialStore } from "./credentials.ts";

/** Scoped operations serialize mutations and check read admission at dispatch.
 * Writes own their input until settlement, then clear it even after rejection.
 */
export interface CredentialStorage {
  read(current: () => boolean): Promise<null | Uint8Array>;
  remove(): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
}

/** Once admitted, mutations keep their position even if their caller is cancelled. */
export class CredentialQueue implements CredentialStorage {
  private tail = Promise.resolve();
  constructor(
    private readonly store: CredentialStore,
    private readonly scope: CredentialScope,
  ) {}
  read(current: () => boolean): Promise<null | Uint8Array> {
    return this.enqueue(() =>
      current() ? this.store.read(this.scope) : Promise.resolve(null),
    );
  }
  remove(): Promise<void> {
    return this.enqueue(() => this.store.remove(this.scope));
  }
  write(bytes: Uint8Array): Promise<void> {
    return this.enqueue(async () => {
      try {
        await this.store.write(this.scope, bytes);
      } finally {
        bytes.fill(0);
      }
    });
  }
  private enqueue<Value>(work: () => Promise<Value>): Promise<Value> {
    const pending = this.tail.then(work);
    this.tail = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }
}
