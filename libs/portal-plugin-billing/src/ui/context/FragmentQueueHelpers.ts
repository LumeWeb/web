/**
 * Copies all attributes from source script to target script element.
 */
export function copyScriptAttributes(source: HTMLScriptElement, target: HTMLScriptElement): void {
  for (const attr of Array.from(source.attributes)) {
    target.setAttribute(attr.name, attr.value);
  }
}

/**
 * Attaches load/error listeners with abort signal cleanup support.
 * Returns a cleanup function to remove the abort listener.
 */
export function attachScriptHandlers(
  script: HTMLScriptElement,
  resolve: () => void,
  signal?: AbortSignal,
): (() => void) | undefined {
  const onAbort = () => {
    script.remove();
    resolve();
  };

  const onLoad = () => {
    script.removeEventListener("load", onLoad);
    script.removeEventListener("error", onError);
    signal?.removeEventListener("abort", onAbort);
    resolve();
  };

  const onError = () => {
    script.removeEventListener("load", onLoad);
    script.removeEventListener("error", onError);
    signal?.removeEventListener("abort", onAbort);
    resolve();
  };

  signal?.addEventListener("abort", onAbort);
  script.addEventListener("load", onLoad);
  script.addEventListener("error", onError);

  return onAbort;
}
