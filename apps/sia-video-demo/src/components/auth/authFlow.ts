/**
 * Pure entry-flow routing. Kept free of React and store side effects so the
 * exact routing decision (who sees the gate vs. the keyless player vs. SSO
 * screens) is a plain function that unit tests can pin down.
 */

/** The slice of auth state the router needs to pick a screen. */
export interface AuthFlowInput {
  /**
   * Legacy spellings of the reconnecting state as a standalone boolean, kept
   * so existing router tests keep pinning the loading route. New callers
   * should rely on `status === "reconnecting"` instead.
   */
  reconnecting?: boolean;
  sharingKeyHex: null | string;
  status: AuthStatus;
}

/**
 * The auth-status vocabulary as a const object, so the store and the router
 * share one spelling of every state. `reconnecting` is the label for the
 * transient "reconnecting a persisted app key" state (previously a standalone
 * `reconnecting: boolean` on the store); as a status member it can be routed
 * by `selectAuthStep` exactly like any other state.
 */
export const AuthStatus = {
  AwaitingApproval: "awaiting-approval",
  Connected: "connected",
  Disconnected: "disconnected",
  Reconnecting: "reconnecting",
  Registering: "registering",
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

export type AuthStep = "approve" | "gate" | "loading" | "player" | "recovery";

export function selectAuthStep(state: AuthFlowInput): AuthStep {
  // A sharing key is a complete credential (indexer + share key = SSO): when
  // one is present, the keyless shared player is the entry point no matter
  // the app-key/SSO state, a share must never wait behind a sign-in flow.
  if (state.sharingKeyHex) return "player";
  if (state.reconnecting) return "loading";
  switch (state.status) {
    case "awaiting-approval":
      return "approve";
    case "connected":
      return "player";
    case "reconnecting":
      return "loading";
    case "registering":
      return "recovery";
    default:
      return "gate";
  }
}
