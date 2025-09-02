const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/index-ENp_rX1B.js","static/js/_commonjsHelpers-BILit0S-.js","static/js/index-DEidV5pU.js","static/js/dashboard__loadShare__react_mf_2_router__loadShare__-GzYn9uIj.js","static/js/dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js","static/js/dashboard__loadShare__react__loadShare__-A-_ogCU6.js","static/js/jsx-runtime-Rqu4CMEU.js","static/js/_baseIsEqual-C0d_jX9e.js","static/js/createLucideIcon-CcrG3Oz3.js","static/js/isLength-BjcVZakP.js","static/js/dashboard__loadShare__react_mf_2_dom__loadShare__-sIXfFKrj.js","static/js/index-CAhUWRmj.js","static/js/index-DInJFyS3.js","static/js/index.esm-BoYzizlD.js","static/js/index-lbHTgFEB.js","static/js/index-DU8ChCWG.js","static/js/index-DNyM4uYj.js","static/js/index-BQ-ueVeF.js","static/js/index-C__1Ej_O.js","static/js/virtualExposes-DwA08f_D.js","static/js/preload-helper-Dk3k6Zm1.js","static/js/index-DSq851Hl.js","static/js/index-C_u9kIEf.js"])))=>i.map(i=>d[i]);
import { init_1, dashboard__mf_v__runtimeInit__mf_v__ } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';
import exposesMap from './virtualExposes-DwA08f_D.js';
import { __vitePreload } from './preload-helper-Dk3k6Zm1.js';

const federationRuntime = { instance: null };
function BridgeReactPlugin() {
  return {
    name: "bridge-react-plugin",
    beforeInit(args) {
      federationRuntime.instance = args.origin;
      return args;
    }
  };
}

const importMap = {
      
        "react": async () => {
          let pkg = await __vitePreload(() => import('./index-ENp_rX1B.js').then(n => n.index),true              ?__vite__mapDeps([0,1]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-ui": async () => {
          let pkg = await __vitePreload(() => import('./index-DEidV5pU.js'),true              ?__vite__mapDeps([2,3,4,5,1,6,7,8,9,10,11]):void 0);
            return pkg;
        }
      ,
        "react-dom": async () => {
          let pkg = await __vitePreload(() => import('./index-DInJFyS3.js').then(n => n.index),true              ?__vite__mapDeps([12,1,5,4]):void 0);
            return pkg;
        }
      ,
        "react-hook-form": async () => {
          let pkg = await __vitePreload(() => import('./index.esm-BoYzizlD.js'),true              ?__vite__mapDeps([13,5,1,4]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-ui-core": async () => {
          let pkg = await __vitePreload(() => import('./index-lbHTgFEB.js'),true              ?__vite__mapDeps([14,5,1,4,6,10,7,8,11]):void 0);
            return pkg;
        }
      ,
        "@refinedev/core": async () => {
          let pkg = await __vitePreload(() => import('./index-DU8ChCWG.js'),true              ?__vite__mapDeps([15,5,1,4,9]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-core": async () => {
          let pkg = await __vitePreload(() => import('./index-DNyM4uYj.js'),true              ?__vite__mapDeps([16,17,10,1,4,5,6,18,3,8,19,20]):void 0);
            return pkg;
        }
      ,
        "react-router": async () => {
          let pkg = await __vitePreload(() => import('./index-DSq851Hl.js'),true              ?__vite__mapDeps([21,5,1,4,18,10]):void 0);
            return pkg;
        }
      ,
        "@tanstack/react-query": async () => {
          let pkg = await __vitePreload(() => import('./index-C_u9kIEf.js'),true              ?__vite__mapDeps([22,5,1,4,11]):void 0);
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
            async get () {
              usedShared["react"].loaded = true;
              const {"react": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^18.3.1",
              
            }
          }
        ,
          "@lumeweb/portal-framework-ui": {
            name: "@lumeweb/portal-framework-ui",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["@lumeweb/portal-framework-ui"].loaded = true;
              const {"@lumeweb/portal-framework-ui": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              
            }
          }
        ,
          "react-dom": {
            name: "react-dom",
            version: "18.3.1",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["react-dom"].loaded = true;
              const {"react-dom": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^18.3.1",
              
            }
          }
        ,
          "react-hook-form": {
            name: "react-hook-form",
            version: "7.54.0",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["react-hook-form"].loaded = true;
              const {"react-hook-form": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^7.54.0",
              
            }
          }
        ,
          "@lumeweb/portal-framework-ui-core": {
            name: "@lumeweb/portal-framework-ui-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["@lumeweb/portal-framework-ui-core"].loaded = true;
              const {"@lumeweb/portal-framework-ui-core": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              
            }
          }
        ,
          "@refinedev/core": {
            name: "@refinedev/core",
            version: "4.57.10",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["@refinedev/core"].loaded = true;
              const {"@refinedev/core": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.57.10",
              
            }
          }
        ,
          "@lumeweb/portal-framework-core": {
            name: "@lumeweb/portal-framework-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["@lumeweb/portal-framework-core"].loaded = true;
              const {"@lumeweb/portal-framework-core": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              
            }
          }
        ,
          "react-router": {
            name: "react-router",
            version: "7.8.2",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["react-router"].loaded = true;
              const {"react-router": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^7.8.2",
              
            }
          }
        ,
          "@tanstack/react-query": {
            name: "@tanstack/react-query",
            version: "4.36.1",
            scope: ["default"],
            loaded: false,
            from: "dashboard",
            async get () {
              usedShared["@tanstack/react-query"].loaded = true;
              const {"@tanstack/react-query": pkgDynamicImport} = importMap;
              const res = await pkgDynamicImport();
              const exportModule = {...res};
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              });
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.36.1",
              
            }
          }
        
    };
      const usedRemotes = [
      ];

const initTokens = {};
  const shareScopeName = "default";
  const mfName = "dashboard";
  async function init(shared = {}, initScope = []) {
    const initRes = init_1({
      name: mfName,
      remotes: usedRemotes,
      shared: usedShared,
      plugins: [BridgeReactPlugin()],
      shareStrategy: 'version-first'
    });
    // handling circular init calls
    var initToken = initTokens[shareScopeName];
    if (!initToken)
      initToken = initTokens[shareScopeName] = { from: mfName };
    if (initScope.indexOf(initToken) >= 0) return;
    initScope.push(initToken);
    initRes.initShareScopeMap('default', shared);
    try {
      await Promise.all(await initRes.initializeSharing('default', {
        strategy: 'version-first',
        from: "build",
        initScope
      }));
    } catch (e) {
      console.error(e);
    }
    dashboard__mf_v__runtimeInit__mf_v__.initResolve(initRes);
    return initRes
  }

  function getExposes(moduleName) {
    if (!(moduleName in exposesMap)) throw new Error(`Module ${moduleName} does not exist in container.`)
    return (exposesMap[moduleName])().then(res => () => res)
  }

export { federationRuntime, getExposes, init };
