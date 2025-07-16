const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-XNOX80ur.js","assets/_commonjsHelpers-CcAunmGO.js","assets/index-CRAaPXgf.js","assets/admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js","assets/admin__loadShare__react__loadShare__-Dmjt9gIa.js","assets/admin__loadShare__react_mf_2_dom__loadShare__-C-0Fd6FO.js","assets/index-DK2TndKq.js","assets/index-DvPoCwG9.js","assets/index-dH_6NmuF.js","assets/circle-alert-Cq_xhtKb.js","assets/createLucideIcon-utyYVglr.js","assets/index-8WPTIDR-.js","assets/admin__loadShare__react_mf_2_hook_mf_2_form__loadShare__-vrV93IxO.js","assets/admin__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DMFaDuP5.js","assets/get-B_zKuyqA.js","assets/index-DYE47LER.js","assets/index-Cm5-czH0.js","assets/index-BWnL5pyl.js","assets/admin__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__-Cphf_HQg.js","assets/index-CSGSoC6F.js","assets/index.esm-D62MS1TF.js","assets/index-DGwCa26q.js","assets/index-DAVRJlgx.js"])))=>i.map(i=>d[i]);
import { i as index_cjs, a as admin__mf_v__runtimeInit__mf_v__ } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
import exposesMap from "./virtualExposes-Dff6wIYf.js";
import { _ as __vitePreload } from "./preload-helper-BkSzTOHT.js";
const importMap = {
  "react": async () => {
    let pkg = await __vitePreload(() => import("./index-XNOX80ur.js").then((n) => n.i), true ? __vite__mapDeps([0,1]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-core": async () => {
    let pkg = await __vitePreload(() => import("./index-CRAaPXgf.js"), true ? __vite__mapDeps([2,3,4,1,5,6,7,8,9,10]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui": async () => {
    let pkg = await __vitePreload(() => import("./index-8WPTIDR-.js"), true ? __vite__mapDeps([11,5,4,1,3,7,12,13,14,10,15,9,16]) : void 0);
    return pkg;
  },
  "@refinedev/core": async () => {
    let pkg = await __vitePreload(() => import("./index-BWnL5pyl.js"), true ? __vite__mapDeps([17,4,1,3,18,15]) : void 0);
    return pkg;
  },
  "@tanstack/react-query": async () => {
    let pkg = await __vitePreload(() => import("./index-CSGSoC6F.js"), true ? __vite__mapDeps([19,4,1,3,16]) : void 0);
    return pkg;
  },
  "react-hook-form": async () => {
    let pkg = await __vitePreload(() => import("./index.esm-D62MS1TF.js"), true ? __vite__mapDeps([20,4,1,3]) : void 0);
    return pkg;
  },
  "react-router": async () => {
    let pkg = await __vitePreload(() => import("./index-DK2TndKq.js"), true ? __vite__mapDeps([6,4,1,3]) : void 0);
    return pkg;
  },
  "react-dom": async () => {
    let pkg = await __vitePreload(() => import("./index-DGwCa26q.js").then((n) => n.i), true ? __vite__mapDeps([21,1,4,3]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui-core": async () => {
    let pkg = await __vitePreload(() => import("./index-DAVRJlgx.js"), true ? __vite__mapDeps([22,4,1,3,5,14,10,16,12]) : void 0);
    return pkg;
  }
};
const usedShared = {
  "react": {
    name: "react",
    version: "18.3.1",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["react"].loaded = true;
      const { "react": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^18.3.1"
    }
  },
  "@lumeweb/portal-framework-core": {
    name: "@lumeweb/portal-framework-core",
    version: "0.0.0",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["@lumeweb/portal-framework-core"].loaded = true;
      const { "@lumeweb/portal-framework-core": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^0.0.0"
    }
  },
  "@lumeweb/portal-framework-ui": {
    name: "@lumeweb/portal-framework-ui",
    version: "0.0.0",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["@lumeweb/portal-framework-ui"].loaded = true;
      const { "@lumeweb/portal-framework-ui": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^0.0.0"
    }
  },
  "@refinedev/core": {
    name: "@refinedev/core",
    version: "4.57.9",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["@refinedev/core"].loaded = true;
      const { "@refinedev/core": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^4.57.9"
    }
  },
  "@tanstack/react-query": {
    name: "@tanstack/react-query",
    version: "4.36.1",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["@tanstack/react-query"].loaded = true;
      const { "@tanstack/react-query": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^4.36.1"
    }
  },
  "react-hook-form": {
    name: "react-hook-form",
    version: "7.54.0",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["react-hook-form"].loaded = true;
      const { "react-hook-form": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^7.54.0"
    }
  },
  "react-router": {
    name: "react-router",
    version: "7.6.0",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["react-router"].loaded = true;
      const { "react-router": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^7.6.0"
    }
  },
  "react-dom": {
    name: "react-dom",
    version: "18.3.1",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["react-dom"].loaded = true;
      const { "react-dom": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^18.3.1"
    }
  },
  "@lumeweb/portal-framework-ui-core": {
    name: "@lumeweb/portal-framework-ui-core",
    version: "0.0.0",
    scope: ["default"],
    loaded: false,
    from: "admin",
    async get() {
      usedShared["@lumeweb/portal-framework-ui-core"].loaded = true;
      const { "@lumeweb/portal-framework-ui-core": pkgDynamicImport } = importMap;
      const res = await pkgDynamicImport();
      const exportModule = { ...res };
      Object.defineProperty(exportModule, "__esModule", {
        value: true,
        enumerable: false
      });
      return function() {
        return exportModule;
      };
    },
    shareConfig: {
      singleton: true,
      requiredVersion: "^0.0.0"
    }
  }
};
const usedRemotes = [];
const initTokens = {};
const shareScopeName = "default";
const mfName = "admin";
async function init(shared = {}, initScope = []) {
  const initRes = index_cjs.init({
    name: mfName,
    remotes: usedRemotes,
    shared: usedShared,
    plugins: [],
    shareStrategy: "version-first"
  });
  var initToken = initTokens[shareScopeName];
  if (!initToken)
    initToken = initTokens[shareScopeName] = { from: mfName };
  if (initScope.indexOf(initToken) >= 0) return;
  initScope.push(initToken);
  initRes.initShareScopeMap("default", shared);
  try {
    await Promise.all(await initRes.initializeSharing("default", {
      strategy: "version-first",
      from: "build",
      initScope
    }));
  } catch (e) {
    console.error(e);
  }
  admin__mf_v__runtimeInit__mf_v__.initResolve(initRes);
  return initRes;
}
function getExposes(moduleName) {
  if (!(moduleName in exposesMap)) throw new Error(`Module ${moduleName} does not exist in container.`);
  return exposesMap[moduleName]().then((res) => () => res);
}
export {
  getExposes as get,
  init
};
