/** Checks compiler mutations independently of source formatting. */
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { expect, it } from "vitest";
import {
  modelMutations,
  mutateModelSource,
} from "../../scripts/model-mutations.mjs";

const source = await readFile("src/model/index.ts", "utf8");

it.each(modelMutations)(
  "applies $name after formatting changes",
  ({ name }) => {
    const formatted = ts
      .createPrinter({ newLine: ts.NewLineKind.CarriageReturnLineFeed })
      .printFile(
        ts.createSourceFile("model.ts", source, ts.ScriptTarget.Latest, true),
      );
    const result = mutateModelSource(source, name);
    expect(mutateModelSource(formatted, name)).toBe(result);
    expect(result).not.toBe(source);
    expect(
      ts.transpileModule(result, { reportDiagnostics: true }).diagnostics,
    ).toEqual([]);
  },
);

it("rejects a mutation whose target is missing", () => {
  expect(() =>
    mutateModelSource("export const unrelated = 1;", modelMutations[0]!.name),
  ).toThrow("expected one target, found 0");
});

it("rejects an ambiguous mutation target", () => {
  expect(() =>
    mutateModelSource(`${source}\n${source}`, modelMutations[0]!.name),
  ).toThrow("expected one target, found 2");
});

it("rejects an unknown mutation", () => {
  expect(() => mutateModelSource(source, "unknown")).toThrow(
    "unknown mutation",
  );
});
