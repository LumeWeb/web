const globalKey = "__mf_init____mf__virtual/dashboard__mf_v__runtimeInit__mf_v__.js__";
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
    var dashboard__mf_v__runtimeInit__mf_v__ = globalThis[globalKey];

export { dashboard__mf_v__runtimeInit__mf_v__ };
