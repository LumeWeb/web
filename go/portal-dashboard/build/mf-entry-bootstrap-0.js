
const __mfCacheGlobalKey = "__mf_module_cache__";
globalThis[__mfCacheGlobalKey] ||= { share: {}, remote: {} };
globalThis[__mfCacheGlobalKey].share ||= {};
globalThis[__mfCacheGlobalKey].remote ||= {};
const __mfModuleCache = globalThis[__mfCacheGlobalKey];

const __mfImport = (src) =>
  globalThis.System && typeof globalThis.System.import === 'function'
    ? globalThis.System.import(src)
    : import(src);
(async () => {
  const { initHost } = await __mfImport("/static/js/hostInit-B54NBrtX.js");
  const runtime = await initHost();
  const __mfRemotePreloads = [];
  await Promise.all(__mfRemotePreloads);
})().then(() => __mfImport("/static/js/index-D98ZyjT3.js"));
