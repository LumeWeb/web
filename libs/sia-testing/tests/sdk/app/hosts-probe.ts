/** Queries the loopback emulator with real browser SDK sessions, without MSW or payload calls. */
import { AppKey, Builder, type HostQuery, initSia, type Sdk } from '@siafoundation/sia-storage';

declare global {
  interface Window {
    __querySdkHosts: typeof queryHosts;
  }
}

async function queryHosts(indexdURL: string, query?: HostQuery) {
  const url = new URL(indexdURL);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') throw new Error('Host probe requires its loopback emulator');
  const seed = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
  const key = new AppKey(Uint8Array.from(seed.match(/../g) ?? [], value => Number.parseInt(value, 16)));
  const builder = new Builder(indexdURL, { appId: '00'.repeat(32), callbackUrl: undefined, description: 'Emulated host queries', logoUrl: undefined, name: 'SDK host tests', serviceUrl: 'https://example.invalid' });
  let sdk: null | Sdk | undefined;
  try {
    sdk = await builder.connected(key);
    if (!sdk) throw new Error('Browser SDK did not connect to its modeled account');
    return await sdk.hosts(query);
  } finally { sdk?.free(); builder.free(); key.free(); }
}

await initSia();
window.__querySdkHosts = queryHosts;
const status = document.querySelector('#status');
if (!status) throw new Error('Host probe status element is missing');
status.textContent = 'ready';
