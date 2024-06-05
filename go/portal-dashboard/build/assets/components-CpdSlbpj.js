var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { p as parsePath, A as AbortedDeferredError, D as DeferredData, a as redirect, E as ErrorResponseImpl, r as reactExports, o as useHref, m as matchRoutes, e as useLocation, q as DataRouterContext, s as DataRouterStateContext, t as useNavigation, v as useAsyncError, w as Await$1 } from "./index-DVnsepjX.js";
import { L as Link$1, N as NavLink$1 } from "./index-BPJinGo7.js";
var HOLE = -1;
var NAN = -2;
var NEGATIVE_INFINITY = -3;
var NEGATIVE_ZERO = -4;
var NULL = -5;
var POSITIVE_INFINITY = -6;
var UNDEFINED = -7;
var TYPE_BIGINT = "B";
var TYPE_DATE = "D";
var TYPE_ERROR = "E";
var TYPE_MAP = "M";
var TYPE_NULL_OBJECT = "N";
var TYPE_PROMISE = "P";
var TYPE_REGEXP = "R";
var TYPE_SET = "S";
var TYPE_SYMBOL = "Y";
var TYPE_URL = "U";
var Deferred = class {
  constructor() {
    __publicField(this, "promise");
    __publicField(this, "resolve");
    __publicField(this, "reject");
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
};
function createLineSplittingTransform() {
  const decoder = new TextDecoder();
  let leftover = "";
  return new TransformStream({
    transform(chunk, controller) {
      const str = decoder.decode(chunk, { stream: true });
      const parts = (leftover + str).split("\n");
      leftover = parts.pop() || "";
      for (const part of parts) {
        controller.enqueue(part);
      }
    },
    flush(controller) {
      if (leftover) {
        controller.enqueue(leftover);
      }
    }
  });
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var globalObj = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : void 0;
function unflatten(parsed) {
  const { hydrated, values } = this;
  if (typeof parsed === "number")
    return hydrate.call(this, parsed);
  if (!Array.isArray(parsed) || !parsed.length)
    throw new SyntaxError();
  const startIndex = values.length;
  values.push(...parsed);
  hydrated.length = values.length;
  return hydrate.call(this, startIndex);
}
function hydrate(index) {
  const { hydrated, values, deferred, plugins } = this;
  switch (index) {
    case UNDEFINED:
      return;
    case NULL:
      return null;
    case NAN:
      return NaN;
    case POSITIVE_INFINITY:
      return Infinity;
    case NEGATIVE_INFINITY:
      return -Infinity;
    case NEGATIVE_ZERO:
      return -0;
  }
  if (hydrated[index])
    return hydrated[index];
  const value = values[index];
  if (!value || typeof value !== "object")
    return hydrated[index] = value;
  if (Array.isArray(value)) {
    if (typeof value[0] === "string") {
      const [type, b, c] = value;
      switch (type) {
        case TYPE_DATE:
          return hydrated[index] = new Date(b);
        case TYPE_URL:
          return hydrated[index] = new URL(b);
        case TYPE_BIGINT:
          return hydrated[index] = BigInt(b);
        case TYPE_REGEXP:
          return hydrated[index] = new RegExp(b, c);
        case TYPE_SYMBOL:
          return hydrated[index] = Symbol.for(b);
        case TYPE_SET:
          const set = /* @__PURE__ */ new Set();
          hydrated[index] = set;
          for (let i = 1; i < value.length; i++)
            set.add(hydrate.call(this, value[i]));
          return set;
        case TYPE_MAP:
          const map = /* @__PURE__ */ new Map();
          hydrated[index] = map;
          for (let i = 1; i < value.length; i += 2) {
            map.set(
              hydrate.call(this, value[i]),
              hydrate.call(this, value[i + 1])
            );
          }
          return map;
        case TYPE_NULL_OBJECT:
          const obj = /* @__PURE__ */ Object.create(null);
          hydrated[index] = obj;
          for (const key in b)
            obj[hydrate.call(this, Number(key))] = hydrate.call(this, b[key]);
          return obj;
        case TYPE_PROMISE:
          if (hydrated[b]) {
            return hydrated[index] = hydrated[b];
          } else {
            const d = new Deferred();
            deferred[b] = d;
            return hydrated[index] = d.promise;
          }
        case TYPE_ERROR:
          const [, message, errorType] = value;
          let error = errorType && globalObj && globalObj[errorType] ? new globalObj[errorType](message) : new Error(message);
          hydrated[index] = error;
          return error;
        default:
          if (Array.isArray(plugins)) {
            const args = value.slice(1).map((i) => hydrate.call(this, i));
            for (const plugin of plugins) {
              const result = plugin(value[0], ...args);
              if (result)
                return hydrated[index] = result.value;
            }
          }
          throw new SyntaxError();
      }
    } else {
      const array = [];
      hydrated[index] = array;
      for (let i = 0; i < value.length; i++) {
        const n = value[i];
        if (n !== HOLE)
          array[i] = hydrate.call(this, n);
      }
      return array;
    }
  } else {
    const object = {};
    hydrated[index] = object;
    for (const key in value) {
      object[hydrate.call(this, Number(key))] = hydrate.call(
        this,
        value[key]
      );
    }
    return object;
  }
}
async function decode(readable, options) {
  const { plugins } = options ?? {};
  const done = new Deferred();
  const reader = readable.pipeThrough(createLineSplittingTransform()).getReader();
  const decoder = {
    values: [],
    hydrated: [],
    deferred: {},
    plugins
  };
  const decoded = await decodeInitial.call(decoder, reader);
  let donePromise = done.promise;
  if (decoded.done) {
    done.resolve();
  } else {
    donePromise = decodeDeferred.call(decoder, reader).then(done.resolve).catch((reason) => {
      for (const deferred of Object.values(decoder.deferred)) {
        deferred.reject(reason);
      }
      done.reject(reason);
    });
  }
  return {
    done: donePromise.then(() => reader.closed),
    value: decoded.value
  };
}
async function decodeInitial(reader) {
  const read = await reader.read();
  if (!read.value) {
    throw new SyntaxError();
  }
  let line;
  try {
    line = JSON.parse(read.value);
  } catch (reason) {
    throw new SyntaxError();
  }
  return {
    done: read.done,
    value: unflatten.call(this, line)
  };
}
async function decodeDeferred(reader) {
  let read = await reader.read();
  while (!read.done) {
    if (!read.value)
      continue;
    const line = read.value;
    switch (line[0]) {
      case TYPE_PROMISE: {
        const colonIndex = line.indexOf(":");
        const deferredId = Number(line.slice(1, colonIndex));
        const deferred = this.deferred[deferredId];
        if (!deferred) {
          throw new Error(`Deferred ID ${deferredId} not found in stream`);
        }
        const lineData = line.slice(colonIndex + 1);
        let jsonLine;
        try {
          jsonLine = JSON.parse(lineData);
        } catch (reason) {
          throw new SyntaxError();
        }
        const value = unflatten.call(this, jsonLine);
        deferred.resolve(value);
        break;
      }
      case TYPE_ERROR: {
        const colonIndex = line.indexOf(":");
        const deferredId = Number(line.slice(1, colonIndex));
        const deferred = this.deferred[deferredId];
        if (!deferred) {
          throw new Error(`Deferred ID ${deferredId} not found in stream`);
        }
        const lineData = line.slice(colonIndex + 1);
        let jsonLine;
        try {
          jsonLine = JSON.parse(lineData);
        } catch (reason) {
          throw new SyntaxError();
        }
        const value = unflatten.call(this, jsonLine);
        deferred.reject(value);
        break;
      }
      default:
        throw new SyntaxError();
    }
    read = await reader.read();
  }
}
/**
 * @remix-run/server-runtime v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
const SingleFetchRedirectSymbol = Symbol("SingleFetchRedirect");
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import(
      /* webpackIgnore: true */
      route.module
    );
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    if (window.__remixContext.isSpaMode && // @ts-expect-error
    false) {
      console.error(`Error loading route module \`${route.module}\`:`, error);
      throw error;
    }
    window.location.reload();
    return new Promise(() => {
    });
  }
}
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function getKeyedLinksForMatches(matches, routeModules, manifest) {
  let descriptors = matches.map((match) => {
    var _module$links;
    let module = routeModules[match.route.id];
    let route = manifest.routes[match.route.id];
    return [route.css ? route.css.map((href) => ({
      rel: "stylesheet",
      href
    })) : [], (module === null || module === void 0 ? void 0 : (_module$links = module.links) === null || _module$links === void 0 ? void 0 : _module$links.call(module)) || []];
  }).flat(2);
  let preloads = getCurrentPageModulePreloadHrefs(matches, manifest);
  return dedupeLinkDescriptors(descriptors, preloads);
}
async function prefetchStyleLinks(route, routeModule) {
  var _route$css, _routeModule$links;
  if (!route.css && !routeModule.links || !isPreloadSupported())
    return;
  let descriptors = [((_route$css = route.css) === null || _route$css === void 0 ? void 0 : _route$css.map((href) => ({
    rel: "stylesheet",
    href
  }))) ?? [], ((_routeModule$links = routeModule.links) === null || _routeModule$links === void 0 ? void 0 : _routeModule$links.call(routeModule)) ?? []].flat(1);
  if (descriptors.length === 0)
    return;
  let styleLinks = [];
  for (let descriptor of descriptors) {
    if (!isPageLinkDescriptor(descriptor) && descriptor.rel === "stylesheet") {
      styleLinks.push({
        ...descriptor,
        rel: "preload",
        as: "style"
      });
    }
  }
  let matchingLinks = styleLinks.filter((link) => (!link.media || window.matchMedia(link.media).matches) && !document.querySelector(`link[rel="stylesheet"][href="${link.href}"]`));
  await Promise.all(matchingLinks.map(prefetchStyleLink));
}
async function prefetchStyleLink(descriptor) {
  return new Promise((resolve) => {
    let link = document.createElement("link");
    Object.assign(link, descriptor);
    function removeLink() {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    }
    link.onload = () => {
      removeLink();
      resolve();
    };
    link.onerror = () => {
      removeLink();
      resolve();
    };
    document.head.appendChild(link);
  });
}
function isPageLinkDescriptor(object) {
  return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
  if (object == null) {
    return false;
  }
  if (object.href == null) {
    return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
  }
  return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
  let links = await Promise.all(matches.map(async (match) => {
    let mod = await loadRouteModule(manifest.routes[match.route.id], routeModules);
    return mod.links ? mod.links() : [];
  }));
  return dedupeLinkDescriptors(links.flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map((link) => link.rel === "stylesheet" ? {
    ...link,
    rel: "prefetch",
    as: "style"
  } : {
    ...link,
    rel: "prefetch"
  }));
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let path = parsePathPatch(page);
  let isNew = (match, index) => {
    if (!currentMatches[index])
      return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    var _currentMatches$index;
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      ((_currentMatches$index = currentMatches[index].route.path) === null || _currentMatches$index === void 0 ? void 0 : _currentMatches$index.endsWith("*")) && currentMatches[index].params["*"] !== match.params["*"]
    );
  };
  let newMatches = mode === "data" && location.search !== path.search ? (
    // this is really similar to stuff in transition.ts, maybe somebody smarter
    // than me (or in less of a hurry) can share some of it. You're the best.
    nextMatches.filter((match, index) => {
      let manifestRoute = manifest.routes[match.route.id];
      if (!manifestRoute.hasLoader) {
        return false;
      }
      if (isNew(match, index) || matchPathChanged(match, index)) {
        return true;
      }
      if (match.route.shouldRevalidate) {
        var _currentMatches$;
        let routeChoice = match.route.shouldRevalidate({
          currentUrl: new URL(location.pathname + location.search + location.hash, window.origin),
          currentParams: ((_currentMatches$ = currentMatches[0]) === null || _currentMatches$ === void 0 ? void 0 : _currentMatches$.params) || {},
          nextUrl: new URL(page, window.origin),
          nextParams: match.params,
          defaultShouldRevalidate: true
        });
        if (typeof routeChoice === "boolean") {
          return routeChoice;
        }
      }
      return true;
    })
  ) : nextMatches.filter((match, index) => {
    let manifestRoute = manifest.routes[match.route.id];
    return (mode === "assets" || manifestRoute.hasLoader) && (isNew(match, index) || matchPathChanged(match, index));
  });
  return newMatches;
}
function getDataLinkHrefs(page, matches, manifest) {
  let path = parsePathPatch(page);
  return dedupeHrefs(matches.filter((match) => manifest.routes[match.route.id].hasLoader).map((match) => {
    let {
      pathname,
      search
    } = path;
    let searchParams = new URLSearchParams(search);
    searchParams.set("_data", match.route.id);
    return `${pathname}?${searchParams}`;
  }));
}
function getModuleLinkHrefs(matches, manifestPatch) {
  return dedupeHrefs(matches.map((match) => {
    let route = manifestPatch.routes[match.route.id];
    let hrefs = [route.module];
    if (route.imports) {
      hrefs = hrefs.concat(route.imports);
    }
    return hrefs;
  }).flat(1));
}
function getCurrentPageModulePreloadHrefs(matches, manifest) {
  return dedupeHrefs(matches.map((match) => {
    let route = manifest.routes[match.route.id];
    let hrefs = [route.module];
    if (route.imports) {
      hrefs = hrefs.concat(route.imports);
    }
    return hrefs;
  }).flat(1));
}
function dedupeHrefs(hrefs) {
  return [...new Set(hrefs)];
}
function sortKeys(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
  let set = /* @__PURE__ */ new Set();
  let preloadsSet = new Set(preloads);
  return descriptors.reduce((deduped, descriptor) => {
    let alreadyModulePreload = preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href);
    if (alreadyModulePreload) {
      return deduped;
    }
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({
        key,
        link: descriptor
      });
    }
    return deduped;
  }, []);
}
function parsePathPatch(href) {
  let path = parsePath(href);
  if (path.search === void 0)
    path.search = "";
  return path;
}
let _isPreloadSupported;
function isPreloadSupported() {
  if (_isPreloadSupported !== void 0) {
    return _isPreloadSupported;
  }
  let el = document.createElement("link");
  _isPreloadSupported = el.relList.supports("preload");
  el = null;
  return _isPreloadSupported;
}
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
const ESCAPE_LOOKUP = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const ESCAPE_REGEX = /[&><\u2028\u2029]/g;
function escapeHtml(html) {
  return html.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
function createHtml(html) {
  return {
    __html: html
  };
}
/**
 * @remix-run/react v2.9.2
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
  if (retry > 0) {
    await new Promise((resolve) => setTimeout(resolve, 5 ** retry * 10));
  }
  let init = await createRequestInit(request);
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
async function createRequestInit(request) {
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
  return init;
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
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function getSingleFetchDataStrategy(manifest, routeModules) {
  return async ({
    request,
    matches
  }) => request.method !== "GET" ? singleFetchActionStrategy(request, matches) : singleFetchLoaderStrategy(manifest, routeModules, request, matches);
}
function singleFetchActionStrategy(request, matches) {
  return Promise.all(matches.map(async (m) => {
    let actionStatus;
    let result = await m.resolve(async (handler) => {
      let result2 = await handler(async () => {
        let url = singleFetchUrl(request.url);
        let init = await createRequestInit(request);
        let {
          data,
          status
        } = await fetchAndDecode(url, init);
        actionStatus = status;
        return unwrapSingleFetchResult(data, m.route.id);
      });
      return {
        type: "data",
        result: result2,
        status: actionStatus
      };
    });
    return {
      ...result,
      // Proxy along the action HTTP response status for thrown errors
      status: actionStatus
    };
  }));
}
function singleFetchLoaderStrategy(manifest, routeModules, request, matches) {
  let singleFetchPromise;
  return Promise.all(matches.map(async (m) => m.resolve(async (handler) => {
    let result;
    let url = stripIndexParam(singleFetchUrl(request.url));
    if (manifest.routes[m.route.id].hasClientLoader) {
      result = await handler(async () => {
        url.searchParams.set("_routes", m.route.id);
        let {
          data
        } = await fetchAndDecode(url);
        return unwrapSingleFetchResults(data, m.route.id);
      });
    } else {
      result = await handler(async () => {
        if (!singleFetchPromise) {
          url = addRevalidationParam(manifest, routeModules, matches.map((m2) => m2.route), matches.filter((m2) => m2.shouldLoad).map((m2) => m2.route), url);
          singleFetchPromise = fetchAndDecode(url).then(({
            data
          }) => data);
        }
        let results = await singleFetchPromise;
        return unwrapSingleFetchResults(results, m.route.id);
      });
    }
    return {
      type: "data",
      result
    };
  })));
}
function stripIndexParam(url) {
  let indexValues = url.searchParams.getAll("index");
  url.searchParams.delete("index");
  let indexValuesToKeep = [];
  for (let indexValue of indexValues) {
    if (indexValue) {
      indexValuesToKeep.push(indexValue);
    }
  }
  for (let toKeep of indexValuesToKeep) {
    url.searchParams.append("index", toKeep);
  }
  return url;
}
function addRevalidationParam(manifest, routeModules, matchedRoutes, loadRoutes, url) {
  let genRouteIds = (arr) => arr.filter((id) => manifest.routes[id].hasLoader).join(",");
  let needsParam = matchedRoutes.some((r) => {
    var _routeModules$r$id, _manifest$routes$r$id;
    return ((_routeModules$r$id = routeModules[r.id]) === null || _routeModules$r$id === void 0 ? void 0 : _routeModules$r$id.shouldRevalidate) || ((_manifest$routes$r$id = manifest.routes[r.id]) === null || _manifest$routes$r$id === void 0 ? void 0 : _manifest$routes$r$id.hasClientLoader);
  });
  if (!needsParam) {
    return url;
  }
  let matchedIds = genRouteIds(matchedRoutes.map((r) => r.id));
  let loadIds = genRouteIds(loadRoutes.filter((r) => {
    var _manifest$routes$r$id2;
    return !((_manifest$routes$r$id2 = manifest.routes[r.id]) !== null && _manifest$routes$r$id2 !== void 0 && _manifest$routes$r$id2.hasClientLoader);
  }).map((r) => r.id));
  if (matchedIds !== loadIds) {
    url.searchParams.set("_routes", loadIds);
  }
  return url;
}
function singleFetchUrl(reqUrl) {
  let url = typeof reqUrl === "string" ? new URL(reqUrl, window.location.origin) : reqUrl;
  url.pathname = `${url.pathname === "/" ? "_root" : url.pathname}.data`;
  return url;
}
async function fetchAndDecode(url, init) {
  let res = await fetch(url, init);
  invariant(res.body, "No response body to decode");
  try {
    let decoded = await decodeViaTurboStream(res.body, window);
    return {
      status: res.status,
      data: decoded.value
    };
  } catch (e) {
    console.error(e);
    throw new Error(`Unable to decode turbo-stream response from URL: ${url.toString()}`);
  }
}
function decodeViaTurboStream(body, global) {
  return decode(body, {
    plugins: [(type, ...rest) => {
      if (type === "SanitizedError") {
        let [name, message, stack] = rest;
        let Constructor = Error;
        if (name && name in global && typeof global[name] === "function") {
          Constructor = global[name];
        }
        let error = new Constructor(message);
        error.stack = stack;
        return {
          value: error
        };
      }
      if (type === "ErrorResponse") {
        let [data, status, statusText] = rest;
        return {
          value: new ErrorResponseImpl(status, statusText, data)
        };
      }
      if (type === "SingleFetchRedirect") {
        return {
          value: {
            [SingleFetchRedirectSymbol]: rest[0]
          }
        };
      }
    }]
  });
}
function unwrapSingleFetchResults(results, routeId) {
  let redirect2 = results[SingleFetchRedirectSymbol];
  if (redirect2) {
    return unwrapSingleFetchResult(redirect2, routeId);
  }
  return results[routeId] !== void 0 ? unwrapSingleFetchResult(results[routeId], routeId) : null;
}
function unwrapSingleFetchResult(result, routeId) {
  if ("error" in result) {
    throw result.error;
  } else if ("redirect" in result) {
    let headers = {};
    if (result.revalidate) {
      headers["X-Remix-Revalidate"] = "yes";
    }
    if (result.reload) {
      headers["X-Remix-Reload-Document"] = "yes";
    }
    return redirect(result.redirect, {
      status: result.status,
      headers
    });
  } else if ("data" in result) {
    return result.data;
  } else {
    throw new Error(`No response found for routeId "${routeId}"`);
  }
}
/**
 * @remix-run/react v2.9.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function useDataRouterContext() {
  let context = reactExports.useContext(DataRouterContext);
  invariant(context, "You must render this element inside a <DataRouterContext.Provider> element");
  return context;
}
function useDataRouterStateContext() {
  let context = reactExports.useContext(DataRouterStateContext);
  invariant(context, "You must render this element inside a <DataRouterStateContext.Provider> element");
  return context;
}
const RemixContext = /* @__PURE__ */ reactExports.createContext(void 0);
RemixContext.displayName = "Remix";
function useRemixContext() {
  let context = reactExports.useContext(RemixContext);
  invariant(context, "You must render this element inside a <Remix> element");
  return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
  let [maybePrefetch, setMaybePrefetch] = reactExports.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = reactExports.useState(false);
  let {
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onTouchStart
  } = theirElementProps;
  let ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = (entries) => {
        entries.forEach((entry) => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, {
        threshold: 0.5
      });
      if (ref.current)
        observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  let setIntent = () => {
    if (prefetch === "intent") {
      setMaybePrefetch(true);
    }
  };
  let cancelIntent = () => {
    if (prefetch === "intent") {
      setMaybePrefetch(false);
      setShouldPrefetch(false);
    }
  };
  reactExports.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  return [shouldPrefetch, ref, {
    onFocus: composeEventHandlers(onFocus, setIntent),
    onBlur: composeEventHandlers(onBlur, cancelIntent),
    onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
    onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
    onTouchStart: composeEventHandlers(onTouchStart, setIntent)
  }];
}
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
let NavLink = /* @__PURE__ */ reactExports.forwardRef(({
  to,
  prefetch = "none",
  ...props
}, forwardedRef) => {
  let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);
  let href = useHref(to);
  let [shouldPrefetch, ref, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(NavLink$1, _extends({}, props, prefetchHandlers, {
    ref: mergeRefs(forwardedRef, ref),
    to
  })), shouldPrefetch && !isAbsolute ? /* @__PURE__ */ reactExports.createElement(PrefetchPageLinks, {
    page: href
  }) : null);
});
NavLink.displayName = "NavLink";
let Link = /* @__PURE__ */ reactExports.forwardRef(({
  to,
  prefetch = "none",
  ...props
}, forwardedRef) => {
  let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);
  let href = useHref(to);
  let [shouldPrefetch, ref, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(Link$1, _extends({}, props, prefetchHandlers, {
    ref: mergeRefs(forwardedRef, ref),
    to
  })), shouldPrefetch && !isAbsolute ? /* @__PURE__ */ reactExports.createElement(PrefetchPageLinks, {
    page: href
  }) : null);
});
Link.displayName = "Link";
function composeEventHandlers(theirHandler, ourHandler) {
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}
function getActiveMatches(matches, errors, isSpaMode) {
  if (isSpaMode && !isHydrated) {
    return [matches[0]];
  }
  if (errors) {
    let errorIdx = matches.findIndex((m) => errors[m.route.id] !== void 0);
    return matches.slice(0, errorIdx + 1);
  }
  return matches;
}
function Links() {
  let {
    isSpaMode,
    manifest,
    routeModules,
    criticalCss
  } = useRemixContext();
  let {
    errors,
    matches: routerMatches
  } = useDataRouterStateContext();
  let matches = getActiveMatches(routerMatches, errors, isSpaMode);
  let keyedLinks = reactExports.useMemo(() => getKeyedLinksForMatches(matches, routeModules, manifest), [matches, routeModules, manifest]);
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, criticalCss ? /* @__PURE__ */ reactExports.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: criticalCss
    }
  }) : null, keyedLinks.map(({
    key,
    link
  }) => isPageLinkDescriptor(link) ? /* @__PURE__ */ reactExports.createElement(PrefetchPageLinks, _extends({
    key
  }, link)) : /* @__PURE__ */ reactExports.createElement("link", _extends({
    key
  }, link))));
}
function PrefetchPageLinks({
  page,
  ...dataLinkProps
}) {
  let {
    router
  } = useDataRouterContext();
  let matches = reactExports.useMemo(() => matchRoutes(router.routes, page, router.basename), [router.routes, page, router.basename]);
  if (!matches) {
    console.warn(`Tried to prefetch ${page} but no routes matched.`);
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement(PrefetchPageLinksImpl, _extends({
    page,
    matches
  }, dataLinkProps));
}
function useKeyedPrefetchLinks(matches) {
  let {
    manifest,
    routeModules
  } = useRemixContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = reactExports.useState([]);
  reactExports.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then((links) => {
      if (!interrupted) {
        setKeyedPrefetchLinks(links);
      }
    });
    return () => {
      interrupted = true;
    };
  }, [matches, manifest, routeModules]);
  return keyedPrefetchLinks;
}
function PrefetchPageLinksImpl({
  page,
  matches: nextMatches,
  ...linkProps
}) {
  let location = useLocation();
  let {
    future,
    manifest,
    routeModules
  } = useRemixContext();
  let {
    matches
  } = useDataRouterStateContext();
  let newMatchesForData = reactExports.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "data"), [page, nextMatches, matches, manifest, location]);
  let newMatchesForAssets = reactExports.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "assets"), [page, nextMatches, matches, manifest, location]);
  let dataHrefs = reactExports.useMemo(() => getDataLinkHrefs(page, newMatchesForData, manifest), [newMatchesForData, page, manifest]);
  let moduleHrefs = reactExports.useMemo(() => getModuleLinkHrefs(newMatchesForAssets, manifest), [newMatchesForAssets, manifest]);
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  let linksToRender = null;
  if (!future.unstable_singleFetch) {
    linksToRender = dataHrefs.map((href) => /* @__PURE__ */ reactExports.createElement("link", _extends({
      key: href,
      rel: "prefetch",
      as: "fetch",
      href
    }, linkProps)));
  } else if (newMatchesForData.length > 0) {
    let url = addRevalidationParam(manifest, routeModules, nextMatches.map((m) => m.route), newMatchesForData.map((m) => m.route), singleFetchUrl(page));
    if (url.searchParams.get("_routes") !== "") {
      linksToRender = /* @__PURE__ */ reactExports.createElement("link", _extends({
        key: url.pathname + url.search,
        rel: "prefetch",
        as: "fetch",
        href: url.pathname + url.search
      }, linkProps));
    }
  } else
    ;
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, linksToRender, moduleHrefs.map((href) => /* @__PURE__ */ reactExports.createElement("link", _extends({
    key: href,
    rel: "modulepreload",
    href
  }, linkProps))), keyedPrefetchLinks.map(({
    key,
    link
  }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ reactExports.createElement("link", _extends({
      key
    }, link))
  )));
}
function Meta() {
  let {
    isSpaMode,
    routeModules
  } = useRemixContext();
  let {
    errors,
    matches: routerMatches,
    loaderData
  } = useDataRouterStateContext();
  let location = useLocation();
  let _matches = getActiveMatches(routerMatches, errors, isSpaMode);
  let error = null;
  if (errors) {
    error = errors[_matches[_matches.length - 1].route.id];
  }
  let meta = [];
  let leafMeta = null;
  let matches = [];
  for (let i = 0; i < _matches.length; i++) {
    let _match = _matches[i];
    let routeId = _match.route.id;
    let data = loaderData[routeId];
    let params = _match.params;
    let routeModule = routeModules[routeId];
    let routeMeta = [];
    let match = {
      id: routeId,
      data,
      meta: [],
      params: _match.params,
      pathname: _match.pathname,
      handle: _match.route.handle,
      error
    };
    matches[i] = match;
    if (routeModule !== null && routeModule !== void 0 && routeModule.meta) {
      routeMeta = typeof routeModule.meta === "function" ? routeModule.meta({
        data,
        params,
        location,
        matches,
        error
      }) : Array.isArray(routeModule.meta) ? [...routeModule.meta] : routeModule.meta;
    } else if (leafMeta) {
      routeMeta = [...leafMeta];
    }
    routeMeta = routeMeta || [];
    if (!Array.isArray(routeMeta)) {
      throw new Error("The route at " + _match.route.path + " returns an invalid value. All route meta functions must return an array of meta objects.\n\nTo reference the meta function API, see https://remix.run/route/meta");
    }
    match.meta = routeMeta;
    matches[i] = match;
    meta = [...routeMeta];
    leafMeta = meta;
  }
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, meta.flat().map((metaProps) => {
    if (!metaProps) {
      return null;
    }
    if ("tagName" in metaProps) {
      let {
        tagName,
        ...rest
      } = metaProps;
      if (!isValidMetaTag(tagName)) {
        console.warn(`A meta object uses an invalid tagName: ${tagName}. Expected either 'link' or 'meta'`);
        return null;
      }
      let Comp = tagName;
      return /* @__PURE__ */ reactExports.createElement(Comp, _extends({
        key: JSON.stringify(rest)
      }, rest));
    }
    if ("title" in metaProps) {
      return /* @__PURE__ */ reactExports.createElement("title", {
        key: "title"
      }, String(metaProps.title));
    }
    if ("charset" in metaProps) {
      metaProps.charSet ?? (metaProps.charSet = metaProps.charset);
      delete metaProps.charset;
    }
    if ("charSet" in metaProps && metaProps.charSet != null) {
      return typeof metaProps.charSet === "string" ? /* @__PURE__ */ reactExports.createElement("meta", {
        key: "charSet",
        charSet: metaProps.charSet
      }) : null;
    }
    if ("script:ld+json" in metaProps) {
      try {
        let json = JSON.stringify(metaProps["script:ld+json"]);
        return /* @__PURE__ */ reactExports.createElement("script", {
          key: `script:ld+json:${json}`,
          type: "application/ld+json",
          dangerouslySetInnerHTML: {
            __html: json
          }
        });
      } catch (err) {
        return null;
      }
    }
    return /* @__PURE__ */ reactExports.createElement("meta", _extends({
      key: JSON.stringify(metaProps)
    }, metaProps));
  }));
}
function isValidMetaTag(tagName) {
  return typeof tagName === "string" && /^(meta|link)$/.test(tagName);
}
function Await(props) {
  return /* @__PURE__ */ reactExports.createElement(Await$1, props);
}
let isHydrated = false;
function Scripts(props) {
  let {
    manifest,
    serverHandoffString,
    abortDelay,
    serializeError,
    isSpaMode,
    future,
    renderMeta
  } = useRemixContext();
  let {
    router,
    static: isStatic,
    staticContext
  } = useDataRouterContext();
  let {
    matches: routerMatches
  } = useDataRouterStateContext();
  let navigation = useNavigation();
  if (renderMeta) {
    renderMeta.didRenderScripts = true;
  }
  let matches = getActiveMatches(routerMatches, null, isSpaMode);
  reactExports.useEffect(() => {
    isHydrated = true;
  }, []);
  let serializePreResolvedErrorImp = (key, error) => {
    let toSerialize;
    if (serializeError && error instanceof Error) {
      toSerialize = serializeError(error);
    } else {
      toSerialize = error;
    }
    return `${JSON.stringify(key)}:__remixContext.p(!1, ${escapeHtml(JSON.stringify(toSerialize))})`;
  };
  let serializePreresolvedDataImp = (routeId, key, data) => {
    let serializedData;
    try {
      serializedData = JSON.stringify(data);
    } catch (error) {
      return serializePreResolvedErrorImp(key, error);
    }
    return `${JSON.stringify(key)}:__remixContext.p(${escapeHtml(serializedData)})`;
  };
  let serializeErrorImp = (routeId, key, error) => {
    let toSerialize;
    if (serializeError && error instanceof Error) {
      toSerialize = serializeError(error);
    } else {
      toSerialize = error;
    }
    return `__remixContext.r(${JSON.stringify(routeId)}, ${JSON.stringify(key)}, !1, ${escapeHtml(JSON.stringify(toSerialize))})`;
  };
  let serializeDataImp = (routeId, key, data) => {
    let serializedData;
    try {
      serializedData = JSON.stringify(data);
    } catch (error) {
      return serializeErrorImp(routeId, key, error);
    }
    return `__remixContext.r(${JSON.stringify(routeId)}, ${JSON.stringify(key)}, ${escapeHtml(serializedData)})`;
  };
  let deferredScripts = [];
  let initialScripts = reactExports.useMemo(() => {
    var _manifest$hmr;
    let streamScript = future.unstable_singleFetch ? (
      // prettier-ignore
      "window.__remixContext.stream = new ReadableStream({start(controller){window.__remixContext.streamController = controller;}}).pipeThrough(new TextEncoderStream());"
    ) : "";
    let contextScript = staticContext ? `window.__remixContext = ${serverHandoffString};${streamScript}` : " ";
    let activeDeferreds = future.unstable_singleFetch ? void 0 : staticContext === null || staticContext === void 0 ? void 0 : staticContext.activeDeferreds;
    contextScript += !activeDeferreds ? "" : ["__remixContext.p = function(v,e,p,x) {", "  if (typeof e !== 'undefined') {", '    x=new Error("Unexpected Server Error");\n    x.stack=undefined;', "    p=Promise.reject(x);", "  } else {", "    p=Promise.resolve(v);", "  }", "  return p;", "};", "__remixContext.n = function(i,k) {", "  __remixContext.t = __remixContext.t || {};", "  __remixContext.t[i] = __remixContext.t[i] || {};", "  let p = new Promise((r, e) => {__remixContext.t[i][k] = {r:(v)=>{r(v);},e:(v)=>{e(v);}};});", typeof abortDelay === "number" ? `setTimeout(() => {if(typeof p._error !== "undefined" || typeof p._data !== "undefined"){return;} __remixContext.t[i][k].e(new Error("Server timeout."))}, ${abortDelay});` : "", "  return p;", "};", "__remixContext.r = function(i,k,v,e,p,x) {", "  p = __remixContext.t[i][k];", "  if (typeof e !== 'undefined') {", '    x=new Error("Unexpected Server Error");\n    x.stack=undefined;', "    p.e(x);", "  } else {", "    p.r(v);", "  }", "};"].join("\n") + Object.entries(activeDeferreds).map(([routeId, deferredData]) => {
      let pendingKeys = new Set(deferredData.pendingKeys);
      let promiseKeyValues = deferredData.deferredKeys.map((key) => {
        if (pendingKeys.has(key)) {
          deferredScripts.push(/* @__PURE__ */ reactExports.createElement(DeferredHydrationScript, {
            key: `${routeId} | ${key}`,
            deferredData,
            routeId,
            dataKey: key,
            scriptProps: props,
            serializeData: serializeDataImp,
            serializeError: serializeErrorImp
          }));
          return `${JSON.stringify(key)}:__remixContext.n(${JSON.stringify(routeId)}, ${JSON.stringify(key)})`;
        } else {
          let trackedPromise = deferredData.data[key];
          if (typeof trackedPromise._error !== "undefined") {
            return serializePreResolvedErrorImp(key, trackedPromise._error);
          } else {
            return serializePreresolvedDataImp(routeId, key, trackedPromise._data);
          }
        }
      }).join(",\n");
      return `Object.assign(__remixContext.state.loaderData[${JSON.stringify(routeId)}], {${promiseKeyValues}});`;
    }).join("\n") + (deferredScripts.length > 0 ? `__remixContext.a=${deferredScripts.length};` : "");
    let routeModulesScript = !isStatic ? " " : `${(_manifest$hmr = manifest.hmr) !== null && _manifest$hmr !== void 0 && _manifest$hmr.runtime ? `import ${JSON.stringify(manifest.hmr.runtime)};` : ""}import ${JSON.stringify(manifest.url)};
${matches.map((match, index) => `import * as route${index} from ${JSON.stringify(manifest.routes[match.route.id].module)};`).join("\n")}
window.__remixRouteModules = {${matches.map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`).join(",")}};

import(${JSON.stringify(manifest.entry.module)});`;
    return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("script", _extends({}, props, {
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: createHtml(contextScript),
      type: void 0
    })), /* @__PURE__ */ reactExports.createElement("script", _extends({}, props, {
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: createHtml(routeModulesScript),
      type: "module",
      async: true
    })));
  }, []);
  if (!isStatic && typeof __remixContext === "object" && __remixContext.a) {
    for (let i = 0; i < __remixContext.a; i++) {
      deferredScripts.push(/* @__PURE__ */ reactExports.createElement(DeferredHydrationScript, {
        key: i,
        scriptProps: props,
        serializeData: serializeDataImp,
        serializeError: serializeErrorImp
      }));
    }
  }
  let nextMatches = reactExports.useMemo(() => {
    if (navigation.location) {
      let matches2 = matchRoutes(router.routes, navigation.location, router.basename);
      invariant(matches2, `No routes match path "${navigation.location.pathname}"`);
      return matches2;
    }
    return [];
  }, [navigation.location, router.routes, router.basename]);
  let routePreloads = matches.concat(nextMatches).map((match) => {
    let route = manifest.routes[match.route.id];
    return (route.imports || []).concat([route.module]);
  }).flat(1);
  let preloads = isHydrated ? [] : manifest.entry.imports.concat(routePreloads);
  return isHydrated ? null : /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("link", {
    rel: "modulepreload",
    href: manifest.url,
    crossOrigin: props.crossOrigin
  }), /* @__PURE__ */ reactExports.createElement("link", {
    rel: "modulepreload",
    href: manifest.entry.module,
    crossOrigin: props.crossOrigin
  }), dedupe(preloads).map((path) => /* @__PURE__ */ reactExports.createElement("link", {
    key: path,
    rel: "modulepreload",
    href: path,
    crossOrigin: props.crossOrigin
  })), initialScripts, deferredScripts);
}
function DeferredHydrationScript({
  dataKey,
  deferredData,
  routeId,
  scriptProps,
  serializeData,
  serializeError
}) {
  if (typeof document === "undefined" && deferredData && dataKey && routeId) {
    invariant(deferredData.pendingKeys.includes(dataKey), `Deferred data for route ${routeId} with key ${dataKey} was not pending but tried to render a script for it.`);
  }
  return /* @__PURE__ */ reactExports.createElement(reactExports.Suspense, {
    fallback: (
      // This makes absolutely no sense. The server renders null as a fallback,
      // but when hydrating, we need to render a script tag to avoid a hydration issue.
      // To reproduce a hydration mismatch, just render null as a fallback.
      typeof document === "undefined" && deferredData && dataKey && routeId ? null : /* @__PURE__ */ reactExports.createElement("script", _extends({}, scriptProps, {
        async: true,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {
          __html: " "
        }
      }))
    )
  }, typeof document === "undefined" && deferredData && dataKey && routeId ? /* @__PURE__ */ reactExports.createElement(Await, {
    resolve: deferredData.data[dataKey],
    errorElement: /* @__PURE__ */ reactExports.createElement(ErrorDeferredHydrationScript, {
      dataKey,
      routeId,
      scriptProps,
      serializeError
    }),
    children: (data) => {
      return /* @__PURE__ */ reactExports.createElement("script", _extends({}, scriptProps, {
        async: true,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {
          __html: serializeData(routeId, dataKey, data)
        }
      }));
    }
  }) : /* @__PURE__ */ reactExports.createElement("script", _extends({}, scriptProps, {
    async: true,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: " "
    }
  })));
}
function ErrorDeferredHydrationScript({
  dataKey,
  routeId,
  scriptProps,
  serializeError
}) {
  let error = useAsyncError();
  return /* @__PURE__ */ reactExports.createElement("script", _extends({}, scriptProps, {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: serializeError(routeId, dataKey, error)
    }
  }));
}
function dedupe(array) {
  return [...new Set(array)];
}
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
export {
  Link as L,
  Meta as M,
  RemixContext as R,
  Scripts as S,
  _extends as _,
  isRedirectResponse as a,
  isCatchResponse as b,
  isDeferredResponse as c,
  parseDeferredReadableStream as d,
  isDeferredData as e,
  fetchData as f,
  isResponse as g,
  decodeViaTurboStream as h,
  invariant as i,
  getSingleFetchDataStrategy as j,
  Links as k,
  loadRouteModule as l,
  prefetchStyleLinks as p,
  useRemixContext as u
};
