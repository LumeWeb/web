import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type KeyChallenge,
  KeyIdentityError,
  type KeyVerifyOutcome,
  WALLET_ALREADY_LINKED_MESSAGE,
} from "@lumeweb/portal-sdk";
import { encodeBase58 } from "@/wallet/base58";
import type { DetectedWallet } from "@/wallet/detect";
import type { SolanaProvider } from "@/wallet/solana";
import { useWalletLogin } from "./useWalletLogin";

const SERVER_SIWE_MESSAGE =
  "portal.example wants you to sign in with your Ethereum account:\n0xabc\n\nNonce: n-1";

const SOLANA_MESSAGE =
  "portal.example wants you to sign in with your Solana account:\nBase58Pubkey1111\n\nNonce: n-2";

const ADDRESS = "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01";
const SOLANA_PUBKEY = "Base58Pubkey1111";
const SOLANA_SIGNATURE_BYTES = new Uint8Array(64).fill(1);

// wagmi core actions are used imperatively (no React context).
const mockConnect = vi.fn();
const mockGetAccount = vi.fn();
const mockGetConnectors = vi.fn();
const mockSignMessage = vi.fn();

vi.mock("@wagmi/core", () => ({
  connect: (...args: unknown[]) => mockConnect(...args),
  getAccount: (...args: unknown[]) => mockGetAccount(...args),
  getConnectors: (...args: unknown[]) => mockGetConnectors(...args),
  signMessage: (...args: unknown[]) => mockSignMessage(...args),
}));

const mockPing = vi.fn();
const mockSetAuthToken = vi.fn();
const mockChallenge = vi.fn();
const mockVerify = vi.fn();
const fakeSdk = {
  account: () => ({
    keyIdentity: { challenge: mockChallenge, verify: mockVerify },
    ping: mockPing,
  }),
  setAuthToken: mockSetAuthToken,
};

vi.mock("@lumeweb/portal-framework-ui", () => ({
  useSdk: () => fakeSdk,
}));

const mockGo = vi.fn();
const mockSearchParams = vi.fn<() => [URLSearchParams]>(() => [
  new URLSearchParams(),
]);
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );
  return { ...actual, useSearchParams: (...args: unknown[]) =>
      mockSearchParams(...(args as [])) };
});

vi.mock("@refinedev/core", async () => {
  const actual = await vi.importActual<typeof import("@refinedev/core")>(
    "@refinedev/core",
  );
  return { ...actual, useGo: () => mockGo };
});

vi.mock("@/wallet/config", () => ({
  getWagmiConfig: () => ({ wagmi: "config" }),
}));

/** SDK key-identity namespace is mocked at the fakeSdk boundary above. */
const mockedChallenge = mockChallenge;
const mockedVerify = mockVerify;

/** EVM detection result whose rdns matches a wagmi injected connector. */
const EVM_WALLET: DetectedWallet = {
  id: "io.metamask",
  name: "MetaMask",
  network: "ethereum",
  provider: { request: vi.fn() },
};

function solanaWallet(
  provider: Partial<SolanaProvider>,
): DetectedWallet {
  return {
    address: SOLANA_PUBKEY,
    id: "phantom",
    name: "Phantom",
    network: "solana",
    provider,
  };
}

// Default: a wallet is already connected and exposes the account.
const connectedEvmAccount = () => {
  mockGetAccount.mockReturnValue({ address: ADDRESS, chainId: 1 });
  mockGetConnectors.mockReturnValue([{ id: "io.metamask", type: "injected" }]);
};

function setupTokenSuccess() {
  mockedChallenge.mockResolvedValue({
    message: SERVER_SIWE_MESSAGE,
    nonce: "n-1",
  } as KeyChallenge);
  mockedVerify.mockResolvedValue({
    kind: "token",
    newAccount: false,
    token: "jwt-wallet-1",
  } as KeyVerifyOutcome);
  mockSignMessage.mockResolvedValue("0xsigned");
}

describe("useWalletLogin — served key-identity login flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.mockReturnValue([new URLSearchParams()]);
    mockConnect.mockResolvedValue(undefined);
    connectedEvmAccount();
  });

  function render() {
    return renderHook(() => useWalletLogin());
  }

  async function run(wallet: DetectedWallet = EVM_WALLET): Promise<unknown> {
    let thrown: unknown = null;
    const hook = render();
    await act(async () => {
      try {
        await hook.result.current.signInWith(wallet);
      } catch (e) {
        thrown = e;
      }
    });
    return thrown;
  }

  it("signs the server-authored message VERBATIM (no client-side message assembly) and captures the token", async () => {
    setupTokenSuccess();
    const thrown = await run();

    expect(thrown).toBeNull();
    expect(mockedChallenge).toHaveBeenCalledWith(ADDRESS, "ethereum");
    expect(mockedVerify).toHaveBeenCalledWith({
      key: ADDRESS,
      keyType: "ethereum",
      message: SERVER_SIWE_MESSAGE,
      signature: "0xsigned",
    });
    expect(mockSignMessage).toHaveBeenCalledWith(expect.anything(), {
      message: SERVER_SIWE_MESSAGE,
    });
    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-wallet-1");
  });

  it("token success → authCheckSuccess plumbing + sanitized ?to= redirect", async () => {
    setupTokenSuccess();
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fsettings")]);

    await run();

    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-wallet-1");
    expect(mockGo).toHaveBeenCalledWith({ to: "/settings", type: "replace" });
  });

  it("token success without ?to= → /dashboard", async () => {
    setupTokenSuccess();

    await run();

    expect(mockGo).toHaveBeenCalledWith({ to: "/dashboard", type: "replace" });
  });

  it("new account without usable ?to= → routes to /dashboard", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({
      kind: "token",
      newAccount: true,
      token: "jwt-new-1",
    });

    await run();

    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-new-1");
    expect(mockGo).toHaveBeenCalledWith({ to: "/dashboard", type: "replace" });
  });

  it("new account with an explicit ?to= chain → the chain wins over the /dashboard fallback", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({
      kind: "token",
      newAccount: true,
      token: "jwt-new-1",
    });
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fapp%2Fcallback%3Fstate%3D1")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({
      to: "/app/callback?state=1",
      type: "replace",
    });
  });

  it("new account with a rejected ?to= (unsanitizable) → /dashboard, not the rejected target", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({
      kind: "token",
      newAccount: true,
      token: "jwt-new-1",
    });
    mockSearchParams.mockReturnValue([new URLSearchParams("to=https%3A%2F%2Fevil.example.com%2Fphish")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({ to: "/dashboard", type: "replace" });
  });

  it("existing account with ?to= keeps the old plain redirect", async () => {
    setupTokenSuccess();
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fdashboard")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({ to: "/dashboard", type: "replace" });
  });

  it("otp: true → redirects to /otp?to=… exactly like password login (sanitize then single-encode)", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "otp", newAccount: false });
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fsettings")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({
      to: `/otp?to=${encodeURIComponent("/settings")}`,
      type: "replace",
    });
    // No session is stored on the OTP branch — /otp completes it.
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("otp outcome with new_account: true and an explicit ?to= → /otp with the chain preserved byte-for-byte", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "otp", newAccount: true });
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fapp%2Fcb")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({
      to: `/otp?to=${encodeURIComponent("/app/cb")}`,
      type: "replace" as const,
    });
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("otp outcome with new_account: true and no ?to= → /otp chained to /dashboard", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "otp", newAccount: true });

    await run();

    expect(mockGo).toHaveBeenCalledWith({
      to: `/otp?to=${encodeURIComponent("/dashboard")}`,
      type: "replace" as const,
    });
  });

  it("302 redirect outcome → session recovered via ping and token stored", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "redirect", newAccount: false });
    mockPing.mockResolvedValue({
      data: { token: "jwt-from-cookie-session" },
      success: true,
    });

    await run();

    expect(mockPing).toHaveBeenCalled();
    expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-from-cookie-session");
  });

  it("302 redirect outcome for a new account → ping recovery, then /dashboard", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "redirect", newAccount: true });
    mockPing.mockResolvedValue({
      data: { token: "jwt-from-cookie-session" },
      success: true,
    });

    await run();

    expect(mockPing).toHaveBeenCalled();
    expect(mockGo).toHaveBeenCalledWith({ to: "/dashboard", type: "replace" });
  });

  it("302 redirect outcome for an existing account → ping then the ?to= chain", async () => {
    setupTokenSuccess();
    mockedVerify.mockResolvedValue({ kind: "redirect", newAccount: false });
    mockPing.mockResolvedValue({
      data: { token: "jwt-from-cookie-session" },
      success: true,
    });
    mockSearchParams.mockReturnValue([new URLSearchParams("to=%2Fsettings")]);

    await run();

    expect(mockGo).toHaveBeenCalledWith({ to: "/settings", type: "replace" });
  });

  it("409 at verify (already linked to another account) → actionable error, no session stored", async () => {
    mockedChallenge.mockResolvedValue({
      message: SERVER_SIWE_MESSAGE,
      nonce: "n-1",
    });
    mockedVerify.mockRejectedValue(
      new KeyIdentityError(409, WALLET_ALREADY_LINKED_MESSAGE, "LinkedToAnotherAccount"),
    );

    const thrown = await run();

    expect(thrown).toBeInstanceOf(KeyIdentityError);
    expect((thrown as KeyIdentityError).message).toBe(
      WALLET_ALREADY_LINKED_MESSAGE,
    );
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("connects the EVM wallet first when none is connected (rdns-matched wagmi connector)", async () => {
    setupTokenSuccess();
    mockGetAccount
      .mockReturnValueOnce({ address: undefined, chainId: undefined })
      .mockReturnValue({ address: ADDRESS, chainId: 1 });
    mockGetConnectors.mockReturnValue([
      { id: "injected", type: "injected" },
      { id: "io.metamask", type: "injected" },
    ]);

    await run();

    expect(mockConnect).toHaveBeenCalledWith(expect.anything(), {
      connector: expect.objectContaining({ id: "io.metamask" }),
    });
  });

  describe("Solana path (key_type: solana)", () => {
    it("signs the utf8-encoded challenge via the injected provider and posts a base58 signature with key_type solana", async () => {
      const provider: Partial<SolanaProvider> = {
        publicKey: { toString: () => SOLANA_PUBKEY },
        signMessage: vi.fn().mockResolvedValue(SOLANA_SIGNATURE_BYTES),
      };
      mockedChallenge.mockResolvedValue({
        message: SOLANA_MESSAGE,
        nonce: "n-2",
      });
      mockedVerify.mockResolvedValue({ kind: "token", newAccount: false, token: "jwt-solana-1" });

      const thrown = await run(solanaWallet(provider));

      expect(thrown).toBeNull();
      // Phantom convention: signMessage(bytes, "utf8") over the verbatim
      // server message.
      expect(provider.signMessage).toHaveBeenCalledWith(
        new TextEncoder().encode(SOLANA_MESSAGE),
        "utf8",
      );
      expect(mockSignMessage).not.toHaveBeenCalled(); // wagmi path untouched
      expect(mockedChallenge).toHaveBeenCalledWith(SOLANA_PUBKEY, "solana");
      expect(mockedVerify).toHaveBeenCalledWith({
        key: SOLANA_PUBKEY,
        keyType: "solana",
        message: SOLANA_MESSAGE,
        signature: encodeBase58(SOLANA_SIGNATURE_BYTES),
      });
      expect(mockSetAuthToken).toHaveBeenCalledWith("jwt-solana-1");
    });

    it("unwraps a {signature: bytes} provider response", async () => {
      const provider: Partial<SolanaProvider> = {
        signMessage: vi
          .fn()
          .mockResolvedValue({ signature: SOLANA_SIGNATURE_BYTES }),
      };
      mockedChallenge.mockResolvedValue({
        message: SOLANA_MESSAGE,
        nonce: "n-2",
      });
      mockedVerify.mockResolvedValue({ kind: "token", newAccount: false, token: "jwt-solana-1" });

      const thrown = await run(solanaWallet(provider));

      expect(thrown).toBeNull();
      expect(mockedVerify).toHaveBeenCalledWith(
        expect.objectContaining({
          signature: encodeBase58(SOLANA_SIGNATURE_BYTES),
        }),
      );
    });

    it("fails with a clear error when the wallet exposes no account", async () => {
      const provider: Partial<SolanaProvider> = {
        signMessage: vi.fn(),
      };

      const thrown = await run({
        address: undefined,
        id: "phantom",
        name: "Phantom",
        network: "solana",
        provider,
      });

      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toBe("Wallet did not expose an account.");
      expect(mockedChallenge).not.toHaveBeenCalled();
    });
  });
});
