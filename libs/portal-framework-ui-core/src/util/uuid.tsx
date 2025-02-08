export function uuid() {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString();
}
