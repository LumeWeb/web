import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountApi } from "@/account";
import {
  KEY_TYPE_ETHEREUM,
  KEY_TYPE_SOLANA,
  KeyIdentityError,
  type KeyVerifyOutcome,
  WALLET_ALREADY_LINKED_MESSAGE,
} from "@/account/key-identity";

/*
 * Key-identity endpoints must never be resolved relative to the browser URL:
 * the dashboard host does not route `/api/auth/key/*`, so the paths resolve
 * against the owning AccountApi account origin (`account.<host>` derived from
 * the Sdk construction URL) — byte-pinned below. Construction against a
 * localhost/loopback API (the dev-server convention) keeps the paths
 * same-origin RELATIVE so the local `/api` proxy keeps serving them. Both
 * forms are pinned.
 *
 * A second pin: no request ever carries the `return` query param. Login APIs
 * answer `return` with page-level redirects only (302 → /api/auth/complete →
 * 302 → return); a fetch(redirect: "follow") carrying it would chase the
 * chain into the return page's HTML and crash the token parsing that backs
 * the ping-recovery branch.
 */

const PORTAL_URL = "https://lumeweb.test";
const ACCOUNT_ORIGIN = "https://account.lumeweb.test";

const SERVER_SIWE_MESSAGE = [
  "portal.example wants you to sign in with your Ethereum account:",
  "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01",
  "",
  "Sign in to Lume Cloud with your wallet.",
  "",
  "URI: https://portal.example",
  "Version: 1",
  "Nonce: server-authored-nonce-42",
].join("\n");

const VERIFY_INPUT = {
  key: "0xabc",
  keyType: KEY_TYPE_ETHEREUM,
  message: SERVER_SIWE_MESSAGE,
  signature: "0xdeadbeef",
} as const;

const AUTH_COMPLETE_JSON = JSON.stringify({ token: "jwt-token-1" });
const AUTH_COMPLETE_URL =
  "https://portal.example/api/auth/complete?token=jwt-token-1&new_account=1";

/** Minimal fetch response twin — Response.url is ctor-readonly. */
function fetchResponse(options: {
  body?: string;
  headers?: HeadersInit;
  status: number;
  url?: string;
}): Response {
  return {
    headers: new Headers(options.headers ?? {}),
    ok: options.status >= 200 && options.status < 300,
    status: options.status,
    text: async () => options.body ?? "",
    url: options.url ?? "",
  } as unknown as Response;
}

/** Captured fetch calls + programmable response queue. */
function stubFetchQueue(...responses: Response[]): {
  calls: {
    body?: string;
    credentials: RequestCredentials;
    headers?: Record<string, string>;
    input: RequestInfo | URL;
  }[];
} {
  const calls: {
    body?: string;
    credentials: RequestCredentials;
    headers?: Record<string, string>;
    input: RequestInfo | URL;
  }[] = [];
  let i = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        body: init?.body as string | undefined,
        credentials: init?.credentials ?? "same-origin",
        headers: init?.headers as Record<string, string> | undefined,
        input,
      });
      const res = responses[i];
      i += 1;
      if (!res) {
        throw new TypeError("no queued response");
      }
      return res;
    }),
  );
  return { calls };
}

describe("AccountApi.keyIdentity", () => {
  let api: AccountApi;

  beforeEach(() => {
    // Production construction: portal URL → account.<host> base.
    api = new AccountApi(PORTAL_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("key types", () => {
    it("exposes the served key_type constants", () => {
      expect(KEY_TYPE_ETHEREUM).toBe("ethereum");
      expect(KEY_TYPE_SOLANA).toBe("solana");
    });
  });

  describe("challenge", () => {
    it("posts the account-origin /api/auth/key/challenge byte-exact, with {key, key_type: 'ethereum'}, no query string", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({
            message: SERVER_SIWE_MESSAGE,
            nonce: "server-authored-nonce-42",
          }),
          status: 200,
        }),
      );

      const challenge = await api.keyIdentity.challenge(
        "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01",
      );

      expect(calls).toHaveLength(1);
      expect(calls[0]!.input).toBe(`${ACCOUNT_ORIGIN}/api/auth/key/challenge`);
      expect(new URL(String(calls[0]!.input)).search).toBe("");
      expect(calls[0]!.credentials).toBe("include");
      expect(calls[0]!.headers?.["Content-Type"]).toBe("application/json");
      expect(calls[0]!.headers?.Authorization).toBeUndefined();
      expect(JSON.parse(calls[0]!.body ?? "{}")).toEqual({
        key: "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01",
        key_type: "ethereum",
      });
      // The returned message IS the server's message — never rebuilt/parsed.
      expect(challenge.message).toBe(SERVER_SIWE_MESSAGE);
      expect(challenge.nonce).toBe("server-authored-nonce-42");
    });

    it("sends an explicit non-default key_type verbatim", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({ body: JSON.stringify({ message: "m", nonce: "n" }), status: 200 }),
      );

      await api.keyIdentity.challenge("sol-key", KEY_TYPE_SOLANA);

      expect(JSON.parse(calls[0]!.body ?? "{}")).toEqual({
        key: "sol-key",
        key_type: "solana",
      });
    });

    it("404 (defensive) → KeyIdentityError with status + reason preserved", async () => {
      stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({
            error: { details: "not found", reason: "KeyNotFound" },
          }),
          status: 404,
        }),
      );

      const err = await api.keyIdentity
        .challenge("0xunknown")
        .catch((e: unknown) => e);

      expect(err).toBeInstanceOf(KeyIdentityError);
      expect((err as KeyIdentityError).status).toBe(404);
      expect((err as KeyIdentityError).reason).toBe("KeyNotFound");
      expect((err as KeyIdentityError).message).toBe(
        "Wallet challenge failed (KeyNotFound).",
      );
    });

    it("non-JSON 200 body throws SyntaxError (generated-fetcher parity)", async () => {
      stubFetchQueue(fetchResponse({ body: "<html>", status: 200 }));

      await expect(
        api.keyIdentity.challenge("0xabc"),
      ).rejects.toBeInstanceOf(SyntaxError);
    });
  });

  describe("verify", () => {
    it("posts the account-origin /api/auth/key/verify byte-exact with the {key_type, key, message, signature, remember: true} request and returns the token", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(calls).toHaveLength(1);
      expect(calls[0]!.input).toBe(`${ACCOUNT_ORIGIN}/api/auth/key/verify`);
      expect(new URL(String(calls[0]!.input)).search).toBe("");
      expect(calls[0]!.credentials).toBe("include");
      expect(JSON.parse(calls[0]!.body ?? "{}")).toEqual({
        key: "0xabc",
        key_type: "ethereum",
        message: SERVER_SIWE_MESSAGE,
        remember: true,
        signature: "0xdeadbeef",
      });
      expect(outcome).toEqual({
        kind: "token",
        newAccount: false,
        token: "jwt-token-1",
      });
    });

    it("appends the JWT Bearer header (buildOptions parity) when a token is set", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      api.setToken("existing-jwt");
      await api.keyIdentity.verify(VERIFY_INPUT);

      expect(calls[0]!.headers?.Authorization).toBe("Bearer existing-jwt");
      expect(calls[0]!.headers?.["Content-Type"]).toBe("application/json");
      api.clearToken();
    });

    it("200 JSON with new_account: true → token outcome flagged newAccount", async () => {
      stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({ new_account: true, token: "jwt-new-1" }),
          status: 200,
        }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({
        kind: "token",
        newAccount: true,
        token: "jwt-new-1",
      });
    });

    it("200 JSON with otp: true + new_account: true → otp outcome keeps the flag", async () => {
      stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({ new_account: true, otp: true, token: "pending" }),
          status: 200,
        }),
      );

      const outcome: KeyVerifyOutcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({ kind: "otp", newAccount: true });
    });

    it("followed 302 (auth-complete terminal URL on res.url carries new_account=1 + token) → token outcome flagged newAccount", async () => {
      // The fetch follows the auth-complete chain; the terminal Response.url
      // is the 302 Location with its query — where the flag rides.
      stubFetchQueue(
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200, url: AUTH_COMPLETE_URL }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({
        kind: "token",
        newAccount: true,
        token: "jwt-token-1",
      });
    });

    it("followed 302 whose final body is non-JSON (HTML auth-complete) → redirect outcome with the chain-URL flag preserved", async () => {
      stubFetchQueue(
        fetchResponse({
          body: "<!DOCTYPE html><html></html>",
          status: 200,
          url: AUTH_COMPLETE_URL,
        }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({ kind: "redirect", newAccount: true });
    });

    it("followed 302 whose final body is non-JSON and chain URL has no flag → redirect outcome, newAccount false", async () => {
      stubFetchQueue(
        fetchResponse({
          body: "<!DOCTYPE html><html></html>",
          status: 200,
          url: "https://portal.example/api/auth/complete?token=jwt-token-1",
        }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({ kind: "redirect", newAccount: false });
    });

    it("unfollowed 302 with a Location header → fetches the auth-complete URL and parses the final token", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({ headers: { location: AUTH_COMPLETE_URL }, status: 302 }),
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(String(calls[1]!.input)).toBe(AUTH_COMPLETE_URL);
      // The recovery hop stores the auth-complete Set-Cookie too.
      expect(calls[1]!.credentials).toBe("include");
      expect(outcome).toEqual({
        kind: "token",
        newAccount: true,
        token: "jwt-token-1",
      });
    });

    it("unfollowed 302 with a non-JSON auth-complete body → redirect outcome with the flag preserved", async () => {
      stubFetchQueue(
        fetchResponse({ headers: { location: AUTH_COMPLETE_URL }, status: 302 }),
        fetchResponse({ body: "<!DOCTYPE html><html>", status: 200 }),
      );

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({ kind: "redirect", newAccount: true });
    });

    it("unfollowed 302 without a Location header → defensive redirect outcome", async () => {
      const mockedFetch = vi.fn(async () => fetchResponse({ status: 302 }));
      vi.stubGlobal("fetch", mockedFetch);

      const outcome = await api.keyIdentity.verify(VERIFY_INPUT);

      expect(outcome).toEqual({ kind: "redirect", newAccount: false });
      expect(mockedFetch).toHaveBeenCalledTimes(1);
    });

    it("auth-complete final body without a token → no-token error", async () => {
      stubFetchQueue(
        fetchResponse({ body: JSON.stringify({ otp: false }), status: 200 }),
      );

      await expect(api.keyIdentity.verify(VERIFY_INPUT)).rejects.toThrow(
        "Wallet verification returned no token.",
      );
    });

    it("409 → already-linked message with reason preserved", async () => {
      stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({
            error: { details: "conflict", reason: "LinkedToAnotherAccount" },
          }),
          status: 409,
        }),
      );

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(409);
      expect(err.message).toBe(WALLET_ALREADY_LINKED_MESSAGE);
      expect(err.reason).toBe("LinkedToAnotherAccount");
    });

    it("401 InvalidLogin is a bad-proof failure — generic copy, reason preserved", async () => {
      stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({
            error: { details: "bad proof", reason: "InvalidLogin" },
          }),
          status: 401,
        }),
      );

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(401);
      expect(err.message).toBe("Wallet verification failed (InvalidLogin).");
      expect(err.reason).toBe("InvalidLogin");
    });

    it("404 (defensive) → generic copy, reason preserved", async () => {
      stubFetchQueue(
        fetchResponse({ body: JSON.stringify({ error: { reason: "KeyNotFound" } }), status: 404 }),
      );

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(404);
      expect(err.message).toBe("Wallet verification failed (KeyNotFound).");
    });

    it("non-2xx with a non-JSON body (empty 502) throws — never a redirect outcome", async () => {
      stubFetchQueue(fetchResponse({ body: "", status: 502 }));

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(502);
    });

    it("non-2xx with an HTML body (gateway error page) throws — never a redirect outcome", async () => {
      stubFetchQueue(
        fetchResponse({ body: "<h1>Bad Gateway</h1>", status: 502 }),
      );

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(502);
    });

    it("unfollowed 302 with a non-2xx non-JSON auth-complete terminal throws", async () => {
      stubFetchQueue(
        fetchResponse({ headers: { location: AUTH_COMPLETE_URL }, status: 302 }),
        fetchResponse({ body: "<h1>Server Error</h1>", status: 500 }),
      );

      const err = (await api.keyIdentity
        .verify(VERIFY_INPUT)
        .catch((e: unknown) => e)) as KeyIdentityError;

      expect(err.status).toBe(500);
    });

    it("network failures (TypeError) are rethrown, not folded into the redirect branch", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        }),
      );

      await expect(api.keyIdentity.verify(VERIFY_INPUT)).rejects.toBeInstanceOf(
        TypeError,
      );
    });
  });

  describe("session-cookie parity with the password login", () => {
    /*
     * The verify response 302s to the absolute account-origin
     * /api/auth/complete, whose handler (rootAuthComplete) sets the session
     * cookie before answering. The keyed fetch is cross-origin from the
     * dashboard page, so `credentials: "same-origin"` (the fetch default)
     * makes the browser DROP that Set-Cookie — the exact bug where the
     * wallet session never stuck while email/password did. Every key-identity
     * fetch must therefore carry `credentials: "include"` like
     * AccountApi.fetchJson does, so the chain's Set-Cookie is recorded the
     * same way (same-site subdomains of the portal root → first-party).
     */
    it("challenge and verify fetches carry credentials include on the account origin", async () => {
      const { calls } = stubFetchQueue(
        fetchResponse({
          body: JSON.stringify({ message: "m", nonce: "n" }),
          status: 200,
        }),
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      await api.keyIdentity.challenge("0xabc");
      await api.keyIdentity.verify(VERIFY_INPUT);

      expect(calls).toHaveLength(2);
      expect(calls[0]!.credentials).toBe("include");
      expect(calls[1]!.credentials).toBe("include");
      expect(calls[1]!.input).toBe(`${ACCOUNT_ORIGIN}/api/auth/key/verify`);
    });

    it("dev relative paths (loopback construction) also send credentials include", async () => {
      const devApi = new AccountApi("http://localhost:5173");
      const { calls } = stubFetchQueue(
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      await devApi.keyIdentity.verify(VERIFY_INPUT);

      expect(calls[0]!.credentials).toBe("include");
    });
  });

  describe("localhost dev convention — same-origin RELATIVE paths", () => {
    it("relative /api/auth/key/* when the API base is localhost, even with an origin-bearing portal URL around", async () => {
      const devApi = new AccountApi("http://localhost:5173");
      const { calls } = stubFetchQueue(
        fetchResponse({ body: JSON.stringify({ message: "m", nonce: "n" }), status: 200 }),
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      const challenge = await devApi.keyIdentity.challenge("0xabc");
      const outcome = await devApi.keyIdentity.verify(VERIFY_INPUT);

      expect(calls[0]!.input).toBe("/api/auth/key/challenge");
      expect(challenge.nonce).toBe("n");
      expect(calls[1]!.input).toBe("/api/auth/key/verify");
      expect(outcome.kind).toBe("token");
    });

    it("loopback IP construction pins relative too", async () => {
      const devApi = new AccountApi("http://127.0.0.1:3000");
      const { calls } = stubFetchQueue(
        fetchResponse({ body: AUTH_COMPLETE_JSON, status: 200 }),
      );

      await devApi.keyIdentity.verify(VERIFY_INPUT);

      expect(calls[0]!.input).toBe("/api/auth/key/verify");
    });
  });
});
