
const __mfCacheGlobalKey = "__mf_module_cache__";
globalThis[__mfCacheGlobalKey] ||= { share: {}, remote: {} };
globalThis[__mfCacheGlobalKey].share ||= {};
globalThis[__mfCacheGlobalKey].remote ||= {};
const __mfModuleCache = globalThis[__mfCacheGlobalKey];

(async () => {
  const { initHost } = await import("./hostInit-BbwEvLBU.js");
  const runtime = await initHost();
  const __mfRemotePreloads = [];
  await Promise.all(__mfRemotePreloads);
})().then(() => import("./index-Cc2DC0Lr.js"));
