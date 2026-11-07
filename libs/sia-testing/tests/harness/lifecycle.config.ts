/** Separate runner invocation keeps intentional failures out of the ordinary suite. */
import { writeFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import type { Reporter, TestCase, Vitest } from "vitest/node";

export class FailureMessages implements Reporter {
  cases: { errors: string[]; name: string; project: string }[] = [];
  logs: string[] = [];
  runner: undefined | Vitest;
  onInit(runner: Vitest) { this.runner = runner; }
  onTestCaseResult(test: TestCase) {
    if (test.name.startsWith("subject")) {
      this.cases.push({ errors: test.result().errors?.flatMap(messages) ?? [], name: test.fullName, project: test.project.name });
    }
  }
  onTestRunEnd(...[modules, errors]: Parameters<NonNullable<Reporter["onTestRunEnd"]>>) {
    if (process.env.SIA_FAILURE_MESSAGES) {
      writeFileSync(process.env.SIA_FAILURE_MESSAGES, JSON.stringify({
        errors: [...errors, ...modules.flatMap(module => module.errors())].flatMap(messages),
        logs: this.logs,
        tests: this.cases,
      }));
    }
  }
  onUserConsoleLog(log: Parameters<NonNullable<Reporter["onUserConsoleLog"]>>[0]) {
    this.logs.push(log.content);
    if (process.env.SIA_LIFECYCLE_CASE === "runner" && log.content.includes("REQUEST_RUN_CANCELLATION")) {
      void this.runner?.cancelCurrentRun("keyboard-input");
    }
  }
}
/** AggregateError members and causes can retain distinct source cancellation failures. */
function messages(error: unknown): string[] {
  if (!error || typeof error !== "object") return [String(error)];
  const value = error as { cause?: unknown; errors?: unknown[]; message?: string };
  return [value.message ?? "", ...(value.errors ?? []).flatMap(messages), ...(value.cause ? messages(value.cause) : [])];
}
export default defineConfig({ test: {
  fileParallelism: false, include: ["tests/harness/cases/lifecycle.case.ts"],
  reporters: ["json", new FailureMessages()],
} });
