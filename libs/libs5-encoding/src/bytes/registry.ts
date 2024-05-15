export const TYPES = {
  CID: 0x5a,
  /// Used for encrypted files with update support
  ///
  /// can point to resolver CID, Stream CID, Directory Metadata or Media Metadata object
  ENCRYPTED_CID: 0x5e,
};
Object.freeze(TYPES);

export const RECORD = 0x07;
