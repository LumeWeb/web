/* oxlint-disable perfectionist/sort-objects, perfectionist/sort-intersection-types */
import type {
  SiaStreamAuthSource,
  SiaStreamAuthState,
} from "./sia-stream-service.ts";

export interface ZustandLikeStore<TState extends object> {
  getState(): TState;
  subscribe(
    listener: (state: TState, previousState?: TState) => void,
  ): () => void;
}

export function createSiaStreamAuthSource<TState extends object>(
  store: ZustandLikeStore<TState>,
): SiaStreamAuthSource {
  const project = (state: TState): SiaStreamAuthState => {
    const value = state as TState & Partial<SiaStreamAuthState>;
    return {
      indexerUrl: value.indexerUrl ?? "",
      userKeyHex: value.userKeyHex ?? "",
      sharingKeyHex: value.sharingKeyHex ?? null,
    };
  };
  let current = project(store.getState());
  return {
    get: () => current,
    subscribe: (listener) =>
      store.subscribe((state) => {
        const next = project(state);
        if (
          next.indexerUrl === current.indexerUrl &&
          next.userKeyHex === current.userKeyHex &&
          next.sharingKeyHex === current.sharingKeyHex
        )
          return;
        current = next;
        listener(next);
      }),
  };
}
