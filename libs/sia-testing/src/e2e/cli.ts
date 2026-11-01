#!/usr/bin/env node
/**
 * Starts the guarded consumer-test executable.
 * Passing this entrypoint's path lets the guardian restart the same command in
 * the consumer's directory without depending on a checkout-relative script.
 */
import { fileURLToPath } from "node:url";
import { commandMain } from "./internal/run-command.mjs";
process.exitCode = await commandMain(
  process.argv.slice(2),
  fileURLToPath(import.meta.url),
);
