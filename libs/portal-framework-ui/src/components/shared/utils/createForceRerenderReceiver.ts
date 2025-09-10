import type { ForceRerenderCallback, ForceRerenderMethod } from "../types/form";

/**
 * Create a force rerender receiver for the receiving side
 *
 * This helper function creates a simple receiver that can be used
 * to store and call a force rerender method provided by the framework.
 * It returns an object with the callback to pass to the framework
 * and a function to trigger the rerender.
 *
 * @returns An object with:
 *   - forceRerenderCallback: The callback to pass to the framework config
 *   - forceRerender: Function to call when you need to force a rerender
 */
export function createForceRerenderReceiver() {
  let forceRerenderMethod: ForceRerenderMethod | null = null;

  const forceRerenderCallback: ForceRerenderCallback = (rerenderMethod) => {
    forceRerenderMethod = rerenderMethod;
  };

  const forceRerender = () => {
    if (forceRerenderMethod) {
      forceRerenderMethod();
    }
  };

  return {
    forceRerender,
    forceRerenderCallback,
  };
}
