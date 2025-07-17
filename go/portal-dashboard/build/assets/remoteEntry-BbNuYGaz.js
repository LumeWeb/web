const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B0OThK7f.js","assets/_commonjsHelpers-DWwsNxpa.js","assets/index-DTQkAiZJ.js","assets/dashboard__mf_v__runtimeInit__mf_v__-C0jw-Lkn.js","assets/dashboard__loadShare__react__loadShare__-B-YtubD3.js","assets/dashboard__loadShare__react_mf_2_dom__loadShare__-CxucHwhd.js","assets/index-BN8IXIiO.js","assets/index-BgD9ZCss.js","assets/index-Psk6eg-4.js","assets/circle-alert-xe346N1H.js","assets/createLucideIcon-Od_tcS2A.js","assets/index-B8D9XoQA.js","assets/dashboard__loadShare__react_mf_2_hook_mf_2_form__loadShare__-BFukVN3a.js","assets/dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-CA_bmIPS.js","assets/get-BaQfVD2U.js","assets/index-Be4JBaEm.js","assets/index-aPZK1Msq.js","assets/index-CZRnBkK1.js","assets/dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__-Cr_NkuYy.js","assets/index-DwqD0hK1.js","assets/index.esm-C76CFM2C.js","assets/index-CimZ0-bn.js","assets/index-kdCbNmOZ.js"])))=>i.map(i=>d[i]);
import { i as index_cjs, d as dashboard__mf_v__runtimeInit__mf_v__ } from "./dashboard__mf_v__runtimeInit__mf_v__-C0jw-Lkn.js";
import exposesMap from "./virtualExposes-Dff6wIYf.js";
import { _ as __vitePreload } from "./preload-helper-BkSzTOHT.js";
const importMap = {
  "react": async () => {
    let pkg = await __vitePreload(() => import("./index-B0OThK7f.js").then((n) => n.i), true ? __vite__mapDeps([0,1]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-core": async () => {
    let pkg = await __vitePreload(() => import("./index-DTQkAiZJ.js"), true ? __vite__mapDeps([2,3,4,1,5,6,7,8,9,10]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui": async () => {
    let pkg = await __vitePreload(() => import("./index-B8D9XoQA.js"), true ? __vite__mapDeps([11,5,4,1,3,7,12,13,14,10,15,9,16]) : void 0);
    return pkg;
  },
  "@refinedev/core": async () => {
    let pkg = await __vitePreload(() => import("./index-CZRnBkK1.js"), true ? __vite__mapDeps([17,4,1,3,18,15]) : void 0);
    return pkg;
  },
  "@tanstack/react-query": async () => {
    let pkg = await __vitePreload(() => import("./index-DwqD0hK1.js"), true ? __vite__mapDeps([19,4,1,3,16]) : void 0);
    return pkg;
  },
  "react-hook-form": async () => {
    let pkg = await __vitePreload(() => import("./index.esm-C76CFM2C.js"), true ? __vite__mapDeps([20,4,1,3]) : void 0);
    return pkg;
  },
  "react-router": async () => {
    let pkg = await __vitePreload(() => import("./index-BN8IXIiO.js"), true ? __vite__mapDeps([6,4,1,3]) : void 0);
    return pkg;
  },
  "react-dom": async () => {
    let pkg = await __vitePreload(() => import("./index-CimZ0-bn.js").then((n) => n.i), true ? __vite__mapDeps([21,1,4,3]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui-core": async () => {
    let pkg = await __vitePreload(() => import("./index-kdCbNmOZ.js"), true ? __vite__mapDeps([22,4,1,3,5,14,10,16,12]) : void 0);
    return pkg;
  }
};
const usedShared = {
  "react": {
    name: "react",
    version: "18.3.1",
    scope: ["default"],
    loaded: false,
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
    from: "dashboard",
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
const mfName = "dashboard";
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
  dashboard__mf_v__runtimeInit__mf_v__.initResolve(initRes);
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
