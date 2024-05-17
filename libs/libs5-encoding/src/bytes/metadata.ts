export const TYPES = {
  MEDIA: 0x02,
  WEBAPP: 0x03,
  DIRECTORY: 0x04,
  PROOF: 0x05,
  USER_IDENTITY: 0x07,
};
Object.freeze(TYPES);

export const DETAILS = {
  MEDIA: {
    DURATION: 10,
    IS_LIVE: 11,
    WAS_LIVE: 12,
  },
};

Object.freeze(DETAILS);

export const MAGIC_BYTE = 0x5f;
