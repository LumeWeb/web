const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B0OThK7f.js","assets/_commonjsHelpers-DWwsNxpa.js","assets/index-DOZpToAe.js","assets/admin__loadShare__react_mf_2_dom__loadShare__-CmlR8Dnz.js","assets/admin__loadShare__react__loadShare__-C1ovXSRa.js","assets/admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js","assets/circle-alert-MQIeVBbL.js","assets/createLucideIcon-BzDmmRa9.js","assets/_baseIsEqual-CDmbb0mw.js","assets/index-CzJLPSgC.js","assets/index-BtSAyZnk.js","assets/index-Dq110QZ7.js","assets/index-Sc5xQAUH.js","assets/index-K7HuSbFS.js","assets/index-SoLr86f9.js","assets/index-j0T4rkAH.js","assets/index-UUCixPiW.js","assets/index-DoRt8A9g.js","assets/index.esm-BCInxeWc.js","assets/index-Cp7-DRlg.js"])))=>i.map(i=>d[i]);
import { i as index_cjs, a as admin__mf_v__runtimeInit__mf_v__ } from "./admin__mf_v__runtimeInit__mf_v__-CrLwvomy.js";
import exposesMap from "./virtualExposes-Dff6wIYf.js";
import { _ as __vitePreload } from "./preload-helper-BkSzTOHT.js";
const importMap = {
  "react": async () => {
    let pkg = await __vitePreload(() => import("./index-B0OThK7f.js").then((n) => n.i), true ? __vite__mapDeps([0,1]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui": async () => {
    let pkg = await __vitePreload(() => import("./index-DOZpToAe.js"), true ? __vite__mapDeps([2,3,4,1,5,6,7,8,9,10,11]) : void 0);
    return pkg;
  },
  "react-dom": async () => {
    let pkg = await __vitePreload(() => import("./index-Sc5xQAUH.js").then((n) => n.i), true ? __vite__mapDeps([12,1,4,5]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-core": async () => {
    let pkg = await __vitePreload(() => import("./index-K7HuSbFS.js"), true ? __vite__mapDeps([13,5,4,1,3,14,6,7,15,11]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui-core": async () => {
    let pkg = await __vitePreload(() => import("./index-UUCixPiW.js"), true ? __vite__mapDeps([16,4,1,5,3,8,7,10]) : void 0);
    return pkg;
  },
  "@refinedev/core": async () => {
    let pkg = await __vitePreload(() => import("./index-DoRt8A9g.js"), true ? __vite__mapDeps([17,4,1,5,9]) : void 0);
    return pkg;
  },
  "react-router": async () => {
    let pkg = await __vitePreload(() => import("./index-SoLr86f9.js"), true ? __vite__mapDeps([14,4,1,5]) : void 0);
    return pkg;
  },
  "react-hook-form": async () => {
    let pkg = await __vitePreload(() => import("./index.esm-BCInxeWc.js"), true ? __vite__mapDeps([18,4,1,5]) : void 0);
    return pkg;
  },
  "@tanstack/react-query": async () => {
    let pkg = await __vitePreload(() => import("./index-Cp7-DRlg.js"), true ? __vite__mapDeps([19,4,1,5,10]) : void 0);
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
  "react-router": {
    name: "react-router",
    version: "7.5.0",
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
      requiredVersion: "^7.5.0"
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
