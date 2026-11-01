/** Keep SDK evidence without exposing signed requests or raw failures. */
export function createSDKDiagnostics() {
  let noToken = 0,
    transfers = 0;
  return {
    record(message: string) {
      if (message.includes("no account token for host")) noToken++;
      if (/slab \d+ shard \d+ (uploaded|download)/.test(message)) transfers++;
    },
    snapshot() {
      return { noToken, transfers };
    },
  };
}
