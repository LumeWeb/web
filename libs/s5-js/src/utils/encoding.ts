import { base64url } from "multiformats/bases/base64";

export const base64urlEncode = (d: Uint8Array) =>
  base64url.encode(d).substring(1);
export const base64urlDecode = (d: string) => base64url.decode(`u${d}`);
