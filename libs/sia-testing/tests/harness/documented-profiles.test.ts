/** Public profile examples must pass the private-file parser without starting the SDK. */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import {
  loadLiveProfile,
  profileDocument,
} from "../../src/testing/live/profile.js";

test("all documented authentication profiles parse with the stated defaults", async () => {
  const markdown = await readFile("docs/live-auth.md", "utf8");
  const examples = [
    ...markdown.matchAll(/```json profile=([^\s]+)\n([\s\S]*?)\n```/g),
  ];
  expect(examples.map((match) => match[1])).toEqual([
    "app-key",
    "register",
    "preauthorized",
  ]);
  const directory = await mkdtemp(join(tmpdir(), "sia-doc-profiles-"));
  try {
    for (const [, kind, source] of examples) {
      const path = join(directory, `${kind}.json`);
      const input = JSON.parse(source!) as Record<string, unknown>;
      const consent = {
        apiBaseUrl: "https://indexd.example.invalid/",
        mutations: true,
        transfers: true,
      } as const;
      await writeFile(path, source!, { mode: 0o600 });
      const complete = profileDocument(await loadLiveProfile(path, consent));
      expect(complete.auth.kind).toBe(kind);
      expect(complete.limits).toEqual({
        cleanupDeadlineMs: 30000,
        deadlineMs: 120000,
        maxDecodedDownloadBytes: 33554432,
        maxLogicalUploadBytes: 16777216,
        maxObjects: 8,
        maxObservedShardBytes: 67108864,
        maxShares: 8,
      });
      delete input.limits;
      await writeFile(path, JSON.stringify(input), { mode: 0o600 });
      expect(
        profileDocument(await loadLiveProfile(path, consent)).limits,
      ).toEqual(complete.limits);
      await expect(
        loadLiveProfile(path, {
          ...consent,
          apiBaseUrl: "https://other.example.invalid/",
        }),
      ).rejects.toMatchObject({ code: "consent-required" });
    }
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
