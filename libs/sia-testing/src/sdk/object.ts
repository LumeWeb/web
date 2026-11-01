/** Mock object descriptors let apps read payload fixtures without creating SDK handles. */
export interface MockObject {
  id(): string;
  size(): number;
  slabs(): MockSlab[];
}

export interface MockSlab {
  encryptionKey: string;
  length: number;
  minShards: number;
  offset: number;
  sectors: never[];
  version: number;
}

/** Readers derive size from slab lengths, so an empty slab map would make nonempty payloads look empty. */
export function createMockObject(id: string, size: number): MockObject {
  if (!id) throw new Error("object id must not be empty");
  nonnegativeInteger(size, "size");
  return {
    id: () => id,
    size: () => size,
    slabs: () =>
      size === 0
        ? []
        : [
            {
              encryptionKey: "",
              length: size,
              minShards: 1,
              offset: 0,
              sectors: [],
              version: 1,
            },
          ],
  };
}

export function nonnegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error(`${name} must be a nonnegative safe integer`);
}
