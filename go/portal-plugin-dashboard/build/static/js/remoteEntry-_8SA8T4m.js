import { loadShare_1, init_1, core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-DeI6jfgm.js';
import exposesMap from './virtualExposes-DqU1esOM.js';

function BridgeReactPlugin() {
  return {
    name: "bridge-react-plugin",
    beforeInit(args) {
      args.origin;
      return args;
    }
  };
}

const usedShared = {
      
          "@lumeweb/portal-framework-core": {
            name: "@lumeweb/portal-framework-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("@lumeweb/portal-framework-core");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"@lumeweb/portal-framework-core"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              import: false,
            }
          }
        ,
          "@lumeweb/portal-framework-ui": {
            name: "@lumeweb/portal-framework-ui",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("@lumeweb/portal-framework-ui");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"@lumeweb/portal-framework-ui"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              import: false,
            }
          }
        ,
          "@refinedev/core": {
            name: "@refinedev/core",
            version: "4.57.10",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("@refinedev/core");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"@refinedev/core"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.57.10",
              import: false,
            }
          }
        ,
          "react-router": {
            name: "react-router",
            version: "7.5.2",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("react-router");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"react-router"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^7.5.2",
              import: false,
            }
          }
        ,
          "@lumeweb/portal-framework-ui-core": {
            name: "@lumeweb/portal-framework-ui-core",
            version: "0.0.0",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("@lumeweb/portal-framework-ui-core");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"@lumeweb/portal-framework-ui-core"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.0.0",
              import: false,
            }
          }
        ,
          "@tanstack/react-query": {
            name: "@tanstack/react-query",
            version: "4.36.1",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("@tanstack/react-query");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"@tanstack/react-query"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.36.1",
              import: false,
            }
          }
        ,
          "react": {
            name: "react",
            version: "18.3.1",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("react");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"react"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^18.3.1",
              import: false,
            }
          }
        ,
          "react-hook-form": {
            name: "react-hook-form",
            version: "7.54.0",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("react-hook-form");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"react-hook-form"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^7.54.0",
              import: false,
            }
          }
        ,
          "react-dom": {
            name: "react-dom",
            version: "18.3.1",
            scope: ["default"],
            loaded: false,
            from: "core:dashboard",
            async get () {
              {
                const shared = await loadShare_1("react-dom");
                if (shared) return () => shared;
                throw new Error(`Shared module '${"react-dom"}' must be provided by host`);
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^18.3.1",
              import: false,
            }
          }
        
    };
      const usedRemotes = [
      ];

const initTokens = {};
  const shareScopeName = "default";
  const mfName = "core:dashboard";
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
    core_dashboard__mf_v__runtimeInit__mf_v__.initResolve(initRes);
    return initRes
  }

  function getExposes(moduleName) {
    if (!(moduleName in exposesMap)) throw new Error(`Module ${moduleName} does not exist in container.`)
    return (exposesMap[moduleName])().then(res => () => res)
  }

export { getExposes as get, init };
