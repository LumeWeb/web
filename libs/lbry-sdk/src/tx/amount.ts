/**
 * Amount helpers — convert between number and string representations of
 * monetary amounts (satoshis).
 *
 * Go's WASM types emit `string` for Amount/int64 fields to preserve
 * precision over JSON serialization. These helpers bridge the gap between
 * JS arithmetic (which prefers number/bigint) and WASM expectations.
 *
 * @module @lumeweb/lbry-sdk/tx/amount
 */

/**
 * Normalise a monetary value to the bigint representation.
 *
 * Accepts either a bigint (pass-through), a string (converted via BigInt),
 * or a number (converted via BigInt to avoid floating-point precision loss).
 *
 * @param v - The value as a bigint, number, or string
 * @returns The value as a bigint
 */
export function amt(v: bigint | string | number): bigint {
  if (typeof v === "bigint") return v;
  return BigInt(v);
}

/**
 * Convert a bigint amount to the string representation expected by WASM.
 *
 * This is the inverse of {@link amt}. Use this when passing bigint values
 * across the WASM boundary (JSON.stringify, WASM function params).
 *
 * @param v - The bigint value
 * @returns The value as a decimal string
 */
export function amtToStr(v: bigint): string {
  return v.toString();
}

/**
 * Compute inputs − outputs as a bigint fee.
 *
 * Both operands may be bigints, strings, or numbers. The subtraction is
 * performed in the integer domain via BigInt so that large int64 values
 * are handled without precision loss.
 *
 * @param inputTotal - Sum of input amounts
 * @param outputTotal - Sum of output amounts
 * @returns inputTotal − outputTotal as a bigint
 * @throws {RangeError} When outputTotal exceeds inputTotal (negative fee)
 */
export function feeFromTotals(
  inputTotal: bigint | string | number,
  outputTotal: bigint | string | number,
): bigint {
  const fee = BigInt(inputTotal) - BigInt(outputTotal);
  if (fee < 0) {
    throw new RangeError(
      `Outputs exceed inputs: in=${inputTotal} out=${outputTotal} fee=${fee}`,
    );
  }
  return fee;
}

/**
 * Sum an array of amounts (bigints, strings, or numbers) into a bigint.
 *
 * @param amounts - Array of amount values
 * @returns The total as a bigint
 */
export function sumAmounts(amounts: (bigint | string | number)[]): bigint {
  let total = 0n;
  for (const a of amounts) {
    total += BigInt(a);
  }
  return total;
}

/**
 * Divide two amounts, returning a number.
 *
 * Useful for computing fee rates (fee / size) where fee is a bigint
 * but the result needs to be a number for comparison.
 *
 * @param numerator - The fee (bigint)
 * @param denominator - The size (number)
 * @returns The quotient as a number
 */
export function divAmount(numerator: bigint, denominator: number): number {
  return Number(numerator) / denominator;
}
