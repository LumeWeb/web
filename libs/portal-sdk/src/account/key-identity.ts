/**
 * Key-identity login client (wallet / passkey-style identity auth).
 *
 * Endpoints: POST /api/auth/key/challenge and POST /api/auth/key/verify on
 * the account service. The generated orval fetchers cannot serve them: they
 * accept RequestInit only, so the relative `/api/auth/key/*` path always
 * resolves against the dashboard host, which does not route those paths.
 * The calls resolve against the account API origin instead — the same
 * `new URL(input, this.apiUrl)` base every AccountApi method uses (see
 * `resolveKeyUrl`).
 *
 * Verify runs through a raw fetch because the `new_account` flag travels in
 * two places and the parsed body alone is not enough: as `new_account:
 * true` in the 200 JSON body on the OTP branch, and as `new_account=1` on
 * the followed 302's terminal URL otherwise — auth-complete's JSON does not
 * echo the flag, so reading the redirect branch requires `Response.url`,
 * which a parsed-body helper discards. The served spec (see
 * src/account/swagger.yaml) documents the flag on the verify 200 response.
 *
 * No call carries the `return` query param. Backend `return` threading is
 * page-level navigation (302 → /api/auth/complete → 302 → return); a fetch
 * carrying it would follow that chain into the return page's HTML and crash
 * the token parsing that backs the ping-recovery branch. Pinned by
 * src/__tests__/account-key-identity.test.ts.
 *
 * The server authors the challenge message (SIWE/CAIP-122) and the wallet
 * signs it verbatim; no message text is built here. Transport only — wallet
 * detection, signing, and UI stay in @lumeweb/portal-framework-auth.
 */

import type { KeyIdentityChallengeResponse } from "@/account/generated/accountAPI.schemas";
import {
  buildApiUrl,
  buildJsonOptions,
  parseRawJson,
  parseRawJsonOrNull,
} from "@/http/request";
import type { RequestInit } from "@/types";

/** Server response of POST /api/auth/key/challenge (200). The generated schema type is the wire contract. */
export type KeyChallenge = KeyIdentityChallengeResponse;

/**
 * The three ways POST /api/auth/key/verify can land for the SPA:
 *   - `token`    → session token in hand: store it, start the session.
 *   - `otp`      → otp: true → route through the existing /otp flow.
 *   - `redirect` → the 302 "auth complete" redirect chain ran, but the
 *     final body was not JSON, so no token arrived; the caller recovers
 *     the session token via `sdk.account().ping()`.
 *
 * `newAccount` is true when verify provisioned a new anonymous account: the
 * signal arrives as `new_account: true` in the response body or as
 * `new_account=1` on the followed auth-complete redirect URL (see above).
 */
export type KeyVerifyOutcome =
  | { kind: "otp"; newAccount: boolean }
  | { kind: "redirect"; newAccount: boolean }
  | { kind: "token"; newAccount: boolean; token: string };

/**
 * Key-identity login failure carrying the served HTTP status and the
 * backend `ErrorResponse.error.reason` so the UI can map failures (e.g.
 * already-linked) to copy. UI strings stay in the consuming framework lib.
 */
export class KeyIdentityError extends Error {
  readonly reason: null | string;
  readonly status: number;

  constructor(status: number, message: string, reason: null | string = null) {
    super(message);
    this.name = "KeyIdentityError";
    this.reason = reason;
    this.status = status;
  }
}

/** User-facing copy for a key already linked to another account (409). */
export const WALLET_ALREADY_LINKED_MESSAGE =
  "This wallet is already linked to another account.";

/**
 * Key-identity key types served by the account API
 * (`KeyIdentityChallengeRequest.key_type` — e.g. `ethereum`, `solana`).
 */
export const KEY_TYPE_ETHEREUM = "ethereum" as const;
export const KEY_TYPE_SOLANA = "solana" as const;

const CHALLENGE_PATH = "/api/auth/key/challenge";
const VERIFY_PATH = "/api/auth/key/verify";

/** Dependencies of the key-identity client on its owning AccountApi. */
export interface AccountKeyIdentityDeps {
  /** Absolute account API base URL (the AccountApi `apiUrl`). */
  apiUrl: () => string;
  /** True when constructed against a localhost/loopback API: paths stay same-origin relative (see `resolveKeyUrl`). */
  sameOriginPaths: () => boolean;
  /** Current JWT, sent as the Bearer header when set. */
  token: () => string | undefined;
}

export interface KeyIdentityVerifyInput {
  key: string;
  keyType?: string;
  message: string;
  remember?: boolean;
  signature: string;
}

/** Server `ErrorResponse` envelope shape (`{error: {reason, details}}`). */
interface ErrorEnvelope {
  error?: { details?: string; reason?: string };
}

/** Shape of the verify/auth-complete JSON bodies the client cares about. */
interface TokenResponse {
  error?: { details?: string; reason?: string };
  new_account?: boolean;
  otp?: boolean;
  token?: string;
}

/**
 * Namespaced key-identity endpoints on `AccountApi`
 * (`sdk.account().keyIdentity.challenge(...)` / `.verify(...)`).
 *
 * Transport only. Throws `KeyIdentityError` on served failures rather than
 * returning `Result<T>`: the multi-shape verify outcome and the
 * status/reason the UI keys off do not fit the Result envelope.
 */
export class AccountKeyIdentity {
  private readonly deps: AccountKeyIdentityDeps;

  constructor(deps: AccountKeyIdentityDeps) {
    this.deps = deps;
  }

  /**
   * Issues a challenge for a key identity. The response's `message` is
   * server-authored (SIWE/CAIP-122) and must be signed by the wallet
   * verbatim.
   *
   * The challenge is key-agnostic: it succeeds for any syntactically valid
   * key, so linkage state is only learnable at verify; an unknown key is
   * not an error there — verify auto-provisions an anonymous account for it.
   *
   * Wire behavior matches the generated fetcher: same path, POST JSON
   * body, `redirect: "follow"`, and a plain JSON parse of the body — a
   * non-JSON response throws SyntaxError. Challenge never 302s, so no
   * redirect-recovery branch exists on this path.
   */
  public async challenge(
    key: string,
    keyType: string = KEY_TYPE_ETHEREUM,
  ): Promise<KeyChallenge> {
    const res = await this.fetchRaw(CHALLENGE_PATH, {
      body: JSON.stringify({ key, key_type: keyType }),
      method: "POST",
    });

    const data = await parseRawJson<unknown>(res);

    if (res.status !== 200) {
      throw this.keyIdentityError(res.status, data, "Wallet challenge failed");
    }

    const { message, nonce } = data as KeyChallenge;
    if (!message) {
      throw new KeyIdentityError(200, "Wallet challenge returned no message.");
    }
    return { message, nonce };
  }

  /**
   * Verifies a wallet signature over the challenge message and resolves to
   * one of three SPA outcomes (see {@link KeyVerifyOutcome}).
   *
   * The fetch uses the default `redirect: "follow"`: manual mode collapses
   * redirects into an opaque response with no Location header, and the
   * nonce is consumed by the first verify request, so nothing could be
   * retried after it. The followed chain's terminal `Response.url` is the
   * auth-complete request with its query — where `new_account=1` rides
   * when the verify provisioned an account.
   */
  public async verify(input: KeyIdentityVerifyInput): Promise<KeyVerifyOutcome> {
    const { keyType = KEY_TYPE_ETHEREUM, remember = true, ...rest } = input;

    const res = await this.fetchRaw(VERIFY_PATH, {
      body: JSON.stringify({ ...rest, key_type: keyType, remember }),
      method: "POST",
    });

    if (res.status === 302) {
      // Unfollowed 302 (manual-mode passthrough or a truncated chain):
      // complete the hop exactly as the browser would have.
      const location = res.headers.get("location");
      if (!location) {
        return { kind: "redirect", newAccount: false };
      }
      return this.followAuthComplete(location, res.url);
    }

    // The terminal URL of the followed chain carries `new_account=1`; the
    // direct-JSON signal (`new_account: true`, e.g. on the OTP branch) is
    // folded in below from the parsed body.
    let newAccount = readNewAccount(res.url);

    // Status is checked before the body: a non-2xx terminal must never be
    // read as a followed-redirect success, even when it carries no JSON
    // (plain-text/HTML gateway or backend error bodies). The success chain
    // always terminates 2xx (200 JSON token or 200 auth-complete page), so
    // this ordering cannot misfile the happy path.
    if (!res.ok) {
      const body = await parseRawJsonOrNull<TokenResponse>(res);
      throw this.keyIdentityError(res.status, body, "Wallet verification failed");
    }

    const body = await parseRawJsonOrNull<TokenResponse>(res);
    if (body === null) {
      // Non-JSON final body (e.g. an HTML auth-complete page): the
      // redirect chain already ran, so the backend established the
      // session — hand the caller to the ping-recovery branch. The flag
      // was read from the chain URL above.
      return { kind: "redirect", newAccount };
    }

    if (body.new_account) {
      newAccount = true;
    }

    if (body.otp) {
      return { kind: "otp", newAccount };
    }
    if (!body.token) {
      throw new KeyIdentityError(200, "Wallet verification returned no token.");
    }
    return { kind: "token", newAccount, token: body.token };
  }

  /**
   * Raw fetch shared by both endpoints: JSON content type and bearer
   * header via `buildJsonOptions`, URL resolved by `resolveKeyUrl`.
   * Returns the Response so the redirect chain's terminal URL
   * (`response.url`) stays readable for the verify branch.
   *
   * Credentials are `include`, exactly like every other AccountApi call
   * (`AccountApi.fetchJson`): the request URL is the account origin, i.e.
   * cross-origin from the dashboard page, and with the default
   * `same-origin` credentials the browser neither sends nor STORES
   * cookies on it — so the session cookie `/api/auth/complete` sets
   * while following the verify 302 chain was silently dropped and the
   * wallet session never stuck. `include` records it the way the
   * password login's identical redirect chain does (same-site
   * subdomains of the portal root, so the cookie stays first-party).
   */
  private async fetchRaw(path: string, init: RequestInit): Promise<Response> {
    return fetch(
      this.resolveKeyUrl(path),
      buildJsonOptions(init, this.deps.token(), "include"),
    );
  }

  /**
   * Completes an unfollowed 302 by fetching the auth-complete URL and
   * parsing the final token JSON; non-JSON bodies land in the redirect
   * outcome with the flag read from the URL.
   *
   * The fetch is credentialed (`include`, mirroring `AccountApi.fetchJson`)
   * so the cookie `/api/auth/complete` sets on this hop is stored like in
   * the password flow — see `fetchRaw` for the same-origin default pitfall.
   */
  private async followAuthComplete(
    location: string,
    baseUrl?: string,
  ): Promise<KeyVerifyOutcome> {
    const base = baseUrl || globalThis.location?.href;
    let url: URL;
    try {
      url = base ? new URL(location, base) : new URL(location);
    } catch {
      return { kind: "redirect", newAccount: false };
    }
    const newAccount = url.searchParams.get("new_account") === "1";

    const res = await fetch(url, { credentials: "include" });

    // Status is checked before the body — same rule as `verify`: a non-2xx
    // terminal with a non-JSON body is a failure, not a redirect success.
    if (!res.ok) {
      const body = await parseRawJsonOrNull<TokenResponse>(res);
      throw this.keyIdentityError(res.status, body, "Wallet verification failed");
    }

    const body = await parseRawJsonOrNull<TokenResponse>(res);
    if (body === null) {
      return { kind: "redirect", newAccount };
    }
    if (body.otp) {
      return { kind: "otp", newAccount };
    }
    if (!body.token) {
      throw new KeyIdentityError(200, "Wallet verification returned no token.");
    }
    return { kind: "token", newAccount, token: body.token };
  }

  /**
   * Maps a served `ErrorResponse` body to a `KeyIdentityError`; 409 maps
   * to the already-linked copy.
   */
  private keyIdentityError(
    status: number,
    data: unknown,
    prefix: string,
  ): KeyIdentityError {
    const envelope = (data as ErrorEnvelope | null) ?? {};
    const reason = envelope.error?.reason ?? null;
    const details = envelope.error?.details ?? null;

    if (status === 409) {
      return new KeyIdentityError(status, WALLET_ALREADY_LINKED_MESSAGE, reason);
    }

    // Parenthesized `??` chains — a rolldown/tsdown parse bug otherwise.
    const suffix = reason ?? details ?? `HTTP ${status}`;
    return new KeyIdentityError(status, `${prefix} (${suffix}).`, reason);
  }

  /**
   * Key-identity URL resolution: paths resolve against the owning
   * AccountApi apiUrl (the `account.<host>` base every other method uses),
   * except when the SDK was constructed against a localhost/loopback API.
   * Dev servers serve the account routes through a same-origin `/api`
   * proxy, and a rewritten `account.localhost` host does not exist there,
   * so the paths keep their relative form.
   */
  private resolveKeyUrl(path: string): string {
    if (this.deps.sameOriginPaths()) {
      return path;
    }
    return buildApiUrl(path, this.deps.apiUrl());
  }
}

/** Reads `new_account=1` out of a redirect-chain URL (absolute). */
function readNewAccount(url: string): boolean {
  if (!url) {
    return false;
  }
  try {
    return new URL(url).searchParams.get("new_account") === "1";
  } catch {
    return false;
  }
}
