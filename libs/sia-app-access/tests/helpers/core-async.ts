/** Deferred promises settle protocol work after cancellation or retirement. */
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
