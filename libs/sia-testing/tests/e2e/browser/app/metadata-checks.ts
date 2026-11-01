/** Exercises sharing metadata without creating host slabs or transferring payload bytes. */
import {
  type KeyRecord,
  PinnedObject,
  type Sdk,
  SharedSdk,
} from "@siafoundation/sia-storage";

interface Handle {
  free(): void;
}
type Own = <T extends Handle>(handle: T) => T;

export async function deployedHostPages(sdk: Sdk) {
  const all = await sdk.hosts({ limit: 500 });
  if (all.length < 3)
    throw new Error("Deployed host paging needs at least three usable hosts");
  if (all.some((host) => host.countryCode === "ZZ"))
    throw new Error("Deployed country fixture must exclude ZZ");
  const first = await sdk.hosts({ limit: 2, offset: 0 });
  const second = await sdk.hosts({ limit: 2, offset: 2 });
  const exhausted = await sdk.hosts({ limit: 1, offset: all.length });
  const absentCountry = await sdk.hosts({ country: "ZZ", limit: 2 });
  return {
    absentCountry: absentCountry.map((host) => host.publicKey),
    all: all.map((host) => host.publicKey),
    exhausted: exhausted.map((host) => host.publicKey),
    first: first.map((host) => host.publicKey),
    quic: all.every((host) =>
      host.addresses.some((address) => address.protocol === "quic"),
    ),
    second: second.map((host) => host.publicKey),
  };
}

export async function recipientHostQueries(sdk: Sdk, indexdURL: string) {
  return withHandles(async (own) => {
    const key = own(await sdk.createSharingKey("empty recipient host scope"));
    const recipient = own(await SharedSdk.connect(indexdURL, key.seed()));
    // This service returns usable hosts even when the key has no attached objects.
    const ownerHosts = await sdk.hosts({ limit: 2 });
    const hosts = await recipient.hosts({ limit: 2 });
    const filteredOwner = await sdk.hosts({ country: "DE", limit: 1 });
    const filtered = await recipient.hosts({ country: "DE", limit: 1 });
    const stats = await recipient.stats();
    await sdk.revokeSharingKey(key);
    let revoked = false;
    try {
      await recipient.hosts();
    } catch (error) {
      if (!String(error).includes("401")) throw error;
      revoked = true;
    }
    return {
      filtered: filtered.map((host) => host.publicKey),
      filteredOwner: filteredOwner.map((host) => host.publicKey),
      hosts: hosts.map((host) => host.publicKey),
      objectCount: stats.objectCount,
      ownerHosts: ownerHosts.map((host) => host.publicKey),
      revoked,
    };
  });
}

export async function rejectSlabFreePin(sdk: Sdk) {
  return withHandles(async (own) => {
    const object = own(new PinnedObject());
    object.updateMetadata(Uint8Array.of(7, 0, 255, 4));
    const slabs = object.slabs();
    if (object.size() !== 0 || slabs.length !== 0)
      throw new Error("Empty fixture unexpectedly has host slabs");
    let pinRejected = false;
    try {
      await sdk.pinObject(object);
    } catch (error) {
      if (!/400.*object must have at least one slab/s.test(String(error)))
        throw error;
      pinRejected = true;
    }
    let lookupRejected = false;
    try {
      own(await sdk.object(object.id()));
    } catch (error) {
      if (!String(error).includes("404")) throw error;
      lookupRejected = true;
    }
    return {
      lookupRejected,
      pinRejected,
      size: object.size(),
      slabs: slabs.length,
    };
  });
}

/** Checks account ownership while both clients use the same app ID. */
export async function sameAppSharingIsolation(
  first: Sdk,
  second: Sdk,
  indexdURL: string,
) {
  return withHandles(async (own) => {
    const a = await first.account();
    const b = await second.account();
    const firstKey = own(await first.createSharingKey("first account"));
    const secondKey = own(await second.createSharingKey("second account"));
    const keys = (records: KeyRecord[]) =>
      records.map((record) => {
        own(record);
        return own(record.key).publicKey;
      });
    const firstKeys = keys(await first.sharingKeys(0, 10));
    const secondKeys = keys(await second.sharingKeys(0, 10));
    const deniedRecord = await rejectsMissing(async () => {
      own(await second.sharingKey(firstKey));
    });
    const deniedList = await rejectsMissing(async () => {
      for (const object of await second.sharedObjects(firstKey, 0, 1))
        own(object);
    });
    const deniedRevoke = await rejectsMissing(() =>
      second.revokeSharingKey(firstKey),
    );
    const firstDescription = own(await first.sharingKey(firstKey)).description;
    const recipient = own(await SharedSdk.connect(indexdURL, firstKey.seed()));
    const objectCount = (await recipient.stats()).objectCount;
    await first.revokeSharingKey(firstKey);
    let firstRevoked = false;
    try {
      await recipient.stats();
    } catch (error) {
      if (!String(error).includes("401")) throw error;
      firstRevoked = true;
    }
    const secondDescription = own(
      await second.sharingKey(secondKey),
    ).description;
    const afterFirst = await first.account();
    const afterSecond = await second.account();
    return {
      accounts: [a.accountKey, b.accountKey],
      apps: [a.app.id, b.app.id],
      deniedList,
      deniedRecord,
      deniedRevoke,
      firstDescription,
      firstKey: firstKey.publicKey,
      firstKeys,
      firstRevoked,
      objectCount,
      pinned: [
        afterFirst.pinnedData,
        afterFirst.pinnedSize,
        afterSecond.pinnedData,
        afterSecond.pinnedSize,
      ],
      secondDescription,
      secondKey: secondKey.publicKey,
      secondKeys,
    };
  });
}

export async function sharingKeyPages(sdk: Sdk) {
  return withHandles(async (own) => {
    const keys = [];
    for (const description of ["old", "middle", "new"])
      keys.push(own(await sdk.createSharingKey(description)));
    const row = (record: KeyRecord) => {
      own(record);
      return {
        count: record.stats.objectCount,
        description: record.description,
        key: own(record.key).publicKey,
      };
    };
    const middle = keys[1];
    if (!middle) throw new Error("Sharing key fixture was not created");
    return {
      detail: row(await sdk.sharingKey(middle)),
      exhausted: (await sdk.sharingKeys(3, 1)).map(row),
      expectedKeys: keys.map((key) => key.publicKey),
      first: (await sdk.sharingKeys(0, 2)).map(row),
      second: (await sdk.sharingKeys(2, 2)).map(row),
    };
  });
}

/** Unknown transport failures must not count as missing owner resources. */
async function rejectsMissing(run: () => Promise<void>) {
  try {
    await run();
    return false;
  } catch (error) {
    if (!String(error).includes("404")) throw error;
    return true;
  }
}

async function withHandles<T>(run: (own: Own) => Promise<T>): Promise<T> {
  const handles: Handle[] = [];
  try {
    return await run((handle) => {
      handles.push(handle);
      return handle;
    });
  } finally {
    for (const handle of handles.reverse()) handle.free();
  }
}
