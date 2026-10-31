#!/usr/bin/env node
/** Runs consumer tests under the inherited Linux cluster lease. */
import { fileURLToPath } from "node:url";
import { commandMain } from "./internal/run-command.mjs";
process.exitCode = await commandMain(process.argv.slice(2), fileURLToPath(import.meta.url));
