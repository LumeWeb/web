/** Deferred work and timer observations let controller tests check cleanup without live services. */
export interface Deferred<T> {
  readonly promise: Promise<T>;
  reject(error?: unknown): void;
  resolve(value: T): void;
}
export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, reject, resolve };
}
// A fixed microtask drain is a scheduling assumption, not a completion signal.
export const drainMicrotasks = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

export function activeTimeoutCount(): number {
  return process
    .getActiveResourcesInfo()
    .filter((resource) => resource === "Timeout").length;
}
