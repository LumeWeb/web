import { index_cjs, core_abuse__mf_v__runtimeInit__mf_v__ } from './core_abuse__mf_v__runtimeInit__mf_v__-BhTJRpXJ.js';
import exposesMap from './virtualExposes-kVGjwQQ8.js';

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
      
        "react-router": async () => {
          let pkg = await import('./index-CZw_nyVY.js');
          return pkg
        }
      ,
        "@lumeweb/portal-framework-core": async () => {
          let pkg = await import('./index-C1ZH-IzB.js');
          return pkg
        }
      ,
        "@lumeweb/portal-framework-ui-core": async () => {
          let pkg = await import('./index-D4CJsKhe.js');
          return pkg
        }
      ,
        "react": async () => {
          let pkg = await import('./index-DEOrzHNV.js').then(n => n.index);
          return pkg
        }
      ,
        "@lumeweb/portal-framework-ui": async () => {
          let pkg = await import('./index-B4GqJ1ZL.js');
          return pkg
        }
      ,
        "@refinedev/core": async () => {
          let pkg = await import('./index-CLaNRmd_.js');
          return pkg
        }
      ,
        "react-hook-form": async () => {
          let pkg = await import('./index.esm-BRVzq0A8.js');
          return pkg
        }
      ,
        "@tanstack/react-query": async () => {
          let pkg = await import('./index-D12WBMyf.js');
          return pkg
        }
      ,
        "react-dom": async () => {
          let pkg = await import('./index-DP1vQLN1.js').then(n => n.index);
          return pkg
        }
      
    };
      const usedShared = {
      
          "react-router": {
            name: "react-router",
            version: "7.5.0",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^7.5.0"
            }
          }
        ,
          "@lumeweb/portal-framework-core": {
            name: "@lumeweb/portal-framework-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^0.0.0"
            }
          }
        ,
          "@lumeweb/portal-framework-ui-core": {
            name: "@lumeweb/portal-framework-ui-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^0.0.0"
            }
          }
        ,
          "react": {
            name: "react",
            version: "18.3.1",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^18.3.1"
            }
          }
        ,
          "@lumeweb/portal-framework-ui": {
            name: "@lumeweb/portal-framework-ui",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^0.0.0"
            }
          }
        ,
          "@refinedev/core": {
            name: "@refinedev/core",
            version: "4.57.9",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^4.57.9"
            }
          }
        ,
          "react-hook-form": {
            name: "react-hook-form",
            version: "7.54.0",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^7.54.0"
            }
          }
        ,
          "@tanstack/react-query": {
            name: "@tanstack/react-query",
            version: "4.36.1",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^4.36.1"
            }
          }
        ,
          "react-dom": {
            name: "react-dom",
            version: "18.3.1",
            scope: ["default"],
            loaded: false,
            from: "core:abuse",
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
              requiredVersion: "^18.3.1"
            }
          }
        
    };
      const usedRemotes = [
      ];

const initTokens = {};
  const shareScopeName = "default";
  const mfName = "core:abuse";
  async function init(shared = {}, initScope = []) {
    const initRes = index_cjs.init({
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
    core_abuse__mf_v__runtimeInit__mf_v__.initResolve(initRes);
    return initRes
  }

  function getExposes(moduleName) {
    if (!(moduleName in exposesMap)) throw new Error(`Module ${moduleName} does not exist in container.`)
    return (exposesMap[moduleName])().then(res => () => res)
  }

export { federationRuntime, getExposes, init };
