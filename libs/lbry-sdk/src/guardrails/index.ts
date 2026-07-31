/**
 * Guardrails module — input validation and transaction review.
 *
 * Provides validation functions for addresses, amounts, and fee rates,
 * plus a transaction review builder for pre-broadcast safety checks.
 *
 * @module @lumeweb/lbry-sdk/guardrails
 */

export {
  validateAddress,
  validateAmount,
  validateFeeRate,
  assertFinite,
  buildReview,
  DUST_THRESHOLD,
  FEE_FLOOR,
  FEE_CEILING,
} from "@/guardrails/validate";
export type { ReviewResult, ReviewWarning } from "@/guardrails/validate";
