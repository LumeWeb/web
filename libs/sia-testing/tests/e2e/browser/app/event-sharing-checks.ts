/** Checks deployed event cursors and detach behavior using actual pinned payloads. */
import { PinnedObject, type Sdk, SharedSdk } from "@siafoundation/sia-storage";
import { byteSource, readBytes } from "../../support/byte-streams.js";

type EventCursor = NonNullable<Parameters<Sdk["objectEvents"]>[0]>;

export async function browserDeletionEvent(sdk: Sdk, fixture: PinnedObject) {
  await publishedEvents(sdk, undefined, 1);
  const live = (await eventPage(sdk, undefined, 1, true))[0];
  if (!live) throw new Error("Live browser event was not published");
  await sdk.deleteObject(fixture.id());
  const cursor = { after: new Date(live.updatedAt), id: live.id };
  const deleted = (await publishedEvents(sdk, cursor, 1))[0];
  if (!deleted) throw new Error("Browser deletion event was not published");
  const exhausted = await eventPage(
    sdk,
    { after: new Date(deleted.updatedAt), id: deleted.id },
    1,
  );
  let missing = false;
  try {
    const found = await sdk.object(fixture.id());
    found.free();
  } catch (error) {
    if (!String(error).includes("404")) throw error;
    missing = true;
  }
  return { deleted, exhausted, fixtureID: fixture.id(), live, missing };
}

export async function browserDetach(
  sdk: Sdk,
  fixture: PinnedObject,
  indexdURL: string,
) {
  fixture.updateMetadata(Uint8Array.of(7, 0, 255, 4));
  await sdk.updateObjectMetadata(fixture);
  const key = await sdk.createSharingKey("browser detach");
  let recipient: SharedSdk | undefined;
  let stale: Awaited<ReturnType<Sdk["sharingKey"]>> | undefined;
  let current: Awaited<ReturnType<Sdk["sharingKey"]>> | undefined;
  try {
    await sdk.shareObject(key, fixture);
    stale = await sdk.sharingKey(key);
    const ownerList = await sdk.sharedObjects(key, 0, 1);
    let ownerBefore;
    try {
      ownerBefore = await Promise.all(
        ownerList.map(async (object) => ({
          bytes: await readBytes(sdk, object),
          id: object.id(),
          metadata: [...object.metadata()],
          size: object.size(),
        })),
      );
    } finally {
      for (const object of ownerList) object.free();
    }
    const ownerTail = await sdk.sharedObjects(key, 1, 1);
    const ownerExhausted = ownerTail.map((object) => object.id());
    for (const object of ownerTail) object.free();
    recipient = await SharedSdk.connect(indexdURL, key.seed());
    const shared = recipient;
    const list = await shared.objects(0, 1);
    let before;
    try {
      before = await Promise.all(
        list.map(async (object) => ({
          bytes: await readBytes(shared, object),
          id: object.id(),
          metadata: [...object.metadata()],
          size: object.size(),
        })),
      );
    } finally {
      for (const object of list) object.free();
    }
    const tail = await recipient.objects(1, 1);
    const exhausted = tail.map((object) => object.id());
    for (const object of tail) object.free();
    await sdk.unshareObject(key, fixture.id());
    const ownerDetached = await sdk.sharedObjects(key, 0, 1);
    const ownerAfter = ownerDetached.map((object) => object.id());
    for (const object of ownerDetached) object.free();
    const detached = await recipient.objects(0, 1);
    const after = detached.map((object) => object.id());
    for (const object of detached) object.free();
    let missing = false;
    try {
      const found = await recipient.object(fixture.id());
      found.free();
    } catch (error) {
      if (!String(error).includes("404")) throw error;
      missing = true;
    }
    current = await sdk.sharingKey(key);
    const owner = await sdk.object(fixture.id());
    try {
      return {
        after,
        before,
        currentCount: current.stats.objectCount,
        exhausted,
        fixtureID: fixture.id(),
        missing,
        ownerAfter,
        ownerBefore,
        ownerBytes: await readBytes(sdk, owner),
        ownerExhausted,
        ownerMetadata: [...owner.metadata()],
        staleCount: stale.stats.objectCount,
      };
    } finally {
      owner.free();
    }
  } finally {
    current?.free();
    stale?.free();
    recipient?.free();
    key.free();
  }
}

export async function browserEventPages(sdk: Sdk, fixture: PinnedObject) {
  fixture.updateMetadata(Uint8Array.of(1, 0, 255));
  await sdk.updateObjectMetadata(fixture);
  const input = new PinnedObject();
  input.updateMetadata(Uint8Array.of(2, 0, 255));
  // WASM upload consumes input, including when its promise rejects.
  const second = await sdk.upload(input, byteSource([8, 7]));
  try {
    await sdk.pinObject(second);
    await publishedEvents(sdk, undefined, 2);
    const head = (await eventPage(sdk, undefined, 1, true))[0];
    if (!head) throw new Error("First browser event was not published");
    const fromZero = await eventPage(
      sdk,
      { after: new Date(head.updatedAt), id: "0".repeat(64) },
      1,
    );
    const tail = (
      await eventPage(
        sdk,
        { after: new Date(head.updatedAt), id: head.id },
        1,
        true,
      )
    )[0];
    if (!tail) throw new Error("Second browser event was not published");
    const exhausted = await eventPage(
      sdk,
      { after: new Date(tail.updatedAt), id: tail.id },
      1,
    );
    return {
      exhausted,
      fixtureID: fixture.id(),
      fromZero: fromZero.map((row) => row.id),
      head,
      secondID: second.id(),
      tail,
    };
  } finally {
    second.free();
  }
}

/** Checks owner-only routes even when another account has the valid sharing seed. */
export async function browserOwnerIsolation(
  sdk: Sdk,
  fixture: PinnedObject,
  indexdURL: string,
  foreign: Sdk,
) {
  const key = await sdk.createSharingKey("browser owner isolation");
  let recipient: SharedSdk | undefined;
  try {
    await sdk.shareObject(key, fixture);
    const recordDenied = await missingOwnerResource(async () => {
      const record = await foreign.sharingKey(key);
      record.free();
    });
    const listDenied = await missingOwnerResource(async () => {
      const objects = await foreign.sharedObjects(key, 0, 1);
      for (const object of objects) object.free();
    });
    // SDK maps a detach HTTP 404 to its ObjectNotAttached error.
    const detachDenied = await missingOwnerResource(
      () => foreign.unshareObject(key, fixture.id()),
      "object is not attached to the sharing key",
    );
    const listed = await sdk.sharedObjects(key, 0, 1);
    const ownerIDs = listed.map((object) => object.id());
    for (const object of listed) object.free();
    const record = await sdk.sharingKey(key);
    let ownerCount;
    try {
      ownerCount = record.stats.objectCount;
    } finally {
      record.free();
    }
    const foreignRecords = await foreign.sharingKeys(0, 10);
    const foreignCount = foreignRecords.length;
    for (const foreignRecord of foreignRecords) foreignRecord.free();
    const foreignAccount = await foreign.account();
    const ownerAccount = await sdk.account();
    recipient = await SharedSdk.connect(indexdURL, key.seed());
    const scoped = recipient;
    const objects = await scoped.objects(0, 1);
    let recipientBytes: number[] = [];
    try {
      if (objects[0]) recipientBytes = await readBytes(scoped, objects[0]);
    } finally {
      for (const object of objects) object.free();
    }
    return {
      apps: [ownerAccount.app.id, foreignAccount.app.id],
      detachDenied,
      fixtureID: fixture.id(),
      foreignCount,
      foreignPinnedData: foreignAccount.pinnedData,
      foreignPinnedSize: foreignAccount.pinnedSize,
      listDenied,
      ownerBytes: await readBytes(sdk, fixture),
      ownerCount,
      ownerIDs,
      recipientBytes,
      recordDenied,
    };
  } finally {
    recipient?.free();
    key.free();
  }
}

async function eventPage(
  sdk: Sdk,
  cursor: EventCursor | undefined,
  limit: number,
  download = false,
) {
  const events = await sdk.objectEvents(cursor, limit);
  const rows = [];
  try {
    for (const event of events) {
      const object = event.object;
      try {
        rows.push({
          deleted: event.deleted,
          id: event.id,
          object: object
            ? {
                bytes: download ? await readBytes(sdk, object) : [],
                id: object.id(),
                metadata: [...object.metadata()],
                size: object.size(),
              }
            : null,
          updatedAt: event.updatedAt.getTime(),
        });
      } finally {
        object?.free();
      }
    }
    return rows;
  } finally {
    for (const event of events) event.free();
  }
}

/** Keeps network and signature failures from passing as ownership rejection. */
async function missingOwnerResource(
  run: () => Promise<void>,
  expected = "404",
) {
  try {
    await run();
    return false;
  } catch (error) {
    if (!String(error).includes(expected)) throw error;
    return true;
  }
}

async function publishedEvents(
  sdk: Sdk,
  cursor: EventCursor | undefined,
  count: number,
) {
  const deadline = Date.now() + 5000;
  while (true) {
    const rows = await eventPage(sdk, cursor, 10);
    if (rows.length === count) return rows;
    if (Date.now() >= deadline)
      throw new Error(
        `Expected ${count} published object events, received ${rows.length}`,
      );
    // Indexd hides the current event second so later writes cannot invalidate cursors.
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
