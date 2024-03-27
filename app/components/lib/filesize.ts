// Copied from https://github.com/hustcc/filesize.js

type SPEC = {
  readonly radix: number;
  readonly unit: string[];
};

const si = {
  radix: 1e3,
  unit: ["b", "kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
};
const iec = {
  radix: 1024,
  unit: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
};
const jedec = {
  radix: 1024,
  unit: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
};

export const SPECS = {
  si,
  iec,
  jedec,
} as const;

/**
 * file size
 * @param bytes Number of file size bytes
 * @param fixed  Number of decimal, default is 1.
 * @param spec  String of file size spec, default is jedec. Options: si, iec, jedec.
 */
export default function filesize(bytes: number, fixed = 1, spec: keyof typeof SPECS = "jedec"): string {
  let _bytes = Math.abs(bytes);

  const { radix, unit } = SPECS[spec];

  let loop = 0;

  // calculate
  while (_bytes >= radix) {
    _bytes /= radix;
    ++loop;
  }
  return `${bytes.toFixed(fixed)} ${unit[loop]}`;
}
