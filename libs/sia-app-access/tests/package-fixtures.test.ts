/** Consumer type programs must not depend on an earlier access build. */
import { test } from "node:test";
import { checkSourceFixtures } from "./package/packed-package.ts";

void test(
  "package consumer fixtures typecheck against source without emitted declarations",
  { timeout: 120000 },
  checkSourceFixtures,
);
