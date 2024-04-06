import { Buffer } from "buffer";

/**
 * convert a number to Buffer.
 *
 * @param value - File objects to upload, indexed by their path strings.
 * @returns - The returned cid.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
function numberToBuffer(value: number) {
  const view = Buffer.alloc(16);
  let lastIndex = 15;
  for (let index = 0; index <= 15; ++index) {
    if (value % 256 !== 0) {
      lastIndex = index;
    }
    view[index] = value % 256;
    value = value >> 8;
  }
  return view.subarray(0, lastIndex + 1);
}
