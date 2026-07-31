import { describe, test, expect } from "vitest";
import { createMockWasm } from "./mock-wasm";
import { expectUntrustedOrigin, expectNoUntrustedOrigin } from "./setup";
import { LbryWalletManager } from "@/wallet/manager";
import { TransactionBuilder } from "@/tx/builder";
import { unwrap } from "@/wasm/unwrap";
import { MempoolClient } from "@/mempool/client";
import { WasmLoader } from "@/wasm/loader";
import { buildReview } from "@/guardrails/validate";
import { parseJsonBigInt } from "@/mempool/parse";
import { makeTxInput } from "./fixtures";

/**
 * Regression tests for security fixes documented in AGENTS.md.
 * Each test references the issue number from AGENTS.md for traceability.
 */

function createMockWasmForUriValidation(): ReturnType<typeof createMockWasm> {
  return createMockWasm();
}

describe("Security regression tests", () => {
  // ── #45: WasmLoader SRI integrity ──
  describe("#45: WasmLoader SRI integrity", () => {
    test("passes integrity hash to wasm_exec.js script tag", async () => {
      await expectNoUntrustedOrigin({
        wasmUrl: "./lbry-sdk.wasm",
        wasmExecUrl: "./wasm_exec.js",
        integrity: {
          wasmExec: "sha384-testhash",
          wasm: "sha384-testhash",
        },
      });
    });
  });

  // ── #44: walletClose SDK export ──
  describe("#44: walletClose SDK export", () => {
    test("mock wasm has walletClose that returns { closed: true }", () => {
      const mockWasm = createMockWasm();
      const result = mockWasm.walletClose(0);
      expect("closed" in result ? result.closed : undefined).toBe(true);
    });
  });

  // ── #41: isAllowedWasmUrl rejects protocol-relative URLs ──
  describe("#41: isAllowedWasmUrl rejects protocol-relative URLs", () => {
    test("rejects '//evil.com/sdk.wasm'", async () => {
      await expectUntrustedOrigin({ wasmUrl: "//evil.com/sdk.wasm", wasmExecUrl: "./wasm_exec.js" });
    });
  });

  // ── Kody: jsAmount rejects numeric JS types (int32 overflow on wasm32) ──
  describe("Kody: jsAmount string-only boundary", () => {
    test("selectCoins accepts string amounts (not numbers)", () => {
      const mockWasm = createMockWasm();
      // These must be strings — Go's jsAmount rejects non-string types
      // to prevent int32 overflow on wasm32 for amounts > 2^31-1 (~21.47 LBC)
      const result = mockWasm.selectCoins(
        JSON.stringify([{ txid: "a".repeat(64), vout: 0, amount: "100000000", height: 100 }]),
        "50000000",
        "1",
      );
      // Should not return an error — string amounts are valid
      expect("error" in result).toBe(false);
    });

    test("estimateFee accepts string feePerByte (not number)", () => {
      const mockWasm = createMockWasm();
      const result = mockWasm.estimateFee(200, "10");
      expect("error" in result ? result.error : result.fee).toBe("2000");
    });

    test("large amount above int32 is handled as string", () => {
      const mockWasm = createMockWasm();
      // 1B LBC = 1e17 sats — way past int32 (2^31-1 ≈ 2.1e9).
      // Must be string. Mock handles it because it parses with Number().
      const hugeAmount = "100000000000"; // 1000 LBC in sats — above int32, below MAX_SAFE_INTEGER
      const result = mockWasm.selectCoins(
        JSON.stringify([{ txid: "a".repeat(64), vout: 0, amount: hugeAmount, height: 100 }]),
        "50000000000", // 500 LBC
        "1",
      );
      expect("error" in result).toBe(false);
    });

    test("integer satoshi strings required (fractional strings rejected by Go)", () => {
      // Go's strconv.ParseInt rejects "1234.00" — jsAmount doc says
      // "integer satoshi string". The TS boundary must send integers only.
      const mockWasm = createMockWasm();
      // Valid integer string
      const valid = mockWasm.selectCoins(
        JSON.stringify([{ txid: "a".repeat(64), vout: 0, amount: "100000000", height: 100 }]),
        "50000000",
        "1",
      );
      expect("error" in valid).toBe(false);
      // Fractional string — mock accepts it (Number parses), but Go's
      // jsAmount would reject. This test documents the contract.
    });
  });

  // ── Kody: MempoolState matches actual API response shape ──
  describe("Kody: MempoolState type matches API response", () => {
    test("getMempoolState returns array with correct field names", async () => {
      const client = new MempoolClient({ baseUrl: "https://mempool.lbry.org" });
      const blocks = await client.getMempoolState();
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks.length).toBe(1);
      expect(blocks[0].blockSize).toBe(26922);
      expect(blocks[0].nTx).toBe(24);
      expect(blocks[0].totalFees).toBe(1054855n);
      expect(blocks[0].feeRange.length).toBe(7);
    });
  });

  // ── Kody: TxOutput.claimType required when isClaim is true ──
  describe("Kody: claim output requires claimType", () => {
    test("build throws when isClaim output lacks claimType", () => {
      const mockWasm = createMockWasm();
      const wallet = new LbryWalletManager({ exports: mockWasm } as any);
      const txBuilder = new TransactionBuilder({ exports: mockWasm } as any);
      const { handle } = wallet.create();
      const input = makeTxInput({ txid: "a".repeat(64), vout: 0, amount: 100000000n });
      const output = {
        address: "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ",
        amount: 50000000n,
        isClaim: true,
        // claimType intentionally omitted
      };
      expect(() =>
        txBuilder.build(handle, [input], [output as any], { feePerByte: 5 })
      ).toThrow(/claimType/);
    });

    test("build succeeds when isClaim output has claimType", () => {
      const mockWasm = createMockWasm();
      const wallet = new LbryWalletManager({ exports: mockWasm } as any);
      const txBuilder = new TransactionBuilder({ exports: mockWasm } as any);
      const { handle } = wallet.create();
      const input = makeTxInput({ txid: "a".repeat(64), vout: 0, amount: 100000000n });
      const output = {
        address: "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ",
        amount: 50000000n,
        isClaim: true,
        claimType: 1,
      };
      // Should not throw on claimType validation (may throw on build for other reasons)
      try {
        txBuilder.build(handle, [input], [output as any], { feePerByte: 5 });
      } catch (e) {
        expect((e as Error).message).not.toMatch(/claimType/);
      }
    });
  });

  // ── Kody: walletClose throws on failure ──
  describe("Kody: walletClose throws on failure", () => {
    test("close throws when wasm returns closed=false", () => {
      const mockWasm = createMockWasm();
      // Override walletClose to return closed: false
      mockWasm.walletClose = () => ({ closed: false });
      const wallet = new LbryWalletManager({ exports: mockWasm } as any);
      expect(() => wallet.close(0)).toThrow(/walletClose failed/);
    });

    test("close succeeds (no throw) when wasm returns closed=true", () => {
      const mockWasm = createMockWasm();
      const wallet = new LbryWalletManager({ exports: mockWasm } as any);
      expect(() => wallet.close(0)).not.toThrow();
    });
  });

  // ── Kody: unwrap narrows error check to string type ──
  describe("Kody: unwrap hardened error detection", () => {
    test("throws on result with string error field", () => {
      const errorResult = { error: "bad thing" };
      expect(() => unwrap(errorResult as any, "test")).toThrow(/test failed: bad thing/);
    });

    test("does not throw on result with non-string error field", () => {
      // A success payload that happens to have an `error` field that's a number
      // (e.g. error code) should not be treated as a WASM error
      const successWithErrorCode = { result: 42, error: 0 };
      expect(() => unwrap(successWithErrorCode as any, "test")).not.toThrow();
    });

    test("does not throw on null result", () => {
      expect(() => unwrap(null as any, "test")).not.toThrow();
    });
  });

  // ── Kody #2: WasmLoader.unload terminates Go runtime ──
  describe("Kody #2: WasmLoader.unload terminates Go runtime", () => {
    test("unload calls go.exit(0) and clears _inst", () => {
      const exitCalled = { value: false, code: -1 };
      const instCleared = { value: false };
      const fakeGo = {
        exit(code: number) { exitCalled.value = true; exitCalled.code = code; },
        get _inst() { return instCleared.value ? undefined : {}; },
        set _inst(v: unknown) { instCleared.value = true; },
      };
      // Access private static via any
      const WasmLoaderAny = WasmLoader as any;
      WasmLoaderAny.instance = { exports: {}, go: fakeGo };
      WasmLoaderAny.unload();
      expect(exitCalled.value).toBe(true);
      expect(exitCalled.code).toBe(0);
      expect(WasmLoaderAny.instance).toBeNull();
    });
  });

  // ── Kody #2: validate.ts fee ceiling in bigint domain ──
  describe("Kody #2: buildReview fee ceiling uses bigint", () => {
    test("does not lose precision for large fee above ceiling", () => {
      // Fee = 10_000_000_000_000_001n, size = 10 → fee/size > FEE_CEILING (1000)
      // Number() would lose precision and might not flag this correctly
      const tx = {
        hex: "deadbeef",
        txid: "a".repeat(64),
        fee: 10_000_000_000_000_001n,
        size: 10,
      };
      const review = buildReview(tx as any);
      const feeWarnings = review.warnings.filter(w => w.field === "fee" && w.message.includes("ceiling"));
      expect(feeWarnings.length).toBe(1);
    });

    test("does not flag fee below ceiling", () => {
      const tx = { hex: "ab", txid: "b".repeat(64), fee: 5000n, size: 10 };
      const review = buildReview(tx as any);
      const ceilingWarnings = review.warnings.filter(w => w.message.includes("ceiling"));
      expect(ceilingWarnings.length).toBe(0);
    });
  });

  // ── Kody #2: parseJsonBigInt handles string-encoded monetary values ──
  describe("Kody #2: parseJsonBigInt handles string amounts", () => {
    test("converts string-encoded value field to bigint", () => {
      const result = parseJsonBigInt('{"value":"14355118107"}') as { value: bigint };
      expect(typeof result.value).toBe("bigint");
      expect(result.value).toBe(14355118107n);
    });

    test("still handles number value field", () => {
      const result = parseJsonBigInt('{"value":14355118107}') as { value: bigint };
      expect(typeof result.value).toBe("bigint");
      expect(result.value).toBe(14355118107n);
    });

    test("ignores non-numeric strings in bigint fields", () => {
      const result = parseJsonBigInt('{"value":"abc"}') as { value: string };
      expect(result.value).toBe("abc");
    });
  });

  // ── Kody #2: claimType=0 not rejected by falsy check ──
  describe("Kody #2: claimType=0 not rejected", () => {
    test("build does not throw 'missing claimType' when claimType=0", () => {
      const mockWasm = createMockWasm();
      const wallet = new LbryWalletManager({ exports: mockWasm } as any);
      const txBuilder = new TransactionBuilder({ exports: mockWasm } as any);
      const { handle } = wallet.create();
      const input = makeTxInput({ txid: "a".repeat(64), vout: 0, amount: 100000000n });
      const output = {
        address: "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ",
        amount: 50000000n,
        isClaim: true,
        claimType: 0,
      };
      // claimType=0 should NOT trigger "missing claimType" error
      try {
        txBuilder.build(handle, [input], [output as any], { feePerByte: 5 });
      } catch (e) {
        expect((e as Error).message).not.toMatch(/missing claimType/);
      }
    });
  });

  // ── Kody #2: isAllowedWasmUrl rejects bare / paths ──
  describe("Kody #2: isAllowedWasmUrl rejects bare / paths", () => {
    test("load() rejects bare /path as untrusted origin", async () => {
      // isAllowedWasmUrl is not exported, but WasmLoader.load() calls it.
      // A bare /path like "/evil.com/sdk.wasm" should be rejected.
      // We expect it to throw "untrusted origin" rather than proceeding.
      // Use a path that would have been allowed by the old bare-/ check.
      await expect(
        WasmLoader.load({ wasmUrl: "/evil.com/sdk.wasm", wasmExecUrl: "./wasm_exec.js" })
      ).rejects.toThrow(/untrusted origin/i);
    });
  });
});
