import { constants as fsConstants } from "node:fs";
import * as fs from "node:fs/promises";
import { readdir, readFile, stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { createNodePayloadOwner } from "../../src/testing/node-payload-store.js";

const limits = {
  maxLogicalUploadBytes: 64,
  maxObjectBytes: 32,
  maxRetainedBytes: 64,
  maxUploadAttempts: 3,
};

describe("owned temporary payloads", () => {
  it("appends real bytes, finishes immutable authority and retires the original file", async () => {
    const owner = await createNodePayloadOwner(limits);
    try {
      const reservation = owner.reserveUpload(6);
      const spool = await reservation.admitSource(6);
      await spool.append(new Uint8Array([97, 98]));
      await spool.append(new Uint8Array([99]));
      const token = await spool.finish();
      reservation.release();
      expect(token.length).toBe(3);
      expect(token.sha256).toBe(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      );
      expect(Object.isFrozen(token)).toBe(true);
      expect(Object.keys(token).sort()).toEqual(["length", "sha256"]);
      expect(() => owner.prepareAdoption({ ...token })).toThrow();
      owner.prepareAdoption(token)();
      const files = await readdir(owner.root);
      expect(files).toHaveLength(1);
      expect((await stat(owner.root)).mode & 0o777).toBe(0o700);
      expect((await stat(`${owner.root}/${files[0]}`)).mode & 0o777).toBe(
        0o600,
      );
      expect(await readFile(`${owner.root}/${files[0]}`)).toEqual(
        Buffer.from("abc"),
      );
      const reader = await owner.openReader(token, 1, 1);
      expect(await reader.read()).toEqual(new Uint8Array([98]));
      expect(await reader.read()).toBeNull();
      await reader.close();
      await owner.retire(token);
      expect(await readdir(owner.root)).toEqual([]);
      expect(owner.resources()).toMatchObject({
        attempts: 1,
        entries: 0,
        readers: 0,
        retainedBytes: 0,
        writers: 0,
      });
    } finally {
      await owner.close();
    }
  });

  it("reserves capacity and writer before admission and spends empty source attempts", async () => {
    const owner = await createNodePayloadOwner({
      ...limits,
      maxUploadAttempts: 2,
    });
    try {
      const reservation = owner.reserveUpload(32);
      expect(() => owner.reserveUpload(1)).toThrow();
      for (let i = 0; i < 2; i++) {
        const spool = await reservation.admitSource(0);
        const token = await spool.finish();
        expect(owner.resources().entries).toBe(1);
        await owner.retire(token);
      }
      await expect(reservation.admitSource(0)).rejects.toThrow();
      expect(owner.resources().attempts).toBe(2);
      reservation.release();
      expect(owner.resources().retainedBytes).toBe(0);
    } finally {
      await owner.close();
    }
  });

  it("rejects foreign token authority and bounds reader leases per run", async () => {
    const owner = await createNodePayloadOwner(limits);
    const other = await createNodePayloadOwner(limits);
    try {
      const reservation = owner.reserveUpload(1);
      const spool = await reservation.admitSource(1);
      await spool.append(new Uint8Array([7]));
      const token = await spool.finish();
      reservation.release();
      expect(() => other.prepareAdoption(token)).toThrow();
      const a = await owner.openReader(token, 0, 1);
      const b = await owner.openReader(token, 0, 1);
      await expect(owner.openReader(token, 0, 1)).rejects.toThrow();
      await owner.retire(token);
      await expect(a.read()).rejects.toThrow();
      await expect(b.read()).rejects.toThrow();
      expect(owner.resources().readers).toBe(0);
    } finally {
      await Promise.all([owner.close(), other.close()]);
    }
  });
});

it("keeps unlink residue charged, remembers the original failure and never retries", async () => {
  const failure = new Error("unlink failure");
  let calls = 0;
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    unlink() {
      calls++;
      return Promise.reject(failure);
    },
  });
  try {
    const reservation = owner.reserveUpload(0);
    const spool = await reservation.admitSource(0);
    const token = await spool.finish();
    reservation.release();
    await expect(owner.retire(token)).rejects.toBe(failure);
    await expect(owner.retire(token)).rejects.toBe(failure);
    await expect(owner.drain()).rejects.toMatchObject({ errors: [failure] });
    await expect(owner.close()).rejects.toThrow("residue");
    expect(calls).toBe(1);
    expect(owner.resources()).toMatchObject({ entries: 1, retainedBytes: 0 });
    expect(await readdir(owner.root)).toHaveLength(1);
  } finally {
    // The injected failure deliberately prevents library removal.
    for (const name of await readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it("retains uncertain writer leases and fail-stops only its own run", async () => {
  const failure = new Error("close uncertain");
  const handles: fs.FileHandle[] = [];
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    async open(...args: Parameters<typeof fs.open>) {
      const handle = await fs.open(...args);
      handles.push(handle);
      return new Proxy(handle, {
        get(target, key) {
          if (key === "close") return () => Promise.reject(failure);
          const value: unknown = Reflect.get(target, key);
          return typeof value === "function"
            ? (value as (...args: unknown[]) => unknown).bind(target)
            : value;
        },
      });
    },
  });
  const other = await createNodePayloadOwner(limits);
  try {
    const reservation = owner.reserveUpload(2);
    const spool = await reservation.admitSource(2);
    await spool.append(new Uint8Array([1]));
    await expect(spool.finish()).rejects.toBe(failure);
    expect(() => reservation.release()).toThrow();
    expect(() => owner.reserveUpload(0)).toThrow();
    expect(owner.resources()).toMatchObject({
      entries: 1,
      retainedBytes: 2,
      stopped: true,
      writers: 1,
    });
    other.reserveUpload(0).release();
    await expect(owner.close()).rejects.toThrow("uncertain");
  } finally {
    await other.close();
    for (const handle of handles) await handle.close();
    for (const name of await readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it.each([undefined, NaN])(
  "cannot finish a spool after a failed actual write with original rejection %s",
  async (failure) => {
    const owner = await createNodePayloadOwner(limits, {
      ...fs,
      async open(...args: Parameters<typeof fs.open>) {
        const handle = await fs.open(...args);
        return new Proxy(handle, {
          get(target, key) {
            // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Non-Error values are the filesystem rejections under test.
            if (key === "write") return () => Promise.reject(failure);
            const value: unknown = Reflect.get(target, key);
            return typeof value === "function"
              ? (value as (...args: unknown[]) => unknown).bind(target)
              : value;
          },
        });
      },
    });
    try {
      const reservation = owner.reserveUpload(2);
      const spool = await reservation.admitSource(2);
      await expect(spool.append(new Uint8Array([1]))).rejects.toBe(failure);
      await expect(spool.finish()).rejects.toBe(failure);
      await spool.discard();
      reservation.release();
    } finally {
      await owner.close();
    }
  },
);

it("snapshots an append before blocked short writes and rejects oversized backing storage", async () => {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let writes = 0;
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    async open(...args: Parameters<typeof fs.open>) {
      const handle = await fs.open(...args);
      return new Proxy(handle, {
        get(target, key) {
          if (key === "write")
            return async (
              block: Uint8Array,
              offset: number,
              length: number,
              position: number,
            ) => {
              writes++;
              if (writes === 1) {
                entered();
                await held;
              }
              return target.write(block, offset, Math.min(1, length), position);
            };
          const value: unknown = Reflect.get(target, key);
          return typeof value === "function"
            ? (value as (...args: unknown[]) => unknown).bind(target)
            : value;
        },
      });
    },
  });
  let writing: Promise<void> | undefined;
  try {
    const reservation = owner.reserveUpload(3);
    const spool = await reservation.admitSource(3);
    await expect(
      spool.append(new Uint8Array(new ArrayBuffer(65537), 0, 1)),
    ).rejects.toThrow();
    const source = new Uint8Array([97, 98, 99]);
    writing = spool.append(source);
    void writing.catch(() => undefined);
    await started;
    source.fill(0);
    expect(writes).toBe(1);
    release();
    await writing;
    const token = await spool.finish();
    reservation.release();
    expect(writes).toBe(3);
    expect(token.sha256).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    const reader = await owner.openReader(token, 0, 3);
    expect(await reader.read()).toEqual(new Uint8Array([97, 98, 99]));
    await reader.close();
  } finally {
    release();
    await writing;
    await owner.close();
  }
});

it("keeps descriptor-open work owned through retirement", async () => {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const events: string[] = [];
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    async open(...args: Parameters<typeof fs.open>) {
      const handle = await fs.open(...args);
      if ((Number(args[1]) & fsConstants.O_WRONLY) === 0) {
        entered();
        await held;
        return new Proxy(handle, {
          get(target, key) {
            if (key === "close")
              return async () => {
                await target.close();
                events.push("reader closed");
              };
            const value: unknown = Reflect.get(target, key);
            return typeof value === "function"
              ? (value as (...args: unknown[]) => unknown).bind(target)
              : value;
          },
        });
      }
      return handle;
    },
    async unlink(path) {
      events.push("unlink");
      await fs.unlink(path);
    },
  });
  let opening: Promise<unknown> | undefined;
  let retiring: Promise<void> | undefined;
  try {
    const reservation = owner.reserveUpload(0);
    const spool = await reservation.admitSource(0);
    const token = await spool.finish();
    reservation.release();
    opening = owner.openReader(token, 0, 0);
    void opening.catch(() => undefined);
    await started;
    retiring = owner.retire(token);
    void retiring.catch(() => undefined);
    // An actual filesystem round trip observes whether retirement bypassed the owned open.
    await stat(owner.root);
    await stat(owner.root);
    release();
    await expect(opening).rejects.toThrow("retired");
    await retiring;
    expect(events).toEqual(["reader closed", "unlink"]);
  } finally {
    release();
    await Promise.allSettled([opening, retiring]);
    await owner.close();
  }
});

it("joins other readers after uncertain close and retains the failed descriptor without retry", async () => {
  const failure = new Error("reader close uncertain");
  const actualHandles: fs.FileHandle[] = [];
  let closeCalls = 0;
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    async open(...args: Parameters<typeof fs.open>) {
      const handle = await fs.open(...args);
      if ((Number(args[1]) & fsConstants.O_WRONLY) !== 0) return handle;
      actualHandles.push(handle);
      if (actualHandles.length !== 1) return handle;
      return new Proxy(handle, {
        get(target, key) {
          if (key === "close")
            return () => {
              closeCalls++;
              return Promise.reject(failure);
            };
          const value: unknown = Reflect.get(target, key);
          return typeof value === "function"
            ? (value as (...args: unknown[]) => unknown).bind(target)
            : value;
        },
      });
    },
  });
  try {
    const reservation = owner.reserveUpload(0);
    const token = await (await reservation.admitSource(0)).finish();
    reservation.release();
    const first = await owner.openReader(token, 0, 0);
    const second = await owner.openReader(token, 0, 0);
    await expect(first.close()).rejects.toBe(failure);
    await expect(owner.openReader(token, 0, 0)).rejects.toThrow("uncertain");
    await expect(owner.retire(token)).rejects.toMatchObject({
      errors: [failure],
    });
    await second.close();
    expect(owner.resources()).toMatchObject({
      entries: 1,
      readers: 1,
      stopped: true,
    });
    await expect(owner.close()).rejects.toThrow("uncertain");
    expect(closeCalls).toBe(1);
  } finally {
    // The first handle remains physically open because its injected close rejected.
    await actualHandles[0]?.close();
    for (const name of await readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it("does not reuse failed-unlink physical capacity and still removes independent entries", async () => {
  const failure = new Error("first unlink failed");
  let calls = 0;
  const owner = await createNodePayloadOwner(
    { ...limits, maxObjectBytes: 4, maxRetainedBytes: 4 },
    {
      ...fs,
      unlink(path) {
        calls++;
        return calls === 1 ? Promise.reject(failure) : fs.unlink(path);
      },
    },
  );
  try {
    const reservation = owner.reserveUpload(3);
    const spool = await reservation.admitSource(3);
    await spool.append(new Uint8Array([1, 2, 3]));
    const token = await spool.finish();
    reservation.release();
    await expect(owner.retire(token)).rejects.toBe(failure);
    expect(() => owner.reserveUpload(2)).toThrow();
    expect(owner.resources().attempts).toBe(1);
    const next = owner.reserveUpload(1);
    const second = await next.admitSource(1);
    await second.append(new Uint8Array([4]));
    await second.finish();
    next.release();
    await expect(owner.close()).rejects.toThrow("residue");
    expect(calls).toBe(2);
    expect(owner.resources()).toMatchObject({
      entries: 1,
      readers: 0,
      retainedBytes: 3,
      writers: 0,
    });
    expect(await readdir(owner.root)).toHaveLength(1);
  } finally {
    for (const name of await readdir(owner.root))
      await fs.unlink(`${owner.root}/${name}`);
    await fs.rmdir(owner.root);
  }
});

it("spends a failed file-creation attempt and joins it without trying to unlink a nonexistent file", async () => {
  let release!: () => void;
  let entered!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let unlinks = 0;
  const owner = await createNodePayloadOwner(limits, {
    ...fs,
    async open(path) {
      entered();
      await held;
      return fs.open(path, fsConstants.O_WRONLY);
    },
    async unlink(path) {
      unlinks++;
      await fs.unlink(path);
    },
  });
  let admission: Promise<unknown> | undefined;
  let closing: Promise<void> | undefined;
  try {
    const reservation = owner.reserveUpload(1);
    admission = reservation.admitSource(1);
    void admission.catch(() => undefined);
    await started;
    closing = owner.close();
    void closing.catch(() => undefined);
    release();
    await expect(admission).rejects.toMatchObject({ code: "ENOENT" });
    await closing;
    expect(unlinks).toBe(0);
    expect(owner.resources()).toMatchObject({
      attempts: 1,
      entries: 0,
      retainedBytes: 0,
      writers: 0,
    });
  } finally {
    release();
    await Promise.allSettled([admission, closing]);
    await fs.rmdir(owner.root).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
});

it("returns confirmed discarded capacity to an idle packed reservation without refunding its source attempt", async () => {
  const owner = await createNodePayloadOwner(limits);
  try {
    const reservation = owner.reserveUpload(3);
    const first = await reservation.admitSource(3);
    await first.append(new Uint8Array([1]));
    await first.discard();
    expect(owner.resources()).toMatchObject({
      attempts: 1,
      entries: 0,
      retainedBytes: 3,
    });
    const second = await reservation.admitSource(3);
    await second.append(new Uint8Array([2, 3]));
    const token = await second.finish();
    owner.prepareAdoption(token)();
    reservation.release();
    expect(owner.resources()).toMatchObject({
      attempts: 2,
      entries: 1,
      retainedBytes: 2,
    });
    await owner.retire(token);
    expect(owner.resources().retainedBytes).toBe(0);
  } finally {
    await owner.close();
  }
});

it("checks intrinsic view capacity instead of caller-overridden byte properties", async () => {
  const owner = await createNodePayloadOwner(limits);
  try {
    const reservation = owner.reserveUpload(0);
    const spool = await reservation.admitSource(0);
    const input = new Uint8Array(65537);
    Object.defineProperties(input, {
      buffer: { value: new ArrayBuffer(0) },
      byteLength: { value: 0 },
    });
    await expect(spool.append(input)).rejects.toThrow("limit");
    await spool.discard();
    reservation.release();
  } finally {
    await owner.close();
  }
});

it("removes its fresh empty root if permission setup fails", async () => {
  let root = "";
  try {
    await expect(
      createNodePayloadOwner(limits, {
        ...fs,
        async chmod(path) {
          root = String(path);
          await fs.chmod(`${root}/missing`, 0o700);
        },
      }),
    ).rejects.toMatchObject({ code: "ENOENT" });
    await expect(stat(root)).rejects.toMatchObject({ code: "ENOENT" });
  } finally {
    if (root)
      await fs.rmdir(root).catch((error: unknown) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      });
  }
});
