export function runWhenIdle(callback: () => void) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 200);
  }
}
