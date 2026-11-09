/** A scope owns callback activity and teardown independently of SDK selection or retention. */
export type Listener<T> = (value: T) => void;
export type Stop = () => void;
export type Subscribe<T> = (listener: Listener<T>) => Stop;

/**
 * Tracks continuous and one-shot registrations until stopped or cleared.
 * Inactive callbacks ignore emitter arrays captured before unsubscription.
 * Synchronous registration callbacks can stop before the provider returns its cleanup.
 */
export function createSubscriptions() {
  const stops = new Set<Stop>();

  function register<T>(
    subscribe: Subscribe<T>,
    listener: Listener<T>,
    once: boolean,
  ): Stop {
    let active = true;
    let off: Stop | undefined;
    const stop = () => {
      if (!active) return;
      active = false;
      stops.delete(stop);
      const unsubscribe = off;
      off = undefined;
      unsubscribe?.();
    };
    stops.add(stop);
    try {
      const unsubscribe = subscribe((value) => {
        if (!active) return;
        if (once) stop();
        listener(value);
      });
      if (active) off = unsubscribe;
      else unsubscribe();
    } catch (error) {
      active = false;
      stops.delete(stop);
      throw error;
    }
    return stop;
  }

  return {
    /**
     * Stops the registrations present at this call, attempting every cleanup.
     * The first provider failure propagates after the remaining stops run.
     * The scope can accept new registrations afterward.
     */
    clear(this: void): void {
      let failed = false;
      let failure: unknown;
      for (const stop of [...stops]) {
        try {
          stop();
        } catch (error) {
          if (!failed) {
            failed = true;
            failure = error;
          }
        }
      }
      if (failed) {
        // Preserve provider-thrown values after attempting independent cleanup.
        // oxlint-disable-next-line typescript/only-throw-error
        throw failure;
      }
    },
    /** Stops before delivering the first value; later callbacks are ignored. */
    once<T>(this: void, subscribe: Subscribe<T>, listener: Listener<T>): Stop {
      return register(subscribe, listener, true);
    },
    /** Delivers values until the returned stop or clear deactivates the callback. */
    subscribe<T>(
      this: void,
      subscribe: Subscribe<T>,
      listener: Listener<T>,
    ): Stop {
      return register(subscribe, listener, false);
    },
  };
}
