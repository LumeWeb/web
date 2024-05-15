export const TYPES = {
  RAW: 0x26,
  METADATA_MEDIA: 0xc5,
  METADATA_WEBAPP: 0x59,
  RESOLVER: 0x25,
  USER_IDENTITY: 0x77,
  BRIDGE: 0x3a,
  DIRECTORY: 0x5d,
  // format for dynamic encrypted CID
  // type algo key resolver_type mkey_ed255 pubkey
  // in entry: encrypt(RAW CID or MEDIA or SOMETHING)

  /// Used for immutable encrypted files and metadata formats, key can never be re-used
  ///
  /// Used for file versions in Vup
  ENCRYPTED_STATIC: 0xae,
  ENCRYPTED_DYNAMIC: 0xad,
};

Object.freeze(TYPES);
