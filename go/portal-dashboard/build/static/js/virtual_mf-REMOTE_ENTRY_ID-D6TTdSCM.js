const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["static/js/index-BpcOal57.js","static/js/_commonjsHelpers-BILit0S-.js","static/js/index-BhqAL9Ke.js","static/js/dashboard__loadShare__react__loadShare__-A-_ogCU6.js","static/js/dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js","static/js/createLucideIcon-DMX48tGS.js","static/js/dashboard__loadShare__react_mf_2_router__loadShare__-BKb1-sjI.js","static/js/_baseIsEqual-4GdOyeRH.js","static/js/dashboard__loadShare__react_mf_2_dom__loadShare__-sIXfFKrj.js","static/js/index-C2B07oHK.js","static/js/isLength-BjcVZakP.js","static/js/index-CIvfdGdl.js","static/js/index--g57fGyZ.js","static/js/index-DRtNAoCS.js","static/js/index-C__1Ej_O.js","static/js/virtualExposes-DwA08f_D.js","static/js/preload-helper-Dk3k6Zm1.js","static/js/index-DC7zZtpB.js","static/js/index.esm-BoYzizlD.js","static/js/index-gNG4oL9e.js","static/js/index-DSq851Hl.js","static/js/index-DNzgWFpQ.js"])))=>i.map(i=>d[i]);
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
          let pkg = await __vitePreload(() => import('./index-BpcOal57.js').then(n => n.index),true              ?__vite__mapDeps([0,1]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-ui": async () => {
          let pkg = await __vitePreload(() => import('./index-BhqAL9Ke.js'),true              ?__vite__mapDeps([2,3,1,4,5,6,7,8,9,10]):void 0);
            return pkg;
        }
      ,
        "react-dom": async () => {
          let pkg = await __vitePreload(() => import('./index-CIvfdGdl.js').then(n => n.index),true              ?__vite__mapDeps([11,1,3,4]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-core": async () => {
          let pkg = await __vitePreload(() => import('./index--g57fGyZ.js'),true              ?__vite__mapDeps([12,13,8,1,4,3,5,14,6,15,16]):void 0);
            return pkg;
        }
      ,
        "@lumeweb/portal-framework-ui-core": async () => {
          let pkg = await __vitePreload(() => import('./index-DC7zZtpB.js'),true              ?__vite__mapDeps([17,3,1,4,5,7,8,9]):void 0);
            return pkg;
        }
      ,
        "react-hook-form": async () => {
          let pkg = await __vitePreload(() => import('./index.esm-BoYzizlD.js'),true              ?__vite__mapDeps([18,3,1,4]):void 0);
            return pkg;
        }
      ,
        "@refinedev/core": async () => {
          let pkg = await __vitePreload(() => import('./index-gNG4oL9e.js'),true              ?__vite__mapDeps([19,3,1,4,10]):void 0);
            return pkg;
        }
      ,
        "react-router": async () => {
          let pkg = await __vitePreload(() => import('./index-DSq851Hl.js'),true              ?__vite__mapDeps([20,3,1,4,14,8]):void 0);
            return pkg;
        }
      ,
        "@tanstack/react-query": async () => {
          let pkg = await __vitePreload(() => import('./index-DNzgWFpQ.js'),true              ?__vite__mapDeps([21,3,1,4,9]):void 0);
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
          "react-router": {
            name: "react-router",
            version: "7.5.2",
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
              requiredVersion: "^7.5.2",
              
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
