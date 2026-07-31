/**
 * JSON parsing with bigint support for monetary fields.
 *
 * The mempool API returns satoshi amounts as JSON numbers. When the JSON
 * response contains values above Number.MAX_SAFE_INTEGER (≈9e15 sats ≈ 90M LBC),
 * the standard `JSON.parse` loses precision because it creates a JS `number`.
 *
 * This module intercepts the raw JSON text and converts monetary `value` fields
 * to `bigint` before the number coercion happens, ensuring exact int64 precision.
 *
 * @module @lumeweb/lbry-sdk/mempool/parse
 */

/**
 * Fields that contain satoshi amounts and must be parsed as bigint.
 *
 * These are the field names used by the mempool REST API for monetary values.
 * Not exhaustive — add new fields here as the SDK grows.
 */
const BIGINT_FIELDS = new Set([
  "value",
  "fee",
  "totalFees",
  "total_fee",
]);

/**
 * Parse a JSON string with bigint-aware field conversion.
 *
 * Any field whose name is in {@link BIGINT_FIELDS} and whose value is a
 * number or numeric string is converted to `bigint`. All other fields are
 * parsed normally.
 *
 * @param text - Raw JSON text from an HTTP response
 * @returns Parsed object with monetary fields as `bigint`
 *
 * @example
 * ```ts
 * const utxos = parseJsonBigInt('[{"txid":"abc","value":14355118107}]');
 * // utxos[0].value === 14355118107n
 * ```
 */
export function parseJsonBigInt(text: string): unknown {
  return JSON.parse(text, (key, value) => {
    if (
      BIGINT_FIELDS.has(key) &&
      (typeof value === "number" ||
        (typeof value === "string" && /^-?\d+$/.test(value)))
    ) {
      return BigInt(value);
    }
    return value;
  });
}
