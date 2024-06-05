import { r as reactExports, i as isRouteErrorResponse, E as ErrorResponseImpl, A as AbortedDeferredError, D as DeferredData, u as useRouteError, a as redirect, m as matchRoutes, c as createRouter, b as createBrowserHistory, d as mapRouteProperties, j as jsxRuntimeExports } from "./index-BIsqO_uY.js";
import { R as RouterProvider, r as reactDomExports } from "./index-BVHF9LaM.js";
import { u as useRemixContext, S as Scripts, i as invariant, l as loadRouteModule, p as prefetchStyleLinks, _ as __vitePreload, R as RemixContext } from "./components-C01XGMk1.js";
/**
 * @remix-run/react v2.8.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
class RemixErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: props.error || null,
      location: props.location
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location) {
      return {
        error: props.error || null,
        location: props.location
      };
    }
    return {
      error: props.error || state.error,
      location: state.location
    };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ reactExports.createElement(RemixRootDefaultErrorBoundary, {
        error: this.state.error
      });
    } else {
      return this.props.children;
    }
  }
}
function RemixRootDefaultErrorBoundary({
  error
}) {
  console.error(error);
  let heyDeveloper = /* @__PURE__ */ reactExports.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
        console.log(
          "💿 Hey developer 👋. You can provide a way better UX than this when your app throws errors. Check out https://remix.run/guides/errors for more information."
        );
      `
    }
  });
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ reactExports.createElement(BoundaryShell, {
      title: "Unhandled Thrown Response!"
    }, /* @__PURE__ */ reactExports.createElement("h1", {
      style: {
        fontSize: "24px"
      }
    }, error.status, " ", error.statusText), heyDeveloper);
  }
  let errorInstance;
  if (error instanceof Error) {
    errorInstance = error;
  } else {
    let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
    errorInstance = new Error(errorString);
  }
  return /* @__PURE__ */ reactExports.createElement(BoundaryShell, {
    title: "Application Error!"
  }, /* @__PURE__ */ reactExports.createElement("h1", {
    style: {
      fontSize: "24px"
    }
  }, "Application Error"), /* @__PURE__ */ reactExports.createElement("pre", {
    style: {
      padding: "2rem",
      background: "hsla(10, 50%, 50%, 0.1)",
      color: "red",
      overflow: "auto"
    }
  }, errorInstance.stack), heyDeveloper);
}
function BoundaryShell({
  title,
  renderScripts,
  children
}) {
  var _routeModules$root;
  let {
    routeModules
  } = useRemixContext();
  if ((_routeModules$root = routeModules.root) !== null && _routeModules$root !== void 0 && _routeModules$root.Layout) {
    return children;
  }
  return /* @__PURE__ */ reactExports.createElement("html", {
    lang: "en"
  }, /* @__PURE__ */ reactExports.createElement("head", null, /* @__PURE__ */ reactExports.createElement("meta", {
    charSet: "utf-8"
  }), /* @__PURE__ */ reactExports.createElement("meta", {
    name: "viewport",
    content: "width=device-width,initial-scale=1,viewport-fit=cover"
  }), /* @__PURE__ */ reactExports.createElement("title", null, title)), /* @__PURE__ */ reactExports.createElement("body", null, /* @__PURE__ */ reactExports.createElement("main", {
    style: {
      fontFamily: "system-ui, sans-serif",
      padding: "2rem"
    }
  }, children, renderScripts ? /* @__PURE__ */ reactExports.createElement(Scripts, null) : null)));
}
/**
 * @remix-run/react v2.8.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function deserializeErrors(errors) {
  if (!errors)
    return null;
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
 * @remix-run/react v2.8.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function isCatchResponse(response) {
  return response.headers.get("X-Remix-Catch") != null;
}
function isErrorResponse(response) {
  return response.headers.get("X-Remix-Error") != null;
}
function isNetworkErrorResponse(response) {
  return isResponse(response) && response.status >= 400 && response.headers.get("X-Remix-Error") == null && response.headers.get("X-Remix-Catch") == null && response.headers.get("X-Remix-Response") == null;
}
function isRedirectResponse(response) {
  return response.headers.get("X-Remix-Redirect") != null;
}
function isDeferredResponse(response) {
  var _response$headers$get;
  return !!((_response$headers$get = response.headers.get("Content-Type")) !== null && _response$headers$get !== void 0 && _response$headers$get.match(/text\/remix-deferred/));
}
function isResponse(value) {
  return value != null && typeof value.status === "number" && typeof value.statusText === "string" && typeof value.headers === "object" && typeof value.body !== "undefined";
}
function isDeferredData(value) {
  let deferred = value;
  return deferred && typeof deferred === "object" && typeof deferred.data === "object" && typeof deferred.subscribe === "function" && typeof deferred.cancel === "function" && typeof deferred.resolveData === "function";
}
async function fetchData(request, routeId, retry = 0) {
  let url = new URL(request.url);
  url.searchParams.set("_data", routeId);
  let init = {
    signal: request.signal
  };
  if (request.method !== "GET") {
    init.method = request.method;
    let contentType = request.headers.get("Content-Type");
    if (contentType && /\bapplication\/json\b/.test(contentType)) {
      init.headers = {
        "Content-Type": contentType
      };
      init.body = JSON.stringify(await request.json());
    } else if (contentType && /\btext\/plain\b/.test(contentType)) {
      init.headers = {
        "Content-Type": contentType
      };
      init.body = await request.text();
    } else if (contentType && /\bapplication\/x-www-form-urlencoded\b/.test(contentType)) {
      init.body = new URLSearchParams(await request.text());
    } else {
      init.body = await request.formData();
    }
  }
  if (retry > 0) {
    await new Promise((resolve) => setTimeout(resolve, 5 ** retry * 10));
  }
  let revalidation = window.__remixRevalidation;
  let response = await fetch(url.href, init).catch((error) => {
    if (typeof revalidation === "number" && revalidation === window.__remixRevalidation && (error === null || error === void 0 ? void 0 : error.name) === "TypeError" && retry < 3) {
      return fetchData(request, routeId, retry + 1);
    }
    throw error;
  });
  if (isErrorResponse(response)) {
    let data = await response.json();
    let error = new Error(data.message);
    error.stack = data.stack;
    return error;
  }
  if (isNetworkErrorResponse(response)) {
    let text = await response.text();
    let error = new Error(text);
    error.stack = void 0;
    return error;
  }
  return response;
}
const DEFERRED_VALUE_PLACEHOLDER_PREFIX = "__deferred_promise:";
async function parseDeferredReadableStream(stream) {
  if (!stream) {
    throw new Error("parseDeferredReadableStream requires stream argument");
  }
  let deferredData;
  let deferredResolvers = {};
  try {
    let sectionReader = readStreamSections(stream);
    let initialSectionResult = await sectionReader.next();
    let initialSection = initialSectionResult.value;
    if (!initialSection)
      throw new Error("no critical data");
    let criticalData = JSON.parse(initialSection);
    if (typeof criticalData === "object" && criticalData !== null) {
      for (let [eventKey, value] of Object.entries(criticalData)) {
        if (typeof value !== "string" || !value.startsWith(DEFERRED_VALUE_PLACEHOLDER_PREFIX)) {
          continue;
        }
        deferredData = deferredData || {};
        deferredData[eventKey] = new Promise((resolve, reject) => {
          deferredResolvers[eventKey] = {
            resolve: (value2) => {
              resolve(value2);
              delete deferredResolvers[eventKey];
            },
            reject: (error) => {
              reject(error);
              delete deferredResolvers[eventKey];
            }
          };
        });
      }
    }
    void (async () => {
      try {
        for await (let section of sectionReader) {
          let [event, ...sectionDataStrings] = section.split(":");
          let sectionDataString = sectionDataStrings.join(":");
          let data = JSON.parse(sectionDataString);
          if (event === "data") {
            for (let [key, value] of Object.entries(data)) {
              if (deferredResolvers[key]) {
                deferredResolvers[key].resolve(value);
              }
            }
          } else if (event === "error") {
            for (let [key, value] of Object.entries(data)) {
              let err = new Error(value.message);
              err.stack = value.stack;
              if (deferredResolvers[key]) {
                deferredResolvers[key].reject(err);
              }
            }
          }
        }
        for (let [key, resolver] of Object.entries(deferredResolvers)) {
          resolver.reject(new AbortedDeferredError(`Deferred ${key} will never be resolved`));
        }
      } catch (error) {
        for (let resolver of Object.values(deferredResolvers)) {
          resolver.reject(error);
        }
      }
    })();
    return new DeferredData({
      ...criticalData,
      ...deferredData
    });
  } catch (error) {
    for (let resolver of Object.values(deferredResolvers)) {
      resolver.reject(error);
    }
    throw error;
  }
}
async function* readStreamSections(stream) {
  let reader = stream.getReader();
  let buffer = [];
  let sections = [];
  let closed = false;
  let encoder = new TextEncoder();
  let decoder = new TextDecoder();
  let readStreamSection = async () => {
    if (sections.length > 0)
      return sections.shift();
    while (!closed && sections.length === 0) {
      let chunk = await reader.read();
      if (chunk.done) {
        closed = true;
        break;
      }
      buffer.push(chunk.value);
      try {
        let bufferedString = decoder.decode(mergeArrays(...buffer));
        let splitSections = bufferedString.split("\n\n");
        if (splitSections.length >= 2) {
          sections.push(...splitSections.slice(0, -1));
          buffer = [encoder.encode(splitSections.slice(-1).join("\n\n"))];
        }
        if (sections.length > 0) {
          break;
        }
      } catch {
        continue;
      }
    }
    if (sections.length > 0) {
      return sections.shift();
    }
    if (buffer.length > 0) {
      let bufferedString = decoder.decode(mergeArrays(...buffer));
      sections = bufferedString.split("\n\n").filter((s) => s);
      buffer = [];
    }
    return sections.shift();
  };
  let section = await readStreamSection();
  while (section) {
    yield section;
    section = await readStreamSection();
  }
}
function mergeArrays(...arrays) {
  let out = new Uint8Array(arrays.reduce((total, arr) => total + arr.length, 0));
  let offset = 0;
  for (let arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}
/**
 * @remix-run/react v2.8.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function RemixRootDefaultHydrateFallback() {
  return /* @__PURE__ */ reactExports.createElement(BoundaryShell, {
    title: "Loading...",
    renderScripts: true
  }, /* @__PURE__ */ reactExports.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
              console.log(
                "💿 Hey developer 👋. You can provide a way better UX than this " +
                "when your app is running \`clientLoader\` functions on hydration. " +
                "Check out https://remix.run/route/hydrate-fallback for more information."
              );
            `
    }
  }));
}
/**
 * @remix-run/react v2.8.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function groupRoutesByParentId(manifest) {
  let routes = {};
  Object.values(manifest).forEach((route) => {
    let parentId = route.parentId || "";
    if (!routes[parentId]) {
      routes[parentId] = [];
    }
    routes[parentId].push(route);
  });
  return routes;
}
function getRouteComponents(route, routeModule, isSpaMode) {
  let Component = getRouteModuleComponent(routeModule);
  let HydrateFallback = routeModule.HydrateFallback && (!isSpaMode || route.id === "root") ? routeModule.HydrateFallback : route.id === "root" ? RemixRootDefaultHydrateFallback : void 0;
  let ErrorBoundary = routeModule.ErrorBoundary ? routeModule.ErrorBoundary : route.id === "root" ? () => /* @__PURE__ */ reactExports.createElement(RemixRootDefaultErrorBoundary, {
    error: useRouteError()
  }) : void 0;
  if (route.id === "root" && routeModule.Layout) {
    return {
      ...Component ? {
        element: /* @__PURE__ */ reactExports.createElement(routeModule.Layout, null, /* @__PURE__ */ reactExports.createElement(Component, null))
      } : {
        Component
      },
      ...ErrorBoundary ? {
        errorElement: /* @__PURE__ */ reactExports.createElement(routeModule.Layout, null, /* @__PURE__ */ reactExports.createElement(ErrorBoundary, null))
      } : {
        ErrorBoundary
      },
      ...HydrateFallback ? {
        hydrateFallbackElement: /* @__PURE__ */ reactExports.createElement(routeModule.Layout, null, /* @__PURE__ */ reactExports.createElement(HydrateFallback, null))
      } : {
        HydrateFallback
      }
    };
  }
  return {
    Component,
    ErrorBoundary,
    HydrateFallback
  };
}
function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation, manifest, routeModulesCache, initialState, future, isSpaMode) {
  return createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, "", groupRoutesByParentId(manifest), needsRevalidation);
}
function preventInvalidServerHandlerCall(type, route, isSpaMode) {
  if (isSpaMode) {
    let fn2 = type === "action" ? "serverAction()" : "serverLoader()";
    let msg2 = `You cannot call ${fn2} in SPA Mode (routeId: "${route.id}")`;
    console.error(msg2);
    throw new ErrorResponseImpl(400, "Bad Request", new Error(msg2), true);
  }
  let fn = type === "action" ? "serverAction()" : "serverLoader()";
  let msg = `You are trying to call ${fn} on a route that does not have a server ${type} (routeId: "${route.id}")`;
  if (type === "loader" && !route.hasLoader || type === "action" && !route.hasAction) {
    console.error(msg);
    throw new ErrorResponseImpl(400, "Bad Request", new Error(msg), true);
  }
}
function noActionDefinedError(type, routeId) {
  let article = type === "clientAction" ? "a" : "an";
  let msg = `Route "${routeId}" does not have ${article} ${type}, but you are trying to submit to it. To fix this, please add ${article} \`${type}\` function to the route`;
  console.error(msg);
  throw new ErrorResponseImpl(405, "Method Not Allowed", new Error(msg), true);
}
function createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId(manifest), needsRevalidation) {
  return (routesByParentId[parentId] || []).map((route) => {
    let routeModule = routeModulesCache[route.id];
    async function fetchServerLoader(request) {
      if (!route.hasLoader)
        return null;
      return fetchServerHandler(request, route);
    }
    async function fetchServerAction(request) {
      if (!route.hasAction) {
        throw noActionDefinedError("action", route.id);
      }
      return fetchServerHandler(request, route);
    }
    async function prefetchStylesAndCallHandler(handler) {
      let cachedModule = routeModulesCache[route.id];
      let linkPrefetchPromise = cachedModule ? prefetchStyleLinks(route, cachedModule) : Promise.resolve();
      try {
        return handler();
      } finally {
        await linkPrefetchPromise;
      }
    }
    let dataRoute = {
      id: route.id,
      index: route.index,
      path: route.path
    };
    if (routeModule) {
      var _initialState$loaderD, _initialState$errors, _routeModule$clientLo;
      Object.assign(dataRoute, {
        ...dataRoute,
        ...getRouteComponents(route, routeModule, isSpaMode),
        handle: routeModule.handle,
        shouldRevalidate: needsRevalidation ? wrapShouldRevalidateForHdr(route.id, routeModule.shouldRevalidate, needsRevalidation) : routeModule.shouldRevalidate
      });
      let initialData = initialState === null || initialState === void 0 ? void 0 : (_initialState$loaderD = initialState.loaderData) === null || _initialState$loaderD === void 0 ? void 0 : _initialState$loaderD[route.id];
      let initialError = initialState === null || initialState === void 0 ? void 0 : (_initialState$errors = initialState.errors) === null || _initialState$errors === void 0 ? void 0 : _initialState$errors[route.id];
      let isHydrationRequest = needsRevalidation == null && (((_routeModule$clientLo = routeModule.clientLoader) === null || _routeModule$clientLo === void 0 ? void 0 : _routeModule$clientLo.hydrate) === true || !route.hasLoader);
      dataRoute.loader = async ({
        request,
        params
      }) => {
        try {
          let result = await prefetchStylesAndCallHandler(async () => {
            invariant(routeModule, "No `routeModule` available for critical-route loader");
            if (!routeModule.clientLoader) {
              if (isSpaMode)
                return null;
              return fetchServerLoader(request);
            }
            return routeModule.clientLoader({
              request,
              params,
              async serverLoader() {
                preventInvalidServerHandlerCall("loader", route, isSpaMode);
                if (isHydrationRequest) {
                  if (initialError !== void 0) {
                    throw initialError;
                  }
                  return initialData;
                }
                let result2 = await fetchServerLoader(request);
                let unwrapped = await unwrapServerResponse(result2);
                return unwrapped;
              }
            });
          });
          return result;
        } finally {
          isHydrationRequest = false;
        }
      };
      dataRoute.loader.hydrate = shouldHydrateRouteLoader(route, routeModule, isSpaMode);
      dataRoute.action = ({
        request,
        params
      }) => {
        return prefetchStylesAndCallHandler(async () => {
          invariant(routeModule, "No `routeModule` available for critical-route action");
          if (!routeModule.clientAction) {
            if (isSpaMode) {
              throw noActionDefinedError("clientAction", route.id);
            }
            return fetchServerAction(request);
          }
          return routeModule.clientAction({
            request,
            params,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route, isSpaMode);
              let result = await fetchServerAction(request);
              let unwrapped = await unwrapServerResponse(result);
              return unwrapped;
            }
          });
        });
      };
    } else {
      if (!route.hasClientLoader) {
        dataRoute.loader = ({
          request
        }) => prefetchStylesAndCallHandler(() => {
          if (isSpaMode)
            return Promise.resolve(null);
          return fetchServerLoader(request);
        });
      }
      if (!route.hasClientAction) {
        dataRoute.action = ({
          request
        }) => prefetchStylesAndCallHandler(() => {
          if (isSpaMode) {
            throw noActionDefinedError("clientAction", route.id);
          }
          return fetchServerAction(request);
        });
      }
      dataRoute.lazy = async () => {
        let mod = await loadRouteModuleWithBlockingLinks(route, routeModulesCache);
        let lazyRoute = {
          ...mod
        };
        if (mod.clientLoader) {
          let clientLoader = mod.clientLoader;
          lazyRoute.loader = (args) => clientLoader({
            ...args,
            async serverLoader() {
              preventInvalidServerHandlerCall("loader", route, isSpaMode);
              let response = await fetchServerLoader(args.request);
              let result = await unwrapServerResponse(response);
              return result;
            }
          });
        }
        if (mod.clientAction) {
          let clientAction = mod.clientAction;
          lazyRoute.action = (args) => clientAction({
            ...args,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route, isSpaMode);
              let response = await fetchServerAction(args.request);
              let result = await unwrapServerResponse(response);
              return result;
            }
          });
        }
        if (needsRevalidation) {
          lazyRoute.shouldRevalidate = wrapShouldRevalidateForHdr(route.id, mod.shouldRevalidate, needsRevalidation);
        }
        return {
          ...lazyRoute.loader ? {
            loader: lazyRoute.loader
          } : {},
          ...lazyRoute.action ? {
            action: lazyRoute.action
          } : {},
          hasErrorBoundary: lazyRoute.hasErrorBoundary,
          shouldRevalidate: lazyRoute.shouldRevalidate,
          handle: lazyRoute.handle,
          // No need to wrap these in layout since the root route is never
          // loaded via route.lazy()
          Component: lazyRoute.Component,
          ErrorBoundary: lazyRoute.ErrorBoundary
        };
      };
    }
    let children = createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, route.id, routesByParentId, needsRevalidation);
    if (children.length > 0)
      dataRoute.children = children;
    return dataRoute;
  });
}
function wrapShouldRevalidateForHdr(routeId, routeShouldRevalidate, needsRevalidation) {
  let handledRevalidation = false;
  return (arg) => {
    if (!handledRevalidation) {
      handledRevalidation = true;
      return needsRevalidation.has(routeId);
    }
    return routeShouldRevalidate ? routeShouldRevalidate(arg) : arg.defaultShouldRevalidate;
  };
}
async function loadRouteModuleWithBlockingLinks(route, routeModules) {
  let routeModule = await loadRouteModule(route, routeModules);
  await prefetchStyleLinks(route, routeModule);
  return {
    Component: getRouteModuleComponent(routeModule),
    ErrorBoundary: routeModule.ErrorBoundary,
    clientAction: routeModule.clientAction,
    clientLoader: routeModule.clientLoader,
    handle: routeModule.handle,
    links: routeModule.links,
    meta: routeModule.meta,
    shouldRevalidate: routeModule.shouldRevalidate
  };
}
async function fetchServerHandler(request, route) {
  let result = await fetchData(request, route.id);
  if (result instanceof Error) {
    throw result;
  }
  if (isRedirectResponse(result)) {
    throw getRedirect(result);
  }
  if (isCatchResponse(result)) {
    throw result;
  }
  if (isDeferredResponse(result) && result.body) {
    return await parseDeferredReadableStream(result.body);
  }
  return result;
}
function unwrapServerResponse(result) {
  if (isDeferredData(result)) {
    return result.data;
  }
  if (isResponse(result)) {
    let contentType = result.headers.get("Content-Type");
    if (contentType && /\bapplication\/json\b/.test(contentType)) {
      return result.json();
    } else {
      return result.text();
    }
  }
  return result;
}
function getRedirect(response) {
  let status = parseInt(response.headers.get("X-Remix-Status"), 10) || 302;
  let url = response.headers.get("X-Remix-Redirect");
  let headers = {};
  let revalidate = response.headers.get("X-Remix-Revalidate");
  if (revalidate) {
    headers["X-Remix-Revalidate"] = revalidate;
  }
  let reloadDocument = response.headers.get("X-Remix-Reload-Document");
  if (reloadDocument) {
    headers["X-Remix-Reload-Document"] = reloadDocument;
  }
  return redirect(url, {
    status,
    headers
  });
}
function getRouteModuleComponent(routeModule) {
  if (routeModule.default == null)
    return void 0;
  let isEmptyObject = typeof routeModule.default === "object" && Object.keys(routeModule.default).length === 0;
  if (!isEmptyObject) {
    return routeModule.default;
  }
}
function shouldHydrateRouteLoader(route, routeModule, isSpaMode) {
  return isSpaMode && route.id !== "root" || routeModule.clientLoader != null && (routeModule.clientLoader.hydrate === true || route.hasLoader !== true);
}
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
      let imported = await __vitePreload(() => import(assetsManifest.routes[id].module + `?t=${(_assetsManifest$hmr = assetsManifest.hmr) === null || _assetsManifest$hmr === void 0 ? void 0 : _assetsManifest$hmr.timestamp}`), true ? [] : void 0);
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
        if (signal.aborted)
          return;
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
    let routes = createClientRoutes(window.__remixManifest.routes, window.__remixRouteModules, window.__remixContext.state, window.__remixContext.future, window.__remixContext.isSpaMode);
    let hydrationData = void 0;
    if (!window.__remixContext.isSpaMode) {
      hydrationData = {
        ...window.__remixContext.state,
        loaderData: {
          ...window.__remixContext.state.loaderData
        }
      };
      let initialMatches = matchRoutes(routes, window.location);
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
    router = createRouter({
      routes,
      history: createBrowserHistory(),
      basename: window.__remixContext.basename,
      future: {
        v7_normalizeFormMethod: true,
        v7_fetcherPersist: window.__remixContext.future.v3_fetcherPersist,
        v7_partialHydration: true,
        v7_prependBasename: true,
        v7_relativeSplatPath: window.__remixContext.future.v3_relativeSplatPath
      },
      hydrationData,
      mapRouteProperties
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
  return /* @__PURE__ */ reactExports.createElement(RemixContext.Provider, {
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
  })));
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
