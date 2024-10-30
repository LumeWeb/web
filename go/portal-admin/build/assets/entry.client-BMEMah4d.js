import { E as ErrorResponseImpl, r as reactExports, m as matchRoutes, c as createRouter, a as createBrowserHistory, b as mapRouteProperties, j as jsxRuntimeExports } from "./index-C3JligFb.js";
import { c as createClientRoutesWithHMRRevalidationOptOut, i as invariant, d as decodeViaTurboStream, a as createClientRoutes, s as shouldHydrateRouteLoader, b as initFogOfWar, g as getSingleFetchDataStrategy, u as useFogOFWarDiscovery, R as RemixContext, e as RemixErrorBoundary, f as RouterProvider, r as reactDomExports } from "./components-Dv2u7XfC.js";
/**
 * @remix-run/react v2.10.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function deserializeErrors(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new ErrorResponseImpl(val.status, val.statusText, val.data, val.internal === true);
    } else if (val && val.__type === "Error") {
      if (val.__subType) {
        let ErrorConstructor = window[val.__subType];
        if (typeof ErrorConstructor === "function") {
          try {
            let error = new ErrorConstructor(val.message);
            error.stack = val.stack;
            serialized[key] = error;
          } catch (e) {
          }
        }
      }
      if (serialized[key] == null) {
        let error = new Error(val.message);
        error.stack = val.stack;
        serialized[key] = error;
      }
    } else {
      serialized[key] = val;
    }
  }
  return serialized;
}
/**
 * @remix-run/react v2.10.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
let stateDecodingPromise;
let router;
let routerInitialized = false;
let hmrAbortController;
let hmrRouterReadyResolve;
let hmrRouterReadyPromise = new Promise((resolve) => {
  hmrRouterReadyResolve = resolve;
}).catch(() => {
  return void 0;
});
if (import.meta && void 0) {
  (void 0).accept("remix:manifest", async ({
    assetsManifest,
    needsRevalidation
  }) => {
    let router2 = await hmrRouterReadyPromise;
    if (!router2) {
      console.error("Failed to accept HMR update because the router was not ready.");
      return;
    }
    let routeIds = [...new Set(router2.state.matches.map((m2) => m2.route.id).concat(Object.keys(window.__remixRouteModules)))];
    if (hmrAbortController) {
      hmrAbortController.abort();
    }
    hmrAbortController = new AbortController();
    let signal = hmrAbortController.signal;
    let newRouteModules = Object.assign({}, window.__remixRouteModules, Object.fromEntries((await Promise.all(routeIds.map(async (id) => {
      var _assetsManifest$hmr, _window$__remixRouteM, _window$__remixRouteM2, _window$__remixRouteM3;
      if (!assetsManifest.routes[id]) {
        return null;
      }
      let imported = await import(assetsManifest.routes[id].module + `?t=${(_assetsManifest$hmr = assetsManifest.hmr) === null || _assetsManifest$hmr === void 0 ? void 0 : _assetsManifest$hmr.timestamp}`);
      return [id, {
        ...imported,
        // react-refresh takes care of updating these in-place,
        // if we don't preserve existing values we'll loose state.
        default: imported.default ? ((_window$__remixRouteM = window.__remixRouteModules[id]) === null || _window$__remixRouteM === void 0 ? void 0 : _window$__remixRouteM.default) ?? imported.default : imported.default,
        ErrorBoundary: imported.ErrorBoundary ? ((_window$__remixRouteM2 = window.__remixRouteModules[id]) === null || _window$__remixRouteM2 === void 0 ? void 0 : _window$__remixRouteM2.ErrorBoundary) ?? imported.ErrorBoundary : imported.ErrorBoundary,
        HydrateFallback: imported.HydrateFallback ? ((_window$__remixRouteM3 = window.__remixRouteModules[id]) === null || _window$__remixRouteM3 === void 0 ? void 0 : _window$__remixRouteM3.HydrateFallback) ?? imported.HydrateFallback : imported.HydrateFallback
      }];
    }))).filter(Boolean)));
    Object.assign(window.__remixRouteModules, newRouteModules);
    let routes = createClientRoutesWithHMRRevalidationOptOut(needsRevalidation, assetsManifest.routes, window.__remixRouteModules, window.__remixContext.state, window.__remixContext.future, window.__remixContext.isSpaMode);
    router2._internalSetRoutes(routes);
    let unsub = router2.subscribe((state) => {
      if (state.revalidation === "idle") {
        unsub();
        if (signal.aborted) return;
        setTimeout(() => {
          Object.assign(window.__remixManifest, assetsManifest);
          window.$RefreshRuntime$.performReactRefresh();
        }, 1);
      }
    });
    window.__remixRevalidation = (window.__remixRevalidation || 0) + 1;
    router2.revalidate();
  });
}
function RemixBrowser(_props) {
  if (!router) {
    let initialPathname = window.__remixContext.url;
    let hydratedPathname = window.location.pathname;
    if (initialPathname !== hydratedPathname && !window.__remixContext.isSpaMode) {
      let errorMsg = `Initial URL (${initialPathname}) does not match URL at time of hydration (${hydratedPathname}), reloading page...`;
      console.error(errorMsg);
      window.location.reload();
      return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null);
    }
    if (window.__remixContext.future.unstable_singleFetch) {
      if (!stateDecodingPromise) {
        let stream = window.__remixContext.stream;
        invariant(stream, "No stream found for single fetch decoding");
        window.__remixContext.stream = void 0;
        stateDecodingPromise = decodeViaTurboStream(stream, window).then((value) => {
          window.__remixContext.state = value.value;
          stateDecodingPromise.value = true;
        }).catch((e) => {
          stateDecodingPromise.error = e;
        });
      }
      if (stateDecodingPromise.error) {
        throw stateDecodingPromise.error;
      }
      if (!stateDecodingPromise.value) {
        throw stateDecodingPromise;
      }
    }
    let routes = createClientRoutes(window.__remixManifest.routes, window.__remixRouteModules, window.__remixContext.state, window.__remixContext.future, window.__remixContext.isSpaMode);
    let hydrationData = void 0;
    if (!window.__remixContext.isSpaMode) {
      hydrationData = {
        ...window.__remixContext.state,
        loaderData: {
          ...window.__remixContext.state.loaderData
        }
      };
      let initialMatches = matchRoutes(routes, window.location, window.__remixContext.basename);
      if (initialMatches) {
        for (let match of initialMatches) {
          let routeId = match.route.id;
          let route = window.__remixRouteModules[routeId];
          let manifestRoute = window.__remixManifest.routes[routeId];
          if (route && shouldHydrateRouteLoader(manifestRoute, route, window.__remixContext.isSpaMode) && (route.HydrateFallback || !manifestRoute.hasLoader)) {
            hydrationData.loaderData[routeId] = void 0;
          } else if (manifestRoute && !manifestRoute.hasLoader) {
            hydrationData.loaderData[routeId] = null;
          }
        }
      }
      if (hydrationData && hydrationData.errors) {
        hydrationData.errors = deserializeErrors(hydrationData.errors);
      }
    }
    let {
      enabled: isFogOfWarEnabled,
      patchRoutesOnMiss
    } = initFogOfWar(window.__remixManifest, window.__remixRouteModules, window.__remixContext.future, window.__remixContext.isSpaMode, window.__remixContext.basename);
    router = createRouter({
      routes,
      history: createBrowserHistory(),
      basename: window.__remixContext.basename,
      future: {
        v7_normalizeFormMethod: true,
        v7_fetcherPersist: window.__remixContext.future.v3_fetcherPersist,
        v7_partialHydration: true,
        v7_prependBasename: true,
        v7_relativeSplatPath: window.__remixContext.future.v3_relativeSplatPath,
        // Single fetch enables this underlying behavior
        v7_skipActionErrorRevalidation: window.__remixContext.future.unstable_singleFetch === true
      },
      hydrationData,
      mapRouteProperties,
      unstable_dataStrategy: window.__remixContext.future.unstable_singleFetch ? getSingleFetchDataStrategy(window.__remixManifest, window.__remixRouteModules) : void 0,
      ...isFogOfWarEnabled ? {
        unstable_patchRoutesOnMiss: patchRoutesOnMiss
      } : {}
    });
    if (router.state.initialized) {
      routerInitialized = true;
      router.initialize();
    }
    router.createRoutesForHMR = createClientRoutesWithHMRRevalidationOptOut;
    window.__remixRouter = router;
    if (hmrRouterReadyResolve) {
      hmrRouterReadyResolve(router);
    }
  }
  let [criticalCss, setCriticalCss] = reactExports.useState(void 0);
  let [location, setLocation] = reactExports.useState(router.state.location);
  reactExports.useLayoutEffect(() => {
    if (!routerInitialized) {
      routerInitialized = true;
      router.initialize();
    }
  }, []);
  reactExports.useLayoutEffect(() => {
    return router.subscribe((newState) => {
      if (newState.location !== location) {
        setLocation(newState.location);
      }
    });
  }, [location]);
  useFogOFWarDiscovery(router, window.__remixManifest, window.__remixRouteModules, window.__remixContext.future, window.__remixContext.isSpaMode);
  return (
    // This fragment is important to ensure we match the <RemixServer> JSX
    // structure so that useId values hydrate correctly
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(RemixContext.Provider, {
      value: {
        manifest: window.__remixManifest,
        routeModules: window.__remixRouteModules,
        future: window.__remixContext.future,
        criticalCss,
        isSpaMode: window.__remixContext.isSpaMode
      }
    }, /* @__PURE__ */ reactExports.createElement(RemixErrorBoundary, {
      location
    }, /* @__PURE__ */ reactExports.createElement(RouterProvider, {
      router,
      fallbackElement: null,
      future: {
        v7_startTransition: true
      }
    }))), window.__remixContext.future.unstable_singleFetch ? /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null) : null)
  );
}
var hydrateRoot;
var m = reactDomExports;
{
  m.createRoot;
  hydrateRoot = m.hydrateRoot;
}
reactExports.startTransition(() => {
  hydrateRoot(
    document,
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemixBrowser, {}) })
  );
});
