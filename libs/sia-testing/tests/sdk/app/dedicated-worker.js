const metadata = {
  appId: "00".repeat(32),
  description: "dedicated worker emulator test",
  name: "dedicated worker",
  serviceUrl: "https://example.invalid",
};

self.onmessage = async () => {
  try {
    const { Builder, generateRecoveryPhrase, initSia, PinnedObject } = await import("@siafoundation/sia-storage");
    await initSia();
    const builder = new Builder(self.location.origin, metadata);
    await builder.requestConnection();
    await fetch(builder.responseUrl(), { headers: { authorization: "Basic dGVzdDp0ZXN0" }, method: "POST" });
    await builder.waitForApproval();
    const sdk = await builder.register(generateRecoveryPhrase());
    const account = await sdk.account();
    const appKey = sdk.appKey();
    const object = new PinnedObject();
    const objectId = object.id();
    await sdk.pinObject(object);
    const fetched = await sdk.object(objectId);
    self.postMessage({ accountKey: account.accountKey, fetchedId: fetched.id(), objectId, ok: true, requestKey: appKey.publicKey() });
    fetched.free();
    object.free();
    appKey.free();
    sdk.free();
    builder.free();
  } catch (error) {
    self.postMessage({ error: String(error), ok: false });
  }
};
