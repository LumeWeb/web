/** Onboarding screens call account operations while the controller owns its session. */
import type { SiaAccess } from "@lumeweb/sia-app-access";

export function createAccountService<Session>(access: SiaAccess<Session>) {
  return {
    checkConnection(): Promise<boolean> {
      return access.withSession(() => true);
    },
  };
}
