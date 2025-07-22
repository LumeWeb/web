const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B0OThK7f.js","assets/_commonjsHelpers-DWwsNxpa.js","assets/index-RpD5mL5Y.js","assets/abuse__loadShare__react_mf_2_dom__loadShare__-CpomVz3Y.js","assets/abuse__loadShare__react__loadShare__-C6wwnR7P.js","assets/abuse__mf_v__runtimeInit__mf_v__-D-IlhcC-.js","assets/circle-alert-cI2tjBU6.js","assets/createLucideIcon-B3zrXXln.js","assets/_baseIsEqual-C_TPMinx.js","assets/index-B90HCQcT.js","assets/index-BGJNuQf_.js","assets/index-Dq110QZ7.js","assets/index-DTJbv2Oa.js","assets/index-BgdNhNE7.js","assets/index-BtwzhmBY.js","assets/index-p0r5B-Sd.js","assets/index-95rntDMt.js","assets/index-DcPQr_uN.js","assets/index.esm-D227pe9g.js","assets/index-D7K5VO2P.js"])))=>i.map(i=>d[i]);
import { i as index_cjs, a as abuse__mf_v__runtimeInit__mf_v__ } from "./abuse__mf_v__runtimeInit__mf_v__-D-IlhcC-.js";
import exposesMap from "./virtualExposes-Dff6wIYf.js";
import { _ as __vitePreload } from "./preload-helper-BkSzTOHT.js";
const importMap = {
  "react": async () => {
    let pkg = await __vitePreload(() => import("./index-B0OThK7f.js").then((n) => n.i), true ? __vite__mapDeps([0,1]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui": async () => {
    let pkg = await __vitePreload(() => import("./index-RpD5mL5Y.js"), true ? __vite__mapDeps([2,3,4,1,5,6,7,8,9,10,11]) : void 0);
    return pkg;
  },
  "react-dom": async () => {
    let pkg = await __vitePreload(() => import("./index-DTJbv2Oa.js").then((n) => n.i), true ? __vite__mapDeps([12,1,4,5]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-ui-core": async () => {
    let pkg = await __vitePreload(() => import("./index-BgdNhNE7.js"), true ? __vite__mapDeps([13,4,1,5,3,8,7,10]) : void 0);
    return pkg;
  },
  "@refinedev/core": async () => {
    let pkg = await __vitePreload(() => import("./index-BtwzhmBY.js"), true ? __vite__mapDeps([14,4,1,5,9]) : void 0);
    return pkg;
  },
  "@lumeweb/portal-framework-core": async () => {
    let pkg = await __vitePreload(() => import("./index-p0r5B-Sd.js"), true ? __vite__mapDeps([15,5,4,1,3,16,6,7,17,11]) : void 0);
    return pkg;
  },
  "react-router": async () => {
    let pkg = await __vitePreload(() => import("./index-95rntDMt.js"), true ? __vite__mapDeps([16,4,1,5]) : void 0);
    return pkg;
  },
  "react-hook-form": async () => {
    let pkg = await __vitePreload(() => import("./index.esm-D227pe9g.js"), true ? __vite__mapDeps([18,4,1,5]) : void 0);
    return pkg;
  },
  "@tanstack/react-query": async () => {
    let pkg = await __vitePreload(() => import("./index-D7K5VO2P.js"), true ? __vite__mapDeps([19,4,1,5,10]) : void 0);
    return pkg;
  }
};
const usedShared = {
  "react": {
    name: "react",
    version: "18.3.1",
    scope: ["default"],
    loaded: false,
    from: "abuse",
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
    from: "abuse",
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
    from: "abuse",
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
    from: "abuse",
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
    from: "abuse",
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
  "@lumeweb/portal-framework-core": {
    name: "@lumeweb/portal-framework-core",
    version: "0.0.0",
    scope: ["default"],
    loaded: false,
    from: "abuse",
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
  "react-router": {
    name: "react-router",
    version: "7.5.0",
    scope: ["default"],
    loaded: false,
    from: "abuse",
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
    from: "abuse",
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
    from: "abuse",
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
const mfName = "abuse";
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
  abuse__mf_v__runtimeInit__mf_v__.initResolve(initRes);
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
