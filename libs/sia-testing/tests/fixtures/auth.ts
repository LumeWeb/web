/** Structural credentials for offline HTTP tests; signatures are not cryptographically verified. */
export const owner = 'ed25519:1111111111111111111111111111111111111111111111111111111111111111';
export const other = 'ed25519:2222222222222222222222222222222222222222222222222222222222222222';
export const recipient = 'ed25519:3333333333333333333333333333333333333333333333333333333333333333';
export function credentials(key = owner, expiry = '4102444800') {
  return new URLSearchParams({ sc: Buffer.from(key.slice(8), 'hex').toString('base64url').padEnd(44, '='), ss: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', sv: expiry });
}
export function signedUrl(path: string, key = owner) {
  const url = new URL(path, 'https://indexd.test');
  credentials(key).forEach((value, name) => url.searchParams.set(name, value));
  return url;
}
