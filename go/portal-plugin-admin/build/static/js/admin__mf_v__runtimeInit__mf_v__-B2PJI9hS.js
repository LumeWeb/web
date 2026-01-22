const globalKey = "__mf_init____mf__virtual/admin__mf_v__runtimeInit__mf_v__.js__";
    if (!globalThis[globalKey]) {
      let initResolve, initReject;
      const initPromise = new Promise((re, rj) => {
        initResolve = re;
        initReject = rj;
      });
      globalThis[globalKey] = {
        initPromise,
        initResolve,
        initReject
      };
    }
    var admin__mf_v__runtimeInit__mf_v__ = globalThis[globalKey];

export { admin__mf_v__runtimeInit__mf_v__ };
