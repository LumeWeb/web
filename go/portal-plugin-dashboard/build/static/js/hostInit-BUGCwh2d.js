const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/remoteEntry-BMcLdrbX.js","static/js/virtual_mf-REMOTE_ENTRY_ID-16krxnl_.js","static/js/virtualExposes-DwA08f_D.js","static/js/preload-helper-Dk3k6Zm1.js","static/js/dashboard__mf_v__runtimeInit__mf_v__-BgQBwuY5.js"])))=>i.map(i=>d[i]);
import { __vitePreload } from './preload-helper-Dk3k6Zm1.js';

const remoteEntryPromise = __vitePreload(() => import('./remoteEntry-BMcLdrbX.js'),true              ?__vite__mapDeps([0,1,2,3,4]):void 0);
    // __tla only serves as a hack for vite-plugin-top-level-await.
    Promise.resolve(remoteEntryPromise)
      .then(remoteEntry => {
        return Promise.resolve(remoteEntry.__tla)
          .then(remoteEntry.init).catch(remoteEntry.init)
      });
