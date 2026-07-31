/**
 * LBRY Wallet SDK — browser-friendly library for LBRY protocol wallet operations.
 *
 * ## Modules
 *
 * - **wasm/** — Go-WASM loader (TinyGo) for crypto operations (signing, key management)
 * - **wallet/** — Wallet manager (create/import/derive addresses)
 * - **tx/** — Transaction builder, fee estimator, and broadcaster
 * - **mempool/** — Mempool.lbry.org REST + WebSocket client
 * - **claims/** — LBRY claims (channel, stream, collection, repost) API
 * - **storage/** — Encrypted wallet storage via IndexedDB + WebCrypto AES-256-GCM
 * - **guardrails/** — Input validation and transaction review guardrails
 *
 * @module @lumeweb/lbry-sdk
 */

export * from "@/wasm";
export * from "@/mempool";
export * from "@/wallet";
export * from "@/tx";
export * from "@/claims";
export * from "@/storage";
export * from "@/guardrails";
