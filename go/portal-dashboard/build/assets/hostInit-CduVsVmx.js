const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/remoteEntry-DFBNfE7-.js","assets/dashboard__mf_v__runtimeInit__mf_v__-C0jw-Lkn.js","assets/virtualExposes-Dff6wIYf.js","assets/preload-helper-BkSzTOHT.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from "./preload-helper-BkSzTOHT.js";
const remoteEntryPromise = __vitePreload(() => import("./remoteEntry-DFBNfE7-.js"), true ? __vite__mapDeps([0,1,2,3]) : void 0);
Promise.resolve(remoteEntryPromise).then((remoteEntry) => {
  return Promise.resolve(remoteEntry.__tla).then(remoteEntry.init).catch(remoteEntry.init);
});
