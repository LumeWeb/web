/** Loads the browser SDK for offline helper checks without installing MSW. */
import { AppKey, detectPrivateRelay, encodedSize, initSia, PinnedObject, validateRecoveryPhrase } from '@siafoundation/sia-storage';

declare global {
  interface Window {
    __sdkHelpers: {
      AppKey: typeof AppKey;
      detectPrivateRelay: typeof detectPrivateRelay;
      encodedSize: typeof encodedSize;
      PinnedObject: typeof PinnedObject;
      validateRecoveryPhrase: typeof validateRecoveryPhrase;
    };
  }
}

await initSia();
window.__sdkHelpers = { AppKey, detectPrivateRelay, encodedSize, PinnedObject, validateRecoveryPhrase };
const status = document.querySelector('#status');
if (!status) throw new Error('Helper status element is missing');
status.textContent = 'ready';
