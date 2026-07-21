import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { describe, expect, it, afterEach } from "vitest";
import { collectMarkdownFiles } from "./index.js";

describe("collectMarkdownFiles", () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("collects md/mdx files recursively", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirects-"));
    fs.mkdirSync(path.join(tmpDir, "sub"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "a.md"), "# A");
    fs.writeFileSync(path.join(tmpDir, "sub", "b.mdx"), "# B");

    const files = await collectMarkdownFiles(tmpDir);
    expect(files).toHaveLength(2);
    expect(files.map((f) => path.basename(f)).sort()).toEqual([
      "a.md",
      "b.mdx",
    ]);
  });

  it("skips symlinks pointing outside contentDir", async () => {
    // Regression: symlinks outside contentDir must not be collected
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirects-"));
    const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), "outside-"));
    fs.writeFileSync(path.join(outsideDir, "secret.md"), "# Secret");

    fs.writeFileSync(path.join(tmpDir, "legit.md"), "# Legit");
    fs.symlinkSync(
      path.join(outsideDir, "secret.md"),
      path.join(tmpDir, "leak.md")
    );

    const files = await collectMarkdownFiles(tmpDir);
    expect(files).toHaveLength(1);
    expect(path.basename(files[0])).toBe("legit.md");

    fs.rmSync(outsideDir, { recursive: true, force: true });
  });

  it("allows symlinks pointing inside contentDir", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirects-"));
    fs.mkdirSync(path.join(tmpDir, "sub"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, "sub", "target.md"), "# Target");
    fs.symlinkSync(
      path.join(tmpDir, "sub", "target.md"),
      path.join(tmpDir, "link.md")
    );

    const files = await collectMarkdownFiles(tmpDir);
    expect(files).toHaveLength(2);
  });

  it("prevents cyclic symlink infinite recursion", async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "redirects-"));
    fs.mkdirSync(path.join(tmpDir, "a"), { recursive: true });
    fs.symlinkSync(path.join(tmpDir, "a"), path.join(tmpDir, "a", "cycle"));
    fs.writeFileSync(path.join(tmpDir, "a", "file.md"), "# File");

    // Should not hang or throw
    const files = await collectMarkdownFiles(tmpDir);
    expect(files).toHaveLength(1);
    expect(path.basename(files[0])).toBe("file.md");
  });
});
