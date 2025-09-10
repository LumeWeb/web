import { useCallback, useState } from "react";

import type { ForceRerenderCallback } from "../types/form";

/**
 * Hook to provide force rerender functionality
 * 
 * This hook manages a force rerender mechanism that can be triggered
 * from outside the normal React render loop. It accepts an optional
 * callback that the framework can call with a rerender method,
 * which can then be stored and used to force a rerender when needed.
 * 
 * @param forceRerenderCallback - Optional callback that receives the force rerender method
 */
export function useForceRerender(forceRerenderCallback?: ForceRerenderCallback) {
  const [, setCounter] = useState(0);

  // The force rerender method that can be called externally
  const forceRerender = useCallback(() => {
    setCounter((prev) => prev + 1);
  }, []);

  // Set up the callback if provided
  useCallback(() => {
    if (forceRerenderCallback) {
      forceRerenderCallback(forceRerender);
    }
  }, [forceRerender, forceRerenderCallback])();

  // Return nothing - the hook is used for its side effect of setting up the callback
}