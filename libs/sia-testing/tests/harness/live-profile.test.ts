/** Private profile policy must reject unsafe files before any SDK or endpoint work can start. */
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspect } from "node:util";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  loadLiveProfile,
  profileDocument,
} from "../../src/testing/live/profile.js";
import type { LiveConsent } from "../../src/testing/live/types.js";
const consent: LiveConsent = {
  apiBaseUrl: "http://127.0.0.1:9191/",
  mutations: true,
  transfers: true,
};
let directory: string;
let path: string;
const document = {
  apiBaseUrl: "http://127.0.0.1:9191/",
  app: {
    description: "Owned loopback fixture",
    id: "0".repeat(64),
    name: "Live profile test",
    serviceUrl: "https://example.invalid",
  },
  auth: { appKeyHex: "07".repeat(32), kind: "app-key" },
  encoding: { dataShards: 1, maxBufferedSlabs: 1, parityShards: 0 },
  version: 1,
};
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "sia-private-profile-"));
  path = join(directory, "profile.json");
  await writeFile(path, JSON.stringify(document), { mode: 0o600 });
});
afterEach(async () => {
  await rm(directory, { force: true, recursive: true });
});
it("a private external profile stays opaque after loading", async () => {
  const profile = await loadLiveProfile(path, consent);
  expect(profileDocument(profile).auth).toEqual({
    appKeyHex: "07".repeat(32),
    kind: "app-key",
  });
  expect(JSON.stringify(profile)).not.toContain("070707");
  expect(inspect(profile)).not.toContain("070707");
  await writeFile(path, "changed");
  expect(profileDocument(profile).apiBaseUrl).toBe("http://127.0.0.1:9191/");
});
it.each([0o644, 0o660, 0o604])(
  "a profile with shared permissions %i is rejected",
  async (mode) => {
    await chmod(path, mode);
    await expect(loadLiveProfile(path, consent)).rejects.toMatchObject({
      code: "invalid-profile",
    });
  },
);
it("a final-component profile symlink is rejected", async () => {
  const alias = join(directory, "alias.json");
  await symlink(path, alias);
  await expect(loadLiveProfile(alias, consent)).rejects.toMatchObject({
    code: "invalid-profile",
  });
});
it("a multiply linked credential file is rejected", async () => {
  await link(path, join(directory, "alias.json"));
  await expect(loadLiveProfile(path, consent)).rejects.toMatchObject({
    code: "invalid-profile",
  });
});
it("a profile inside the supplied checkout is rejected", async () => {
  const checkout = join(directory, "checkout");
  await mkdir(checkout);
  const inside = join(checkout, "profile.json");
  await writeFile(inside, JSON.stringify(document), { mode: 0o600 });
  await expect(
    loadLiveProfile(inside, consent, checkout),
  ).rejects.toMatchObject({ code: "invalid-profile" });
});
it("a parent-directory symlink cannot hide a checkout profile", async () => {
  const checkout = join(directory, "checkout");
  await mkdir(checkout);
  await writeFile(join(checkout, "profile.json"), JSON.stringify(document), {
    mode: 0o600,
  });
  const alias = join(directory, "linked-directory");
  await symlink(checkout, alias, "dir");
  await expect(
    loadLiveProfile(join(alias, "profile.json"), consent, checkout),
  ).rejects.toMatchObject({ code: "invalid-profile" });
});
it("oversized profiles are rejected", async () => {
  await writeFile(path, " ".repeat(16385));
  await expect(loadLiveProfile(path, consent)).rejects.toMatchObject({
    code: "invalid-profile",
  });
});
it.each([
  { ...document, version: 2 },
  { ...document, auth: { appKeyHex: "bad-key", kind: "app-key" } },
  {
    ...document,
    auth: { connectKey: "", kind: "register", phrase: "private phrase" },
  },
  {
    ...document,
    encoding: { dataShards: 0, maxBufferedSlabs: 1, parityShards: 0 },
  },
  { ...document, limits: { deadlineMs: 0 } },
  { ...document, apiBaseUrl: "http://example.invalid/" },
  { ...document, apiBaseUrl: "https://secret:password@example.invalid/" },
])(
  "invalid profile structure is rejected without echoing credentials %#",
  async (value) => {
    await writeFile(path, JSON.stringify(value));
    const failure: unknown = await loadLiveProfile(path, consent).catch(
      (error: unknown) => error,
    );
    expect(failure).toMatchObject({ code: "invalid-profile" });
    expect(String(failure)).not.toContain("private phrase");
    expect(String(failure)).not.toContain("password");
  },
);
it("missing mutation consent is rejected before opening a path", async () => {
  await expect(
    loadLiveProfile(join(directory, "missing"), {
      ...consent,
      mutations: false,
    } as unknown as LiveConsent),
  ).rejects.toMatchObject({ code: "consent-required" });
});
it("a profile cannot change the consented endpoint", async () => {
  await expect(
    loadLiveProfile(path, { ...consent, apiBaseUrl: "http://127.0.0.1:9192/" }),
  ).rejects.toMatchObject({ code: "consent-required" });
});
it.each([
  {
    connectKey: "synthetic-connect-key",
    kind: "register",
    phrase: "synthetic private phrase",
  },
  {
    kind: "preauthorized",
    phrase: "synthetic private phrase",
    preauthorizedKeyHex: "08".repeat(32),
  },
])(
  "registration authorities stay inside the opaque profile %#",
  async (auth) => {
    await writeFile(path, JSON.stringify({ ...document, auth }));
    const profile = await loadLiveProfile(path, consent);
    expect(profileDocument(profile).auth).toEqual(auth);
    expect(JSON.stringify(profile)).not.toContain("synthetic");
  },
);
