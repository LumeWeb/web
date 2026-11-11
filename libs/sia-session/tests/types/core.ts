import {
  createSessionFromClient,
  createSiaSdkSession,
  mapSiaSdkSession,
  openSiaSdkOperationScope,
  SdkState,
} from "@lumeweb/sia-session";
import type {
  RetireListener,
  SdkClient,
  SdkDisposeListener,
  SdkIssueListener,
  SdkObserver,
  SdkSelector,
  SdkSource,
  SdkWork,
  Unsubscribe,
} from "@lumeweb/sia-session";

interface ReadView {
  read(): string;
}

const cleanup = Symbol("cleanup");
const client = {
  [cleanup]() {},
  free() {},
  read() {
    return "value";
  },
};
const session = createSessionFromClient(client);
const managed: SdkClient = client;
void managed;
const source: SdkSource<ReadView> = session.source;
const work: SdkWork<ReadView, string> = (sdk) => sdk.read();
const result: Promise<string> = source.withSdk(work);
void result;
const operation = openSiaSdkOperationScope(source);
const operationResult: Promise<string> = operation.run(work);
void operationResult;
void operation.close();
void operation.closed;
// @ts-expect-error A child cannot publish a raw SDK source.
operation.source;
// @ts-expect-error A child cannot reveal its SDK outside run.
operation.value;
const observer: SdkObserver = () => 1;
const unsubscribe: Unsubscribe = source.subscribe(observer);
unsubscribe();
source.subscribe(async () => "ignored");
const onDispose: SdkDisposeListener = () => 1;
const onError: SdkIssueListener = async () => "ignored";
createSessionFromClient(client, { onDispose, onError });
session.source.withSdk((sdk) => {
  // @ts-expect-error Disposal stays with the session.
  sdk.free();
  // @ts-expect-error Symbol members are not part of the borrowed client.
  sdk[cleanup]();
});
// @ts-expect-error Readers cannot close their provider.
source.close();
// @ts-expect-error Readers cannot replace their provider's client.
source.set(client);
const select: SdkSelector<ReadView, ReadView> = (sdk) => ({
  read: () => sdk.read(),
});
const mapped = mapSiaSdkSession(source, select);
const lease = mapped.acquire();
const retired: RetireListener = () => "ignored";
const stopRetirement: Unsubscribe = lease.onRetire(retired);
stopRetirement();
const value: string = lease.value.read();
void value;
lease.release();
const snapshot = source.getSnapshot();
if (snapshot.state === SdkState.Available) {
  const id: symbol = snapshot.id;
  void id;
} else {
  const id: null = snapshot.id;
  void id;
}
const empty = createSiaSdkSession<ReadView>();
empty.set(client);
const shared = createSiaSdkSession<ReadView>();
shared.setHandle({ dispose() {}, value: client }, { valueOwnership: "shared" });
// @ts-expect-error Only handle adoption can share a value.
shared.set(client, { valueOwnership: "shared" });
// @ts-expect-error Managed clients need a real destructor.
empty.set({
  read() {
    return "value";
  },
});
source.withSdk((_sdk, context) => {
  // @ts-expect-error A short callback cannot end its own retention early.
  context.release();
});
