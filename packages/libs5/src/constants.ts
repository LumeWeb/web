export const CID_TYPES = {
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
Object.freeze(CID_TYPES);

export const REGISTRY_TYPES = {
  CID: 0x5a,
  /// Used for encrypted files with update support
  ///
  /// can point to resolver CID, Stream CID, Directory Metadata or Media Metadata object
  ENCRYPTED_CID: 0x5e,
};
Object.freeze(REGISTRY_TYPES);

// ! some multicodec bytes
// BLAKE3 with default output size of 256 bits

export const CID_HASH_TYPES = {
  BLAKE3: 0x1f,
  ED25519: 0xed,
};
Object.freeze(CID_HASH_TYPES);

export const encryptionAlgorithmXChaCha20Poly1305 = 0xa6;
export const encryptionAlgorithmXChaCha20Poly1305NonceSize = 24;

export const contentPackFileHeader = Uint8Array.from([0x5f, 0x26, 0x73, 0x35]);

// ! metadata files

// used as the first byte of metadata files
export const metadataMagicByte = 0x5f;

export const METADATA_TYPES = {
  MEDIA: 0x02,
  WEBAPP: 0x03,
  DIRECTORY: 0x04,
  PROOF: 0x05,
  USER_IDENTITY: 0x07,
};
Object.freeze(METADATA_TYPES);

export const PARENT_LINK_TYPES = {
  USER_IDENTITY: 1,
  BOARD: 5,
  BRIDGE_USER: 10,
};
Object.freeze(PARENT_LINK_TYPES);

export const registryMaxDataSize = 64;

export const parentLinkTypeUserIdentity = 1;
export const parentLinkTypeBoard = 5;
export const parentLinkTypeBridgeUser = 10;

// ! user identity

export const authPayloadVersion1 = 0x01;

export const userIdentityLinkProfile = 0x00;
export const userIdentityLinkPublicFileSystem = 0x01;
// ! p2p protocol message types

export const protocolMethodHandshakeOpen = 1;
export const protocolMethodHandshakeDone = 2;

export const protocolMethodSignedMessage = 10;

export const protocolMethodHashQuery = 4;
export const protocolMethodAnnouncePeers = 8;
export const protocolMethodRegistryQuery = 13;

export const recordTypeStorageLocation = 0x05; // cache
export const recordTypeRegistryEntry = 0x07; // permanent
export const recordTypeStreamEvent = 0x09; // temporary, delete after time X (like storage locations)

// ! Some optional metadata extensions (same for files, media files and directories)

// List<String>, license identifier from https://spdx.org/licenses/
export const metadataExtensionLicenses = 11;

// List<Uint8List>, multicoded pubkey that references a registry entry that contains donation links and addresses
export const metadataExtensionDonationKeys = 12;

// map string->map, external ids of this object by their wikidata property id.
export const metadataExtensionWikidataClaims = 13;

// List<String>, for example [en, de, de-DE]
export const metadataExtensionLanguages = 14;

// List<String>,
export const metadataExtensionSourceUris = 15;

// Resolver CID, can be used to update this post. can also be used to "delete" a post.
export const metadataExtensionUpdateCID = 16;

// List<CID>, lists previous versions of this post
export const metadataExtensionPreviousVersions = 17;

// unix timestamp in milliseconds
export const metadataExtensionTimestamp = 18;

export const metadataExtensionTags = 19;
export const metadataExtensionCategories = 20;

// video, podcast, book, audio, music, ...
export const metadataExtensionViewTypes = 21;

export const metadataExtensionBasicMediaMetadata = 22;

export const metadataExtensionBridge = 23;

export const metadataExtensionOriginalTimestamp = 24;

// List<Uint8List>
export const metadataExtensionRoutingHints = 25;

// TODO comment to / reply to (use parents)
// TODO mentions (use new extension field)
// TODO Reposts (just link the original item)

// ! media details
export const metadataMediaDetailsDuration = 10;
export const metadataMediaDetailsIsLive = 11;

// ! metadata proofs
export const metadataProofTypeSignature = 1;
export const metadataProofTypeTimestamp = 2;

// ! storage locations
export const storageLocationTypeArchive = 0;
export const storageLocationTypeFile = 3;
export const storageLocationTypeFull = 5;
export const storageLocationTypeBridge = 7;
export const supportedFeatures = 3;

export const hiddenDBTweak = 66;

export const pathKeyDerivationTweak = 1;
export const writeKeyDerivationTweak = 2;
export const encryptionKeyDerivationTweak = 3;
export const encryptionKeyLength = 32;
export const encryptionNonceLength = 24;
export const encryptionOverheadLength = 16;

export const BOOTSTRAP_NODES: string[] = [
  "wss://z2DWuWNZcdSyZLpXFK2uCU3haaWMXrDAgxzv17sDEMHstZb@s5.garden/s5/p2p",
  "wss://z2DWuPbL5pweybXnEB618pMnV58ECj2VPDNfVGm3tFqBvjF@s5.ninja/s5/p2p",
];
