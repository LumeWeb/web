export function decodeEndian(bytes: Uint8Array): number {
  let total = 0;

  for (let i = 0; i < bytes.length; i++) {
    total += bytes[i] * Math.pow(256, i);
  }

  return total;
}
export function encodeEndian(value: number, length: number): Uint8Array {
  const res = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    res[i] = value & 0xff;
    value = value >> 8;
  }

  return res;
}
export function calculateScore(
  goodResponses: number,
  badResponses: number,
): number {
  const totalVotes = goodResponses + badResponses;

  if (totalVotes === 0) return 0.5;

  const average = goodResponses / totalVotes;
  return average - (average - 0.5) * Math.pow(2, -Math.log(totalVotes + 1));
}
