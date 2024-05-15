export interface SignedRegistryEntry {
  pk: Uint8Array; // public key with multicodec prefix
  revision: number; // revision number of this entry, maximum is (256^8)-1
  data: Uint8Array; // data stored in this entry, can have a maximum length of 48 bytes
  signature: Uint8Array; // signature of this registry entry
}
