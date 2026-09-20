/** A browser's verdict for one codec, from {@link capabilityVerdictForCodec}. */
export const capabilityVerdict = {
  'decodable-and-appendable': 'decodable-and-appendable',
  'decodable-not-appendable': 'decodable-not-appendable',
  'not-decodable': 'not-decodable',
  'unknown-codec': 'unknown-codec',
} as const;

export type CapabilityVerdict = (typeof capabilityVerdict)[keyof typeof capabilityVerdict];

export type CodecId = string & {};

/** Classifies a codec before bulk media reads begin. */
export function capabilityVerdictForCodec(
  codec: CodecId,
  appendable: ReadonlySet<CodecId>,
  normalizable: ReadonlySet<CodecId>,
): CapabilityVerdict {
  if (!codec) return capabilityVerdict['unknown-codec'];
  if (appendable.has(codec)) return capabilityVerdict['decodable-and-appendable'];
  if (normalizable.has(codec)) return capabilityVerdict['decodable-not-appendable'];
  return capabilityVerdict['not-decodable'];
}
