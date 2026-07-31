import { describe, test, expect, beforeAll } from "vitest";
import { setupWasmExports } from "./setup";
import { unwrap } from "@/wasm/unwrap";
import { MOCK_UTXOS } from "./fixtures";

let wasm: Awaited<ReturnType<typeof setupWasmExports>>;

beforeAll(async () => {
  wasm = await setupWasmExports();
}, 30000);

describe("WASM coinselect", () => {
  test("selects single UTXO that covers target exactly", () => {
    const result = unwrap(
      wasm.selectCoins(
        JSON.stringify(MOCK_UTXOS),
        (100000000).toString(), // exactly 1 LBC
        (1).toString(), // 1 sat/byte fee
      ),
      "selectCoins",
    );
    expect(result.selected).toBeDefined();
    expect((result.selected as unknown[]).length).toBeGreaterThan(0);
    // Verify all Go return fields are present
    expect(result.total).toBeDefined();
    expect(result.effective).toBeDefined();
    expect(result.waste).toBeDefined();
    expect(result.exactMatch).toBeDefined();
    // effective = total - fees, must be less than total
    expect(BigInt(result.effective)).toBeLessThanOrEqual(BigInt(result.total));
  });

  test("selects multiple UTXOs when one isn't enough", () => {
    const result = unwrap(
      wasm.selectCoins(
        JSON.stringify(MOCK_UTXOS),
        (120000000).toString(), // 1.2 LBC — needs both UTXOs
        (1).toString(),
      ),
      "selectCoins",
    );
    expect(result.selected).toBeDefined();
    expect((result.selected as unknown[]).length).toBeGreaterThanOrEqual(2);
    expect(BigInt(result.total)).toBeGreaterThanOrEqual(120000000n);
  });

  test("rejects insufficient funds", () => {
    const result = wasm.selectCoins(
      JSON.stringify(MOCK_UTXOS),
      (200000000).toString(), // 2 LBC — more than available
      (1).toString(),
    );
    expect("error" in result).toBe(true);
  });

  test("handles dust amounts", () => {
    const result = unwrap(
      wasm.selectCoins(
        JSON.stringify(MOCK_UTXOS),
        (546).toString(), // dust threshold
        (1).toString(),
      ),
      "selectCoins",
    );
    expect(result.selected).toBeDefined();
  });

  test("handles empty UTXO set", () => {
    const result = wasm.selectCoins(
      JSON.stringify([]),
      (100000).toString(),
      (1).toString(),
    );
    expect("error" in result).toBe(true);
  });

  test("accounts for fee per byte", () => {
    const lowFeeResult = unwrap(
      wasm.selectCoins(
        JSON.stringify(MOCK_UTXOS),
        (99000000).toString(),
        (1).toString(),
      ),
      "selectCoins",
    );
    expect(lowFeeResult.selected).toBeDefined();

    const highFeeResult = unwrap(
      wasm.selectCoins(
        JSON.stringify(MOCK_UTXOS),
        (99000000).toString(),
        (100).toString(),
      ),
      "selectCoins",
    );
    expect(highFeeResult.selected).toBeDefined();
    // Both should succeed but high-fee might select extra UTXO
  });
});
