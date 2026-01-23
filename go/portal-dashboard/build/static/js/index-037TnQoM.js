import { createEnv, boolean, string } from './schemas-CA767HQ5.js';
import { React, dashboard__loadShare__react__loadShare__ } from './dashboard__loadShare__react__loadShare__-CpgLq0wn.js';
import { m, dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, dashboard__loadShare__react_mf_2_router__loadShare__ } from './dashboard__loadShare__react_mf_2_router__loadShare__-Bi31I4AN.js';
import { jsxRuntimeExports } from './jsx-runtime-DIQgdeXv.js';
import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { index_cjs } from './virtual_mf-REMOTE_ENTRY_ID-BdhRAtt4.js';
import { createLucideIcon } from './createLucideIcon-BGXC8EXb.js';
import './parse-owPI_Zlz.js';
import './dashboard__mf_v__runtimeInit__mf_v__-BgQBwuY5.js';
import './virtualExposes-DwA08f_D.js';
import './preload-helper-Dk3k6Zm1.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode);

//#region src/util/validation.ts
function validateCapability(cap) {
	return !!cap.id && !!cap.type && typeof cap.initialize === "function" && typeof cap.destroy === "function";
}
function validateCapabilityDetailed(cap) {
	const missingProperties = [];
	if (!cap.id) missingProperties.push("id");
	if (!cap.type) missingProperties.push("type");
	if (typeof cap.initialize !== "function") missingProperties.push("initialize()");
	if (typeof cap.destroy !== "function") missingProperties.push("destroy()");
	if (!cap.status) missingProperties.push("status");
	return {
		isValid: missingProperties.length === 0,
		missingProperties
	};
}
function validateFeature(feature) {
	if (!!feature.id && typeof feature.initialize === "function" && typeof feature.destroy === "function") return true;
	return false;
}
function validateFeatureDetailed(feature) {
	const missingProperties = [];
	if (!feature.id) missingProperties.push("id");
	if (typeof feature.initialize !== "function") missingProperties.push("initialize()");
	if (typeof feature.destroy !== "function") missingProperties.push("destroy()");
	return {
		isValid: missingProperties.length === 0,
		missingProperties
	};
}
function validatePlugin(plugin) {
	if (!!plugin.id && typeof plugin.initialize === "function" && typeof plugin.destroy === "function") return true;
	return false;
}
function validatePluginDetailed(plugin) {
	const missingProperties = [];
	if (!plugin.id) missingProperties.push("id");
	if (typeof plugin.initialize !== "function") missingProperties.push("initialize()");
	if (typeof plugin.destroy !== "function") missingProperties.push("destroy()");
	return {
		isValid: missingProperties.length === 0,
		missingProperties
	};
}

//#region src/util/namespace.ts
function createNamespacedId(namespace, name) {
	return `${namespace}:${name}`;
}
function isNamespacedId(id) {
	const parts = id.split(":");
	return parts.length === 2 && parts.every((part) => part.length > 0);
}
function normalizeId(pluginId, id) {
	if (id.includes(":")) return id;
	const [namespace] = pluginId.split(":");
	return createNamespacedId(namespace, id);
}
function parseNamespacedId(id) {
	const [namespace, ...rest] = id.split(":");
	return {
		name: rest.join(":"),
		namespace
	};
}
function validateNamespacedId(id) {
	if (!id.includes(":") || id.split(":").length !== 2) throw new Error(`Invalid namespaced identifier: ${id}`);
}

//#region src/util/dependencyGraph.ts
var DependencyGraph = class {
	#dependencies = /* @__PURE__ */ new Map();
	#nodes = /* @__PURE__ */ new Set();
	#reverseLookup = /* @__PURE__ */ new Map();
	addDependency(from, to) {
		this.addNode(from);
		this.addNode(to);
		this.#dependencies.get(from).add(to);
		this.#reverseLookup.get(to).add(from);
	}
	addNode(node) {
		if (!this.#nodes.has(node)) {
			this.#nodes.add(node);
			this.#dependencies.set(node, /* @__PURE__ */ new Set());
			this.#reverseLookup.set(node, /* @__PURE__ */ new Set());
		}
	}
	getDependencies(node) {
		return new Set(this.#dependencies.get(node));
	}
	getDependents(node) {
		return new Set(this.#reverseLookup.get(node));
	}
	topologicalSort() {
		const visited = /* @__PURE__ */ new Set();
		const sorted = [];
		const temp = /* @__PURE__ */ new Set();
		const visit = (node) => {
			if (temp.has(node)) throw new Error(`Circular dependency detected involving ${String(node)}`);
			if (!visited.has(node)) {
				temp.add(node);
				for (const dep of this.#dependencies.get(node)) visit(dep);
				temp.delete(node);
				visited.add(node);
				sorted.push(node);
			}
		};
		const rootNodes = Array.from(this.#nodes).filter((node) => this.#reverseLookup.get(node).size === 0);
		for (const node of rootNodes) visit(node);
		for (const node of this.#nodes) visit(node);
		return sorted;
	}
};

//#region src/errors.ts
var BaseError = class extends Error {
	cause;
	originalId;
	constructor(message, options) {
		super(message);
		this.name = this.constructor.name;
		if (options?.cause) this.cause = options.cause;
		if (options?.originalId) this.originalId = options.originalId;
	}
};
var FeatureLoadError = class extends BaseError {
	constructor(id, cause) {
		super(`Failed to load feature: ${id}`, {
			cause,
			originalId: id
		});
		this.name = "FeatureLoadError";
	}
};
var PluginInitError = class extends BaseError {
	constructor(id, cause) {
		super(`Failed to initialize plugin: ${id}`, {
			cause,
			originalId: id
		});
		this.name = "PluginInitError";
	}
};
var PluginLoadError = class extends BaseError {
	constructor(id, cause) {
		super(`Failed to load plugin: ${id}`, {
			cause,
			originalId: id
		});
		this.name = "PluginLoadError";
	}
};

//#region src/plugins/manager.ts
var PluginManager = class {
	set framework(value) {
		this._framework = value;
	}
	get framework() {
		if (!this._framework) throw new Error("Framework not set");
		return this._framework;
	}
	get remoteModules() {
		return this.#remoteModules;
	}
	#enabledPlugins = /* @__PURE__ */ new Set();
	#features = /* @__PURE__ */ new Map();
	#featureStates = /* @__PURE__ */ new Map();
	#loadedPlugins = /* @__PURE__ */ new Map();
	#pluginFactories = /* @__PURE__ */ new Map();
	#pluginStates = /* @__PURE__ */ new Map();
	#remoteModules = /* @__PURE__ */ new Map();
	_framework = null;
	async destroyPlugin(id) {
		const plugin = this.#loadedPlugins.get(id);
		if (!plugin) return;
		if (plugin.features) for (const feature of plugin.features) await this.#destroyFeature(feature.id);
		if (plugin.destroy) try {
			await plugin.destroy(this.framework);
		} catch (error) {
			console.error(`Error destroying plugin ${id}:`, error);
		}
		this.#loadedPlugins.delete(id);
		this.#pluginStates.delete(id);
	}
	async destroyPlugins() {
		const order = this.getInitializationOrder().reverse();
		for (const pluginId of order) await this.destroyPlugin(pluginId);
	}
	enableAndActivatePlugin(pluginId) {
		this.enablePlugin(pluginId);
		this.getOrActivatePlugin(pluginId);
	}
	enablePlugin(id) {
		validateNamespacedId(id);
		this.#enabledPlugins.add(id);
	}
	getEnabledPlugins() {
		return Array.from(this.#enabledPlugins);
	}
	getFailedPlugins() {
		return Array.from(this.#pluginStates.entries()).filter(([_, state]) => state.loadState === "failed" || state.initState === "failed").map(([id, state]) => ({
			error: state.error,
			id
		}));
	}
	async getFeature(id) {
		return this.#features.get(id);
	}
	getFeatureState(id) {
		return this.#featureStates.get(id);
	}
	async getFeatureWithFallback(id) {
		try {
			return await this.getFeature(id);
		} catch (error) {
			console.warn(`Failed to get feature ${id}:`, error);
			return;
		}
	}
	getInitializationOrder() {
		const graph = new DependencyGraph();
		for (const pluginId of this.#enabledPlugins) graph.addNode(pluginId);
		for (const pluginId of this.#enabledPlugins) {
			const plugin = this.#loadedPlugins.get(pluginId);
			if (plugin?.dependencies) {
				for (const dep of plugin.dependencies) if (this.#enabledPlugins.has(dep.id)) graph.addDependency(pluginId, dep.id);
			}
		}
		try {
			return graph.topologicalSort();
		} catch (error) {
			console.error("Failed to sort plugins topologically:", error);
			return Array.from(this.#enabledPlugins);
		}
	}
	getOrActivatePlugin(id) {
		if (!this.isPluginEnabled(id)) return;
		this.#trackPluginLoad(id);
		if (this.#loadedPlugins.has(id)) return this.#loadedPlugins.get(id);
		try {
			const factory = this.#pluginFactories.get(id);
			if (factory) {
				const plugin = factory();
				this.#loadedPlugins.set(id, plugin);
				this.#markPluginLoaded(id);
				return plugin;
			}
		} catch (error) {
			this.#markPluginFailed(id, error instanceof Error ? error : new Error(String(error)));
		}
	}
	getPlugin(id) {
		return this.#loadedPlugins.get(id);
	}
	getPlugins() {
		return Array.from(this.#loadedPlugins.values());
	}
	getPluginState(id) {
		return this.#pluginStates.get(id);
	}
	getRemoteModule(pluginId) {
		return Array.from(this.#remoteModules.values()).find((m) => m.pluginId === pluginId);
	}
	hasCapability(type) {
		return Array.from(this.#loadedPlugins.values()).some((plugin) => plugin.capabilities?.some((cap) => cap.type === type));
	}
	hasDependencies(plugin) {
		if (!plugin.dependencies) return true;
		return plugin.dependencies.every((dep) => this.#loadedPlugins.has(dep.id));
	}
	hasFeature(id) {
		return Array.from(this.#loadedPlugins.values()).some((plugin) => plugin.features?.some((f) => f.id === id));
	}
	async initializePlugins() {
		const failures = /* @__PURE__ */ new Map();
		const order = this.getInitializationOrder();
		if (!order || !Array.isArray(order)) return failures;
		for (const pluginId of order) {
			if (!this.isPluginEnabled(pluginId)) continue;
			const plugin = this.#loadedPlugins.get(pluginId);
			if (!plugin?.initialize) continue;
			const pluginValidationResult = validatePluginDetailed(plugin);
			if (!pluginValidationResult.isValid) {
				const error = new PluginLoadError(pluginId, /* @__PURE__ */ new Error(`Plugin ${pluginId} does not comply with Plugin interface. Missing: ${pluginValidationResult.missingProperties.join(", ")}`));
				failures.set(pluginId, error);
				this.#markPluginFailed(pluginId, error);
				continue;
			}
			const unreadyDeps = (plugin.dependencies ?? []).filter((dep) => {
				if (!this.isPluginEnabled(dep.id)) return false;
				return this.#pluginStates.get(dep.id)?.initState !== "initialized";
			});
			if (unreadyDeps.length > 0) {
				const error = new PluginLoadError(pluginId, /* @__PURE__ */ new Error(`Dependencies not ready: ${unreadyDeps.map((d) => d.id).join(", ")}`));
				failures.set(pluginId, error);
				this.#markPluginFailed(pluginId, error);
				continue;
			}
			try {
				this.#markPluginInitializing(pluginId);
				await plugin.initialize(this.framework);
				this.#markPluginInitialized(pluginId);
			} catch (error) {
				const pluginError = new PluginInitError(pluginId, error instanceof Error ? error : new Error(String(error)));
				failures.set(pluginId, pluginError);
				this.#markPluginFailed(pluginId, pluginError, true);
			}
		}
		return failures;
	}
	isPluginEnabled(id) {
		return this.#enabledPlugins.has(id);
	}
	isPluginReady(id) {
		const state = this.#pluginStates.get(id);
		return state?.loadState === "loaded" && state?.initState === "initialized";
	}
	async loadFeature(id) {
		validateNamespacedId(id);
		this.#trackFeatureLoad(id);
		if (this.#features.has(id)) try {
			const existingFeature = await this.#features.get(id);
			this.#markFeatureLoaded(id);
			return existingFeature;
		} catch (error) {
			const featureError = new FeatureLoadError(id, error instanceof Error ? error : new Error(String(error)));
			this.#markFeatureFailed(id, featureError);
			this.#features.delete(id);
			throw featureError;
		}
		try {
			const plugin = this.findPluginForFeature(id);
			if (!plugin) throw new Error("No plugin provides this feature");
			const feature = plugin.features?.find((f) => f.id === id);
			if (!feature) throw new Error(`Plugin ${plugin.id} does not provide feature ${id}`);
			const validationResult = validateFeatureDetailed(feature);
			if (!validationResult.isValid) throw new Error(`Feature ${id} does not comply with FrameworkFeature interface. Missing: ${validationResult.missingProperties.join(", ")}`);
			const initializationPromise = feature.initialize(this.framework).then(() => feature);
			this.#features.set(id, initializationPromise);
			const initializedFeature = await initializationPromise;
			this.#markFeatureLoaded(id);
			return initializedFeature;
		} catch (error) {
			const featureError = new FeatureLoadError(id, error instanceof Error ? error : new Error(String(error)));
			this.#markFeatureFailed(id, featureError);
			this.#features.delete(id);
			throw featureError;
		}
	}
	register(plugin) {
		if (!validPlugin(plugin)) throw new Error("Invalid plugin configuration");
		if (plugin.routes) this.ensureValidRoutes(plugin);
		const pluginId = plugin.id;
		if (this.#pluginFactories.has(pluginId) || this.#loadedPlugins.has(pluginId)) throw new Error(`Plugin ${pluginId} already registered`);
		if (plugin.dependencies?.length) {
			for (const dep of plugin.dependencies) if (!this.#loadedPlugins.has(dep.id) && !this.#pluginFactories.has(dep.id)) throw new Error(`Plugin ${pluginId}: Missing required plugin dependency: ${dep.id}`);
		}
		if (plugin.features) {
			for (const feature of plugin.features) if (feature.dependencies) for (const dep of feature.dependencies) {
				const depId = dep.id;
				if (!Array.from(this.#pluginFactories.values()).some((factory) => {
					return factory().features?.some((f) => f.id === depId);
				})) throw new Error(`Plugin ${pluginId}: Missing required feature dependency: ${depId}`);
			}
		}
		this.#pluginFactories.set(pluginId, () => plugin);
		this.enableAndActivatePlugin(pluginId);
	}
	registerFactory(id, factory) {
		this.#pluginFactories.set(id, factory);
	}
	registerRemoteModule(moduleId, entry, pluginId) {
		this.#remoteModules.set(moduleId, {
			entry,
			moduleId,
			pluginId
		});
	}
	async retryFailedPlugins() {
		const failedPlugins = Array.from(this.#pluginStates.entries()).filter(([_, state]) => state.loadState === "failed" || state.initState === "failed").map(([id]) => id);
		for (const pluginId of failedPlugins) try {
			await this.loadFeature(pluginId);
		} catch (error) {
			console.error(`Retry failed for plugin ${pluginId}:`, error);
		}
	}
	async unregister(id) {
		const plugin = this.#loadedPlugins.get(id);
		if (!plugin) return;
		if (plugin.features) for (const feature of plugin.features) await this.#destroyFeature(feature.id);
		if (plugin.destroy) await plugin.destroy(this.framework);
		this.#loadedPlugins.delete(id);
		this.#pluginStates.delete(id);
	}
	async #destroyFeature(id) {
		const feature = await this.#features.get(id);
		if (feature) try {
			await feature.destroy(this.framework);
		} catch (error) {
			console.error(`Error destroying feature ${id}:`, error);
		} finally {
			this.#features.delete(id);
		}
	}
	#markFeatureFailed(id, error) {
		this.#featureStates.set(id, {
			error,
			state: "failed"
		});
	}
	#markFeatureLoaded(id) {
		this.#featureStates.set(id, {
			error: void 0,
			state: "loaded"
		});
	}
	#markPluginFailed(id, error, isInitFailure = false) {
		const state = this.#pluginStates.get(id);
		this.#pluginStates.set(id, {
			...state,
			error,
			initState: isInitFailure ? "failed" : state?.initState || "failed",
			loadState: "failed",
			retryCount: (state?.retryCount ?? 0) + 1
		});
	}
	#markPluginInitialized(id) {
		const state = this.#pluginStates.get(id);
		if (state) this.#pluginStates.set(id, {
			...state,
			initState: "initialized"
		});
	}
	#markPluginInitializing(id) {
		const state = this.#pluginStates.get(id);
		if (state) this.#pluginStates.set(id, {
			...state,
			initState: "initializing"
		});
	}
	#markPluginLoaded(id) {
		const state = this.#pluginStates.get(id);
		this.#pluginStates.set(id, {
			...state,
			initState: state?.initState || "pending",
			loadState: "loaded",
			retryCount: 0
		});
	}
	#trackFeatureLoad(id) {
		this.#featureStates.set(id, {
			error: void 0,
			state: "loading"
		});
	}
	#trackPluginLoad(id) {
		this.#pluginStates.set(id, {
			initState: "pending",
			loadState: "loading",
			retryCount: 0
		});
	}
	ensureValidRoutes(plugin) {
		if (!plugin.routes) return;
		const validateRoute = (route) => {
			if (!route.component) throw new Error(`Route in plugin ${plugin.id} must specify a component export name`);
			if (typeof route.component !== "string") throw new Error(`Route component in plugin ${plugin.id} must be a string (export name)`);
			if (route.id && typeof route.id === "string") {
				if (!isNamespacedId(route.id)) throw new Error(`Route ID "${route.id}" in plugin ${plugin.id} must be a namespaced ID (format: "namespace:name")`);
			} else route.id = `${plugin.id}:${route.path || "index"}`;
			if (route.children) route.children.forEach(validateRoute);
		};
		plugin.routes.forEach(validateRoute);
	}
	findPluginForFeature(id) {
		return Array.from(this.#loadedPlugins.values()).find((p) => p.features?.some((f) => f.id === id));
	}
	validateFeatureModule(module) {
		return module !== null && typeof module === "object" && "initialize" in module && typeof module.initialize === "function" && "destroy" in module && typeof module.destroy === "function";
	}
};
function validPlugin(plugin) {
	try {
		validateNamespacedId(plugin.id);
		return true;
	} catch {
		return false;
	}
}

//#region src/env.ts
const env = createEnv({
	client: {
		VITE_PORTAL_ALLOW_LOCALHOST: boolean().optional(),
		VITE_PORTAL_DOMAIN: string().includes(".").optional(),
		VITE_PORTAL_DOMAIN_IS_ROOT: boolean().optional()
	},
	clientPrefix: "VITE_",
	emptyStringAsUndefined: true,
	runtimeEnv: window
});

//#region src/plugins/remoteComponentLoader.tsx
function createRemoteComponentLoader(config, framework, options) {
	const { componentPath, pluginId } = config;
	const LoadingElement = /* @__PURE__ */ jsxRuntimeExports.jsx(options.LoadingComponent, {});
	const ErrorFallback = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(options.ErrorComponent, { ...props });
	const loadRemoteModule = async () => {
		const modulePath = await framework.resolvePluginModule(pluginId, componentPath);
		return framework._loadRemote(modulePath);
	};
	return createRemoteComponent({
		fallback: ErrorFallback,
		loader: async () => {
			const module = await loadRemoteModule();
			const Component = module?.default ?? module;
			if (typeof Component !== "function" && typeof Component !== "object") throw new Error(`Remote module ${pluginId}:${componentPath} did not export a default React component.`);
			return { default: Component };
		},
		loading: LoadingElement
	});
}
const DefaultErrorComponent = ({ error, resetErrorBoundary }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
	/* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Error loading component" }),
	/* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: error.message }),
	/* @__PURE__ */ jsxRuntimeExports.jsx("button", {
		onClick: resetErrorBoundary,
		children: "Retry"
	})
] });
const DefaultLoadingComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
const defaultRemoteOptions = {
	ErrorComponent: DefaultErrorComponent,
	LoadingComponent: DefaultLoadingComponent
};
function createRemoteComponent(info) {
	const LazyComponent = createLazyRemoteComponent(info);
	return ({ ref, ...props }) => {
		const { props: componentProps } = props;
		return /* @__PURE__ */ jsxRuntimeExports.jsx(m, {
			FallbackComponent: info.fallback,
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(React.Suspense, {
				fallback: info.loading,
				children: componentProps !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { ...componentProps }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, {})
			})
		});
	};
}
function createLazyRemoteComponent(info) {
	const exportName = info?.export || "default";
	return React.lazy(async () => {
		const m = await info.loader();
		const moduleName = m?.[Symbol.for("mf_module_id")];
		const exportFn = m[exportName];
		if (typeof exportFn === "function" || typeof exportFn === "object") return { default: exportFn };
		throw new Error(`Remote module ${moduleName || "unknown"} did not export a valid React component for export "${String(exportName)}"`);
	});
}

var define_process_env_default = {};
let currentLocation = window.location;
function getCurrentLocation() {
  return currentLocation;
}
function resetCurrentLocation() {
  currentLocation = window.location;
}
function setCurrentLocation(location) {
  currentLocation = {
    ...currentLocation,
    ...location
  };
  if (typeof process !== "undefined" && define_process_env_default.VITEST !== void 0) return;
  if (location.href) try {
    const url = new URL(location.href);
    if (url.origin === window.location.origin) window.history.replaceState({}, "", url.toString());
  } catch (error) {
    console.warn("Failed to update URL:", error);
  }
}

const IPLoopbackRegex = /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
function getApiBaseUrl(options = {}) {
  const { allowLocalhost = true, currentUrl = getCurrentLocation().href, preserveSubdomain: explicitPreserveSubdomain } = options;
  const preserveSubdomain = env.VITE_PORTAL_DOMAIN_IS_ROOT || explicitPreserveSubdomain;
  const urlObject = new URL(currentUrl.startsWith("http") ? currentUrl : `https://${currentUrl}`);
  const isLocalEnvironment = urlObject.hostname === "localhost" || IPLoopbackRegex.test(urlObject.hostname);
  const isAnyIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname);
  if (isLocalEnvironment && !allowLocalhost) return false;
  let targetHostname = urlObject.hostname;
  let targetPort = urlObject.port;
  let targetProtocol = urlObject.protocol;
  if (!preserveSubdomain && !isLocalEnvironment && !isAnyIp) {
    const hostParts = urlObject.hostname.split(".");
    if (hostParts.length > 2) {
      targetHostname = hostParts.slice(-2).join(".");
      targetPort = "";
    }
    targetProtocol = urlObject.protocol;
  }
  return normalizeUrl(`${targetProtocol}//${targetHostname}${targetPort ? ":" + targetPort : ""}`);
}
function normalizeUrl(url) {
  const tempUrl = /^[a-zA-Z]+:\/\//.test(url) ? url : `http://${url}`;
  const urlObject = new URL(tempUrl);
  const isLocalhostOrLoopback = urlObject.hostname === "localhost" || IPLoopbackRegex.test(urlObject.hostname);
  const isAnyIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(urlObject.hostname);
  let finalProtocol = urlObject.protocol;
  if (isLocalhostOrLoopback || isAnyIp) finalProtocol = urlObject.protocol;
  else finalProtocol = "https:";
  let port = urlObject.port;
  if (port === "80" && finalProtocol === "http:" || port === "443" && finalProtocol === "https:") port = "";
  return `${finalProtocol}//${urlObject.hostname}${port ? ":" + port : ""}`.replace(/\/$/, "").replace(/\/$/, "");
}

// eslint-disable-next-line no-empty-function
var noop = function () {};

var _undefined$1 = noop(); // Support ES3 engines

var isValue$6 = function (val) { return val !== _undefined$1 && val !== null; };

var isValue$5 = isValue$6;

var forEach$2 = Array.prototype.forEach, create$1 = Object.create;

var process$1 = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
var normalizeOptions = function (opts1 /*, …options*/) {
	var result = create$1(null);
	forEach$2.call(arguments, function (options) {
		if (!isValue$5(options)) return;
		process$1(Object(options), result);
	});
	return result;
};

var isImplemented$7 = function () {
	var sign = Math.sign;
	if (typeof sign !== "function") return false;
	return sign(10) === 1 && sign(-20) === -1;
};

var shim$5;
var hasRequiredShim$5;

function requireShim$5 () {
	if (hasRequiredShim$5) return shim$5;
	hasRequiredShim$5 = 1;

	shim$5 = function (value) {
		value = Number(value);
		if (isNaN(value) || value === 0) return value;
		return value > 0 ? 1 : -1;
	};
	return shim$5;
}

var sign$1 = isImplemented$7() ? Math.sign : requireShim$5();

var sign  = sign$1
  , abs   = Math.abs
  , floor = Math.floor;

var toInteger$1 = function (value) {
	if (isNaN(value)) return 0;
	value = Number(value);
	if (value === 0 || !isFinite(value)) return value;
	return sign(value) * floor(abs(value));
};

var toInteger = toInteger$1
  , max$1       = Math.max;

var toPosInteger = function (value) { return max$1(0, toInteger(value)); };

var toPosInt$1 = toPosInteger;

var resolveLength$2 = function (optsLength, fnLength, isAsync) {
	var length;
	if (isNaN(optsLength)) {
		length = fnLength;
		if (!(length >= 0)) return 1;
		if (isAsync && length) return length - 1;
		return length;
	}
	if (optsLength === false) return false;
	return toPosInt$1(optsLength);
};

var validCallable = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};

var isValue$4 = isValue$6;

var validValue = function (value) {
	if (!isValue$4(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};

var callable$3                = validCallable
  , value                   = validValue
  , bind                    = Function.prototype.bind
  , call$1                    = Function.prototype.call
  , keys$1                    = Object.keys
  , objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;

var _iterate = function (method, defVal) {
	return function (obj, cb /*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(value(obj));
		callable$3(cb);

		list = keys$1(obj);
		if (compareFn) {
			list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : undefined);
		}
		if (typeof method !== "function") method = list[method];
		return call$1.call(method, list, function (key, index) {
			if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
			return call$1.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

var forEach$1 = _iterate("forEach");

var registeredExtensions = {};

var custom = {exports: {}};

var isImplemented$6 = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
};

var isImplemented$5;
var hasRequiredIsImplemented$4;

function requireIsImplemented$4 () {
	if (hasRequiredIsImplemented$4) return isImplemented$5;
	hasRequiredIsImplemented$4 = 1;

	isImplemented$5 = function () {
		try {
			Object.keys("primitive");
			return true;
		} catch (e) {
			return false;
		}
	};
	return isImplemented$5;
}

var shim$4;
var hasRequiredShim$4;

function requireShim$4 () {
	if (hasRequiredShim$4) return shim$4;
	hasRequiredShim$4 = 1;

	var isValue = isValue$6;

	var keys = Object.keys;

	shim$4 = function (object) { return keys(isValue(object) ? Object(object) : object); };
	return shim$4;
}

var keys;
var hasRequiredKeys;

function requireKeys () {
	if (hasRequiredKeys) return keys;
	hasRequiredKeys = 1;

	keys = requireIsImplemented$4()() ? Object.keys : requireShim$4();
	return keys;
}

var shim$3;
var hasRequiredShim$3;

function requireShim$3 () {
	if (hasRequiredShim$3) return shim$3;
	hasRequiredShim$3 = 1;

	var keys  = requireKeys()
	  , value = validValue
	  , max   = Math.max;

	shim$3 = function (dest, src /*, …srcn*/) {
		var error, i, length = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try {
				dest[key] = src[key];
			} catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < length; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};
	return shim$3;
}

var assign$1 = isImplemented$6() ? Object.assign : requireShim$3();

var isValue$3 = isValue$6;

var map$1 = { function: true, object: true };

var isObject$1 = function (value) { return (isValue$3(value) && map$1[typeof value]) || false; };

(function (module) {

	var assign            = assign$1
	  , isObject          = isObject$1
	  , isValue           = isValue$6
	  , captureStackTrace = Error.captureStackTrace;

	module.exports = function (message /*, code, ext*/) {
		var err = new Error(message), code = arguments[1], ext = arguments[2];
		if (!isValue(ext)) {
			if (isObject(code)) {
				ext = code;
				code = null;
			}
		}
		if (isValue(ext)) assign(err, ext);
		if (isValue(code)) err.code = code;
		if (captureStackTrace) captureStackTrace(err, module.exports);
		return err;
	}; 
} (custom));

var customExports = custom.exports;

var _defineLength = {exports: {}};

var mixin$1;
var hasRequiredMixin;

function requireMixin () {
	if (hasRequiredMixin) return mixin$1;
	hasRequiredMixin = 1;

	var value                    = validValue
	  , defineProperty           = Object.defineProperty
	  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
	  , getOwnPropertyNames      = Object.getOwnPropertyNames
	  , getOwnPropertySymbols    = Object.getOwnPropertySymbols;

	mixin$1 = function (target, source) {
		var error, sourceObject = Object(value(source));
		target = Object(value(target));
		getOwnPropertyNames(sourceObject).forEach(function (name) {
			try {
				defineProperty(target, name, getOwnPropertyDescriptor(source, name));
			} catch (e) { error = e; }
		});
		if (typeof getOwnPropertySymbols === "function") {
			getOwnPropertySymbols(sourceObject).forEach(function (symbol) {
				try {
					defineProperty(target, symbol, getOwnPropertyDescriptor(source, symbol));
				} catch (e) { error = e; }
			});
		}
		if (error !== undefined) throw error;
		return target;
	};
	return mixin$1;
}

var toPosInt = toPosInteger;

var test = function (arg1, arg2) { return arg2; };

var desc, defineProperty, generate, mixin;

try {
	Object.defineProperty(test, "length", {
		configurable: true,
		writable: false,
		enumerable: false,
		value: 1
	});
}
catch (ignore) {}

if (test.length === 1) {
	// ES6
	desc = { configurable: true, writable: false, enumerable: false };
	defineProperty = Object.defineProperty;
	_defineLength.exports = function (fn, length) {
		length = toPosInt(length);
		if (fn.length === length) return fn;
		desc.value = length;
		return defineProperty(fn, "length", desc);
	};
} else {
	mixin = requireMixin();
	generate = (function () {
		var cache = [];
		return function (length) {
			var args, i = 0;
			if (cache[length]) return cache[length];
			args = [];
			while (length--) args.push("a" + (++i).toString(36));
			// eslint-disable-next-line no-new-func
			return new Function(
				"fn",
				"return function (" + args.join(", ") + ") { return fn.apply(this, arguments); };"
			);
		};
	})();
	_defineLength.exports = function (src, length) {
		var target;
		length = toPosInt(length);
		if (src.length === length) return src;
		target = generate(length)(src);
		try { mixin(target, src); }
		catch (ignore) {}
		return target;
	};
}

var _defineLengthExports = _defineLength.exports;

var d$2 = {exports: {}};

// ES3 safe
var _undefined = void 0;

var is$4 = function (value) { return value !== _undefined && value !== null; };

var isValue$2 = is$4;

// prettier-ignore
var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };

var is$3 = function (value) {
	if (!isValue$2(value)) return false;
	return hasOwnProperty.call(possibleTypes, typeof value);
};

var isObject = is$3;

var is$2 = function (value) {
	if (!isObject(value)) return false;
	try {
		if (!value.constructor) return false;
		return value.constructor.prototype === value;
	} catch (error) {
		return false;
	}
};

var isPrototype = is$2;

var is$1 = function (value) {
	if (typeof value !== "function") return false;

	if (!hasOwnProperty.call(value, "length")) return false;

	try {
		if (typeof value.length !== "number") return false;
		if (typeof value.call !== "function") return false;
		if (typeof value.apply !== "function") return false;
	} catch (error) {
		return false;
	}

	return !isPrototype(value);
};

var isFunction$1 = is$1;

var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;

var is = function (value) {
	if (!isFunction$1(value)) return false;
	if (classRe.test(functionToString.call(value))) return false;
	return true;
};

var str = "razdwatrzy";

var isImplemented$4 = function () {
	if (typeof str.contains !== "function") return false;
	return str.contains("dwa") === true && str.contains("foo") === false;
};

var shim$2;
var hasRequiredShim$2;

function requireShim$2 () {
	if (hasRequiredShim$2) return shim$2;
	hasRequiredShim$2 = 1;

	var indexOf = String.prototype.indexOf;

	shim$2 = function (searchString /*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};
	return shim$2;
}

var contains$1 = isImplemented$4() ? String.prototype.contains : requireShim$2();

var isValue$1         = is$4
  , isPlainFunction = is
  , assign          = assign$1
  , normalizeOpts$1   = normalizeOptions
  , contains        = contains$1;

var d$1 = (d$2.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if (arguments.length < 2 || typeof dscr !== "string") {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (isValue$1(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
		w = contains.call(dscr, "w");
	} else {
		c = w = true;
		e = false;
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts$1(options), desc);
});

d$1.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== "string") {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (!isValue$1(get)) {
		get = undefined;
	} else if (!isPlainFunction(get)) {
		options = get;
		get = set = undefined;
	} else if (!isValue$1(set)) {
		set = undefined;
	} else if (!isPlainFunction(set)) {
		options = set;
		set = undefined;
	}
	if (isValue$1(dscr)) {
		c = contains.call(dscr, "c");
		e = contains.call(dscr, "e");
	} else {
		c = true;
		e = false;
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts$1(options), desc);
};

var dExports = d$2.exports;

var eventEmitter = {exports: {}};

(function (module, exports$1) {

	var d        = dExports
	  , callable = validCallable

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }

	  , on, once, off, emit, methods, descriptors, base;

	on = function (type, listener) {
		var data;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];

		return this;
	};

	once = function (type, listener) {
		var once, self;

		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});

		once.__eeOnceListener__ = listener;
		return this;
	};

	off = function (type, listener) {
		var data, listeners, candidate, i;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];

		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}

		return this;
	};

	emit = function (type) {
		var i, l, listener, listeners, args;

		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;

		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};

	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};

	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};

	base = defineProperties({}, descriptors);

	module.exports = exports$1 = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports$1.methods = methods; 
} (eventEmitter, eventEmitter.exports));

var eventEmitterExports = eventEmitter.exports;

var isImplemented$3;
var hasRequiredIsImplemented$3;

function requireIsImplemented$3 () {
	if (hasRequiredIsImplemented$3) return isImplemented$3;
	hasRequiredIsImplemented$3 = 1;

	isImplemented$3 = function () {
		var from = Array.from, arr, result;
		if (typeof from !== "function") return false;
		arr = ["raz", "dwa"];
		result = from(arr);
		return Boolean(result && result !== arr && result[1] === "dwa");
	};
	return isImplemented$3;
}

var isImplemented$2;
var hasRequiredIsImplemented$2;

function requireIsImplemented$2 () {
	if (hasRequiredIsImplemented$2) return isImplemented$2;
	hasRequiredIsImplemented$2 = 1;

	isImplemented$2 = function () {
		if (typeof globalThis !== "object") return false;
		if (!globalThis) return false;
		return globalThis.Array === Array;
	};
	return isImplemented$2;
}

var implementation;
var hasRequiredImplementation;

function requireImplementation () {
	if (hasRequiredImplementation) return implementation;
	hasRequiredImplementation = 1;
	var naiveFallback = function () {
		if (typeof self === "object" && self) return self;
		if (typeof window === "object" && window) return window;
		throw new Error("Unable to resolve global `this`");
	};

	implementation = (function () {
		if (this) return this;

		// Unexpected strict mode (may happen if e.g. bundled into ESM module)

		// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
		// In all ES5+ engines global object inherits from Object.prototype
		// (if you approached one that doesn't please report)
		try {
			Object.defineProperty(Object.prototype, "__global__", {
				get: function () { return this; },
				configurable: true
			});
		} catch (error) {
			// Unfortunate case of Object.prototype being sealed (via preventExtensions, seal or freeze)
			return naiveFallback();
		}
		try {
			// Safari case (window.__global__ is resolved with global context, but __global__ does not)
			if (!__global__) return naiveFallback();
			return __global__;
		} finally {
			delete Object.prototype.__global__;
		}
	})();
	return implementation;
}

var globalThis_1;
var hasRequiredGlobalThis;

function requireGlobalThis () {
	if (hasRequiredGlobalThis) return globalThis_1;
	hasRequiredGlobalThis = 1;

	globalThis_1 = requireIsImplemented$2()() ? globalThis : requireImplementation();
	return globalThis_1;
}

var isImplemented$1;
var hasRequiredIsImplemented$1;

function requireIsImplemented$1 () {
	if (hasRequiredIsImplemented$1) return isImplemented$1;
	hasRequiredIsImplemented$1 = 1;

	var global     = requireGlobalThis()
	  , validTypes = { object: true, symbol: true };

	isImplemented$1 = function () {
		var Symbol = global.Symbol;
		var symbol;
		if (typeof Symbol !== "function") return false;
		symbol = Symbol("test symbol");
		try { String(symbol); }
		catch (e) { return false; }

		// Return 'true' also for polyfills
		if (!validTypes[typeof Symbol.iterator]) return false;
		if (!validTypes[typeof Symbol.toPrimitive]) return false;
		if (!validTypes[typeof Symbol.toStringTag]) return false;

		return true;
	};
	return isImplemented$1;
}

var isSymbol;
var hasRequiredIsSymbol;

function requireIsSymbol () {
	if (hasRequiredIsSymbol) return isSymbol;
	hasRequiredIsSymbol = 1;

	isSymbol = function (value) {
		if (!value) return false;
		if (typeof value === "symbol") return true;
		if (!value.constructor) return false;
		if (value.constructor.name !== "Symbol") return false;
		return value[value.constructor.toStringTag] === "Symbol";
	};
	return isSymbol;
}

var validateSymbol;
var hasRequiredValidateSymbol;

function requireValidateSymbol () {
	if (hasRequiredValidateSymbol) return validateSymbol;
	hasRequiredValidateSymbol = 1;

	var isSymbol = requireIsSymbol();

	validateSymbol = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};
	return validateSymbol;
}

var generateName;
var hasRequiredGenerateName;

function requireGenerateName () {
	if (hasRequiredGenerateName) return generateName;
	hasRequiredGenerateName = 1;

	var d = dExports;

	var create = Object.create, defineProperty = Object.defineProperty, objPrototype = Object.prototype;

	var created = create(null);
	generateName = function (desc) {
		var postfix = 0, name, ie11BugWorkaround;
		while (created[desc + (postfix || "")]) ++postfix;
		desc += postfix || "";
		created[desc] = true;
		name = "@@" + desc;
		defineProperty(
			objPrototype, name,
			d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			})
		);
		return name;
	};
	return generateName;
}

var standardSymbols;
var hasRequiredStandardSymbols;

function requireStandardSymbols () {
	if (hasRequiredStandardSymbols) return standardSymbols;
	hasRequiredStandardSymbols = 1;

	var d            = dExports
	  , NativeSymbol = requireGlobalThis().Symbol;

	standardSymbols = function (SymbolPolyfill) {
		return Object.defineProperties(SymbolPolyfill, {
			// To ensure proper interoperability with other native functions (e.g. Array.from)
			// fallback to eventual native implementation of given symbol
			hasInstance: d(
				"", (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill("hasInstance")
			),
			isConcatSpreadable: d(
				"",
				(NativeSymbol && NativeSymbol.isConcatSpreadable) ||
					SymbolPolyfill("isConcatSpreadable")
			),
			iterator: d("", (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill("iterator")),
			match: d("", (NativeSymbol && NativeSymbol.match) || SymbolPolyfill("match")),
			replace: d("", (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill("replace")),
			search: d("", (NativeSymbol && NativeSymbol.search) || SymbolPolyfill("search")),
			species: d("", (NativeSymbol && NativeSymbol.species) || SymbolPolyfill("species")),
			split: d("", (NativeSymbol && NativeSymbol.split) || SymbolPolyfill("split")),
			toPrimitive: d(
				"", (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill("toPrimitive")
			),
			toStringTag: d(
				"", (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill("toStringTag")
			),
			unscopables: d(
				"", (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill("unscopables")
			)
		});
	};
	return standardSymbols;
}

var symbolRegistry;
var hasRequiredSymbolRegistry;

function requireSymbolRegistry () {
	if (hasRequiredSymbolRegistry) return symbolRegistry;
	hasRequiredSymbolRegistry = 1;

	var d              = dExports
	  , validateSymbol = requireValidateSymbol();

	var registry = Object.create(null);

	symbolRegistry = function (SymbolPolyfill) {
		return Object.defineProperties(SymbolPolyfill, {
			for: d(function (key) {
				if (registry[key]) return registry[key];
				return (registry[key] = SymbolPolyfill(String(key)));
			}),
			keyFor: d(function (symbol) {
				var key;
				validateSymbol(symbol);
				for (key in registry) {
					if (registry[key] === symbol) return key;
				}
				return undefined;
			})
		});
	};
	return symbolRegistry;
}

var polyfill;
var hasRequiredPolyfill;

function requirePolyfill () {
	if (hasRequiredPolyfill) return polyfill;
	hasRequiredPolyfill = 1;

	var d                    = dExports
	  , validateSymbol       = requireValidateSymbol()
	  , NativeSymbol         = requireGlobalThis().Symbol
	  , generateName         = requireGenerateName()
	  , setupStandardSymbols = requireStandardSymbols()
	  , setupSymbolRegistry  = requireSymbolRegistry();

	var create = Object.create
	  , defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty;

	var SymbolPolyfill, HiddenSymbol, isNativeSafe;

	if (typeof NativeSymbol === "function") {
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	} else {
		NativeSymbol = null;
	}

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	polyfill = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = description === undefined ? "" : String(description);
		return defineProperties(symbol, {
			__description__: d("", description),
			__name__: d("", generateName(description))
		});
	};

	setupStandardSymbols(SymbolPolyfill);
	setupSymbolRegistry(SymbolPolyfill);

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d("", function () { return this.__name__; })
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return "Symbol (" + validateSymbol(this).__description__ + ")"; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(
		SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive,
		d("", function () {
			var symbol = validateSymbol(this);
			if (typeof symbol === "symbol") return symbol;
			return symbol.toString();
		})
	);
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(
		HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
	);

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(
		HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
	);
	return polyfill;
}

var es6Symbol;
var hasRequiredEs6Symbol;

function requireEs6Symbol () {
	if (hasRequiredEs6Symbol) return es6Symbol;
	hasRequiredEs6Symbol = 1;

	es6Symbol = requireIsImplemented$1()()
		? requireGlobalThis().Symbol
		: requirePolyfill();
	return es6Symbol;
}

var isArguments;
var hasRequiredIsArguments;

function requireIsArguments () {
	if (hasRequiredIsArguments) return isArguments;
	hasRequiredIsArguments = 1;

	var objToString = Object.prototype.toString
	  , id = objToString.call((function () { return arguments; })());

	isArguments = function (value) { return objToString.call(value) === id; };
	return isArguments;
}

var isFunction;
var hasRequiredIsFunction;

function requireIsFunction () {
	if (hasRequiredIsFunction) return isFunction;
	hasRequiredIsFunction = 1;

	var objToString = Object.prototype.toString
	  , isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);

	isFunction = function (value) {
		return typeof value === "function" && isFunctionStringTag(objToString.call(value));
	};
	return isFunction;
}

var isString;
var hasRequiredIsString;

function requireIsString () {
	if (hasRequiredIsString) return isString;
	hasRequiredIsString = 1;

	var objToString = Object.prototype.toString, id = objToString.call("");

	isString = function (value) {
		return (
			typeof value === "string" ||
			(value &&
				typeof value === "object" &&
				(value instanceof String || objToString.call(value) === id)) ||
			false
		);
	};
	return isString;
}

var shim$1;
var hasRequiredShim$1;

function requireShim$1 () {
	if (hasRequiredShim$1) return shim$1;
	hasRequiredShim$1 = 1;

	var iteratorSymbol = requireEs6Symbol().iterator
	  , isArguments    = requireIsArguments()
	  , isFunction     = requireIsFunction()
	  , toPosInt       = toPosInteger
	  , callable       = validCallable
	  , validValue$1     = validValue
	  , isValue        = isValue$6
	  , isString       = requireIsString()
	  , isArray        = Array.isArray
	  , call           = Function.prototype.call
	  , desc           = { configurable: true, enumerable: true, writable: true, value: null }
	  , defineProperty = Object.defineProperty;

	// eslint-disable-next-line complexity, max-lines-per-function
	shim$1 = function (arrayLike /*, mapFn, thisArg*/) {
		var mapFn = arguments[1]
		  , thisArg = arguments[2]
		  , Context
		  , i
		  , j
		  , arr
		  , length
		  , code
		  , iterator
		  , result
		  , getIterator
		  , value;

		arrayLike = Object(validValue$1(arrayLike));

		if (isValue(mapFn)) callable(mapFn);
		if (!this || this === Array || !isFunction(this)) {
			// Result: Plain array
			if (!mapFn) {
				if (isArguments(arrayLike)) {
					// Source: Arguments
					length = arrayLike.length;
					if (length !== 1) return Array.apply(null, arrayLike);
					arr = new Array(1);
					arr[0] = arrayLike[0];
					return arr;
				}
				if (isArray(arrayLike)) {
					// Source: Array
					arr = new Array((length = arrayLike.length));
					for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
					return arr;
				}
			}
			arr = [];
		} else {
			// Result: Non plain array
			Context = this;
		}

		if (!isArray(arrayLike)) {
			if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
				// Source: Iterator
				iterator = callable(getIterator).call(arrayLike);
				if (Context) arr = new Context();
				result = iterator.next();
				i = 0;
				while (!result.done) {
					value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
					if (Context) {
						desc.value = value;
						defineProperty(arr, i, desc);
					} else {
						arr[i] = value;
					}
					result = iterator.next();
					++i;
				}
				length = i;
			} else if (isString(arrayLike)) {
				// Source: String
				length = arrayLike.length;
				if (Context) arr = new Context();
				for (i = 0, j = 0; i < length; ++i) {
					value = arrayLike[i];
					if (i + 1 < length) {
						code = value.charCodeAt(0);
						// eslint-disable-next-line max-depth
						if (code >= 0xd800 && code <= 0xdbff) value += arrayLike[++i];
					}
					value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
					if (Context) {
						desc.value = value;
						defineProperty(arr, j, desc);
					} else {
						arr[j] = value;
					}
					++j;
				}
				length = j;
			}
		}
		if (length === undefined) {
			// Source: array or array-like
			length = toPosInt(arrayLike.length);
			if (Context) arr = new Context(length);
			for (i = 0; i < length; ++i) {
				value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
				if (Context) {
					desc.value = value;
					defineProperty(arr, i, desc);
				} else {
					arr[i] = value;
				}
			}
		}
		if (Context) {
			desc.value = null;
			arr.length = length;
		}
		return arr;
	};
	return shim$1;
}

var from$1;
var hasRequiredFrom;

function requireFrom () {
	if (hasRequiredFrom) return from$1;
	hasRequiredFrom = 1;

	from$1 = requireIsImplemented$3()() ? Array.from : requireShim$1();
	return from$1;
}

var from    = requireFrom()
  , isArray = Array.isArray;

var toArray$1 = function (arrayLike) { return isArray(arrayLike) ? arrayLike : from(arrayLike); };

var toArray  = toArray$1
  , isValue  = isValue$6
  , callable$2 = validCallable;

var slice = Array.prototype.slice, resolveArgs;

resolveArgs = function (args) {
	return this.map(function (resolve, i) { return resolve ? resolve(args[i]) : args[i]; }).concat(
		slice.call(args, this.length)
	);
};

var resolveResolve$1 = function (resolvers) {
	resolvers = toArray(resolvers);
	resolvers.forEach(function (resolve) { if (isValue(resolve)) callable$2(resolve); });
	return resolveArgs.bind(resolvers);
};

var callable$1 = validCallable;

var resolveNormalize$1 = function (userNormalizer) {
	var normalizer;
	if (typeof userNormalizer === "function") return { set: userNormalizer, get: userNormalizer };
	normalizer = { get: callable$1(userNormalizer.get) };
	if (userNormalizer.set !== undefined) {
		normalizer.set = callable$1(userNormalizer.set);
		if (userNormalizer.delete) normalizer.delete = callable$1(userNormalizer.delete);
		if (userNormalizer.clear) normalizer.clear = callable$1(userNormalizer.clear);
		return normalizer;
	}
	normalizer.set = normalizer.get;
	return normalizer;
};

/* eslint no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */

var customError      = customExports
  , defineLength     = _defineLengthExports
  , d                = dExports
  , ee               = eventEmitterExports.methods
  , resolveResolve   = resolveResolve$1
  , resolveNormalize = resolveNormalize$1;

var apply = Function.prototype.apply
  , call = Function.prototype.call
  , create = Object.create
  , defineProperties = Object.defineProperties
  , on = ee.on
  , emit = ee.emit;

var configureMap = function (original, length, options) {
	var cache = create(null)
	  , conf
	  , memLength
	  , get
	  , set
	  , del
	  , clear
	  , extDel
	  , extGet
	  , extHas
	  , normalizer
	  , getListeners
	  , setListeners
	  , deleteListeners
	  , memoized
	  , resolve;
	if (length !== false) memLength = length;
	else if (isNaN(original.length)) memLength = 1;
	else memLength = original.length;

	if (options.normalizer) {
		normalizer = resolveNormalize(options.normalizer);
		get = normalizer.get;
		set = normalizer.set;
		del = normalizer.delete;
		clear = normalizer.clear;
	}
	if (options.resolvers != null) resolve = resolveResolve(options.resolvers);

	if (get) {
		memoized = defineLength(function (arg) {
			var id, result, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id !== null) {
				if (hasOwnProperty.call(cache, id)) {
					if (getListeners) conf.emit("get", id, args, this);
					return cache[id];
				}
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (id === null) {
				id = get(args);
				if (id !== null) throw customError("Circular invocation", "CIRCULAR_INVOCATION");
				id = set(args);
			} else if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		}, memLength);
	} else if (length === 0) {
		memoized = function () {
			var result;
			if (hasOwnProperty.call(cache, "data")) {
				if (getListeners) conf.emit("get", "data", arguments, this);
				return cache.data;
			}
			if (arguments.length) result = apply.call(original, this, arguments);
			else result = call.call(original, this);
			if (hasOwnProperty.call(cache, "data")) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache.data = result;
			if (setListeners) conf.emit("set", "data", null, result);
			return result;
		};
	} else {
		memoized = function (arg) {
			var result, args = arguments, id;
			if (resolve) args = resolve(arguments);
			id = String(args[0]);
			if (hasOwnProperty.call(cache, id)) {
				if (getListeners) conf.emit("get", id, args, this);
				return cache[id];
			}
			if (args.length === 1) result = call.call(original, this, args[0]);
			else result = apply.call(original, this, args);
			if (hasOwnProperty.call(cache, id)) {
				throw customError("Circular invocation", "CIRCULAR_INVOCATION");
			}
			cache[id] = result;
			if (setListeners) conf.emit("set", id, null, result);
			return result;
		};
	}
	conf = {
		original: original,
		memoized: memoized,
		profileName: options.profileName,
		get: function (args) {
			if (resolve) args = resolve(args);
			if (get) return get(args);
			return String(args[0]);
		},
		has: function (id) { return hasOwnProperty.call(cache, id); },
		delete: function (id) {
			var result;
			if (!hasOwnProperty.call(cache, id)) return;
			if (del) del(id);
			result = cache[id];
			delete cache[id];
			if (deleteListeners) conf.emit("delete", id, result);
		},
		clear: function () {
			var oldCache = cache;
			if (clear) clear();
			cache = create(null);
			conf.emit("clear", oldCache);
		},
		on: function (type, listener) {
			if (type === "get") getListeners = true;
			else if (type === "set") setListeners = true;
			else if (type === "delete") deleteListeners = true;
			return on.call(this, type, listener);
		},
		emit: emit,
		updateEnv: function () { original = conf.original; },
	};
	if (get) {
		extDel = defineLength(function (arg) {
			var id, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id === null) return;
			conf.delete(id);
		}, memLength);
	} else if (length === 0) {
		extDel = function () { return conf.delete("data"); };
	} else {
		extDel = function (arg) {
			if (resolve) arg = resolve(arguments)[0];
			return conf.delete(arg);
		};
	}
	extGet = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return cache.data;
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		return cache[id];
	});
	extHas = defineLength(function () {
		var id, args = arguments;
		if (length === 0) return conf.has("data");
		if (resolve) args = resolve(args);
		if (get) id = get(args);
		else id = String(args[0]);
		if (id === null) return false;
		return conf.has(id);
	});
	defineProperties(memoized, {
		__memoized__: d(true),
		delete: d(extDel),
		clear: d(conf.clear),
		_get: d(extGet),
		_has: d(extHas),
	});
	return conf;
};

var callable      = validCallable
  , forEach       = forEach$1
  , extensions    = registeredExtensions
  , configure     = configureMap
  , resolveLength$1 = resolveLength$2;

var plain$1 = function self(fn/*, options */) {
	var options, length, conf;

	callable(fn);
	options = Object(arguments[1]);

	if (options.async && options.promise) {
		throw new Error("Options 'async' and 'promise' cannot be used together");
	}

	// Do not memoize already memoized function
	if (hasOwnProperty.call(fn, "__memoized__") && !options.force) return fn;

	// Resolve length;
	length = resolveLength$1(options.length, fn.length, options.async && extensions.async);

	// Configure cache map
	conf = configure(fn, length, options);

	// Bind eventual extensions
	forEach(extensions, function (extFn, name) {
		if (options[name]) extFn(options[name], conf, options);
	});

	if (self.__profiler__) self.__profiler__(conf);

	conf.updateEnv();
	return conf.memoized;
};

var primitive;
var hasRequiredPrimitive;

function requirePrimitive () {
	if (hasRequiredPrimitive) return primitive;
	hasRequiredPrimitive = 1;

	primitive = function (args) {
		var id, i, length = args.length;
		if (!length) return "\u0002";
		id = String(args[(i = 0)]);
		while (--length) id += "\u0001" + args[++i];
		return id;
	};
	return primitive;
}

var getPrimitiveFixed;
var hasRequiredGetPrimitiveFixed;

function requireGetPrimitiveFixed () {
	if (hasRequiredGetPrimitiveFixed) return getPrimitiveFixed;
	hasRequiredGetPrimitiveFixed = 1;

	getPrimitiveFixed = function (length) {
		if (!length) {
			return function () { return ""; };
		}
		return function (args) {
			var id = String(args[0]), i = 0, currentLength = length;
			while (--currentLength) {
				id += "\u0001" + args[++i];
			}
			return id;
		};
	};
	return getPrimitiveFixed;
}

var isImplemented;
var hasRequiredIsImplemented;

function requireIsImplemented () {
	if (hasRequiredIsImplemented) return isImplemented;
	hasRequiredIsImplemented = 1;

	isImplemented = function () {
		var numberIsNaN = Number.isNaN;
		if (typeof numberIsNaN !== "function") return false;
		return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
	};
	return isImplemented;
}

var shim;
var hasRequiredShim;

function requireShim () {
	if (hasRequiredShim) return shim;
	hasRequiredShim = 1;

	shim = function (value) {
		// eslint-disable-next-line no-self-compare
		return value !== value;
	};
	return shim;
}

var isNan;
var hasRequiredIsNan;

function requireIsNan () {
	if (hasRequiredIsNan) return isNan;
	hasRequiredIsNan = 1;

	isNan = requireIsImplemented()() ? Number.isNaN : requireShim();
	return isNan;
}

var eIndexOf;
var hasRequiredEIndexOf;

function requireEIndexOf () {
	if (hasRequiredEIndexOf) return eIndexOf;
	hasRequiredEIndexOf = 1;

	var numberIsNaN       = requireIsNan()
	  , toPosInt          = toPosInteger
	  , value             = validValue
	  , indexOf           = Array.prototype.indexOf
	  , objHasOwnProperty = Object.prototype.hasOwnProperty
	  , abs               = Math.abs
	  , floor             = Math.floor;

	eIndexOf = function (searchElement /*, fromIndex*/) {
		var i, length, fromIndex, val;
		if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);

		length = toPosInt(value(this).length);
		fromIndex = arguments[1];
		if (isNaN(fromIndex)) fromIndex = 0;
		else if (fromIndex >= 0) fromIndex = floor(fromIndex);
		else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

		for (i = fromIndex; i < length; ++i) {
			if (objHasOwnProperty.call(this, i)) {
				val = this[i];
				if (numberIsNaN(val)) return i; // Jslint: ignore
			}
		}
		return -1;
	};
	return eIndexOf;
}

/* eslint max-statements: 0 */

var get;
var hasRequiredGet;

function requireGet () {
	if (hasRequiredGet) return get;
	hasRequiredGet = 1;

	var indexOf = requireEIndexOf();

	var create = Object.create;

	get = function () {
		var lastId = 0, map = [], cache = create(null);
		return {
			get: function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) return set[length] || null;
				if ((set = set[length])) {
					while (index < length - 1) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) return null;
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					return set[1][i] || null;
				}
				return null;
			},
			set: function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					set[length] = ++lastId;
				} else {
					if (!set[length]) {
						set[length] = [[], []];
					}
					set = set[length];
					while (index < length - 1) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							i = set[0].push(args[index]) - 1;
							set[1].push([[], []]);
						}
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
					}
					set[1][i] = ++lastId;
				}
				cache[lastId] = args;
				return lastId;
			},
			delete: function (id) {
				var index = 0, set = map, i, args = cache[id], length = args.length, path = [];
				if (length === 0) {
					delete set[length];
				} else if ((set = set[length])) {
					while (index < length - 1) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							return;
						}
						path.push(set, i);
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					id = set[1][i];
					set[0].splice(i, 1);
					set[1].splice(i, 1);
					while (!set[0].length && path.length) {
						i = path.pop();
						set = path.pop();
						set[0].splice(i, 1);
						set[1].splice(i, 1);
					}
				}
				delete cache[id];
			},
			clear: function () {
				map = [];
				cache = create(null);
			},
		};
	};
	return get;
}

var get1;
var hasRequiredGet1;

function requireGet1 () {
	if (hasRequiredGet1) return get1;
	hasRequiredGet1 = 1;

	var indexOf = requireEIndexOf();

	get1 = function () {
		var lastId = 0, argsMap = [], cache = [];
		return {
			get: function (args) {
				var index = indexOf.call(argsMap, args[0]);
				return index === -1 ? null : cache[index];
			},
			set: function (args) {
				argsMap.push(args[0]);
				cache.push(++lastId);
				return lastId;
			},
			delete: function (id) {
				var index = indexOf.call(cache, id);
				if (index !== -1) {
					argsMap.splice(index, 1);
					cache.splice(index, 1);
				}
			},
			clear: function () {
				argsMap = [];
				cache = [];
			},
		};
	};
	return get1;
}

var getFixed;
var hasRequiredGetFixed;

function requireGetFixed () {
	if (hasRequiredGetFixed) return getFixed;
	hasRequiredGetFixed = 1;

	var indexOf = requireEIndexOf()
	  , create  = Object.create;

	getFixed = function (length) {
		var lastId = 0, map = [[], []], cache = create(null);
		return {
			get: function (args) {
				var index = 0, set = map, i;
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			},
			set: function (args) {
				var index = 0, set = map, i;
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++lastId;
				cache[lastId] = args;
				return lastId;
			},
			delete: function (id) {
				var index = 0, set = map, i, path = [], args = cache[id];
				while (index < length - 1) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
				delete cache[id];
			},
			clear: function () {
				map = [[], []];
				cache = create(null);
			},
		};
	};
	return getFixed;
}

var async = {};

var map;
var hasRequiredMap;

function requireMap () {
	if (hasRequiredMap) return map;
	hasRequiredMap = 1;

	var callable = validCallable
	  , forEach  = forEach$1
	  , call     = Function.prototype.call;

	map = function (obj, cb /*, thisArg*/) {
		var result = {}, thisArg = arguments[2];
		callable(cb);
		forEach(obj, function (value, key, targetObj, index) {
			result[key] = call.call(cb, thisArg, value, key, targetObj, index);
		});
		return result;
	};
	return map;
}

var nextTick;
var hasRequiredNextTick;

function requireNextTick () {
	if (hasRequiredNextTick) return nextTick;
	hasRequiredNextTick = 1;

	var ensureCallable = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};

	var byObserver = function (Observer) {
		var node = document.createTextNode(''), queue, currentQueue, i = 0;
		new Observer(function () {
			var callback;
			if (!queue) {
				if (!currentQueue) return;
				queue = currentQueue;
			} else if (currentQueue) {
				queue = currentQueue.concat(queue);
			}
			currentQueue = queue;
			queue = null;
			if (typeof currentQueue === 'function') {
				callback = currentQueue;
				currentQueue = null;
				callback();
				return;
			}
			node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
			while (currentQueue) {
				callback = currentQueue.shift();
				if (!currentQueue.length) currentQueue = null;
				callback();
			}
		}).observe(node, { characterData: true });
		return function (fn) {
			ensureCallable(fn);
			if (queue) {
				if (typeof queue === 'function') queue = [queue, fn];
				else queue.push(fn);
				return;
			}
			queue = fn;
			node.data = (i = ++i % 2);
		};
	};

	nextTick = (function () {
		// Node.js
		if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
			return process.nextTick;
		}

		// queueMicrotask
		if (typeof queueMicrotask === "function") {
			return function (cb) { queueMicrotask(ensureCallable(cb)); };
		}

		// MutationObserver
		if ((typeof document === 'object') && document) {
			if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
			if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
		}

		// W3C Draft
		// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
		if (typeof setImmediate === 'function') {
			return function (cb) { setImmediate(ensureCallable(cb)); };
		}

		// Wide available standard
		if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
			return function (cb) { setTimeout(ensureCallable(cb), 0); };
		}

		return null;
	}());
	return nextTick;
}

/* eslint consistent-this: 0, no-shadow:0, no-eq-null: 0, eqeqeq: 0, no-unused-vars: 0 */

var hasRequiredAsync;

function requireAsync () {
	if (hasRequiredAsync) return async;
	hasRequiredAsync = 1;

	var aFrom        = requireFrom()
	  , objectMap    = requireMap()
	  , mixin        = requireMixin()
	  , defineLength = _defineLengthExports
	  , nextTick     = requireNextTick();

	var slice = Array.prototype.slice, apply = Function.prototype.apply, create = Object.create;

	registeredExtensions.async = function (tbi, conf) {
		var waiting = create(null)
		  , cache = create(null)
		  , base = conf.memoized
		  , original = conf.original
		  , currentCallback
		  , currentContext
		  , currentArgs;

		// Initial
		conf.memoized = defineLength(function (arg) {
			var args = arguments, last = args[args.length - 1];
			if (typeof last === "function") {
				currentCallback = last;
				args = slice.call(args, 0, -1);
			}
			return base.apply((currentContext = this), (currentArgs = args));
		}, base);
		try { mixin(conf.memoized, base); }
		catch (ignore) {}

		// From cache (sync)
		conf.on("get", function (id) {
			var cb, context, args;
			if (!currentCallback) return;

			// Unresolved
			if (waiting[id]) {
				if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback];
				else waiting[id].push(currentCallback);
				currentCallback = null;
				return;
			}

			// Resolved, assure next tick invocation
			cb = currentCallback;
			context = currentContext;
			args = currentArgs;
			currentCallback = currentContext = currentArgs = null;
			nextTick(function () {
				var data;
				if (hasOwnProperty.call(cache, id)) {
					data = cache[id];
					conf.emit("getasync", id, args, context);
					apply.call(cb, data.context, data.args);
				} else {
					// Purged in a meantime, we shouldn't rely on cached value, recall
					currentCallback = cb;
					currentContext = context;
					currentArgs = args;
					base.apply(context, args);
				}
			});
		});

		// Not from cache
		conf.original = function () {
			var args, cb, origCb, result;
			if (!currentCallback) return apply.call(original, this, arguments);
			args = aFrom(arguments);
			cb = function self(err) {
				var cb, args, id = self.id;
				if (id == null) {
					// Shouldn't happen, means async callback was called sync way
					nextTick(apply.bind(self, this, arguments));
					return undefined;
				}
				delete self.id;
				cb = waiting[id];
				delete waiting[id];
				if (!cb) {
					// Already processed,
					// outcome of race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
					return undefined;
				}
				args = aFrom(arguments);
				if (conf.has(id)) {
					if (err) {
						conf.delete(id);
					} else {
						cache[id] = { context: this, args: args };
						conf.emit("setasync", id, typeof cb === "function" ? 1 : cb.length);
					}
				}
				if (typeof cb === "function") {
					result = apply.call(cb, this, args);
				} else {
					cb.forEach(function (cb) { result = apply.call(cb, this, args); }, this);
				}
				return result;
			};
			origCb = currentCallback;
			currentCallback = currentContext = currentArgs = null;
			args.push(cb);
			result = apply.call(original, this, args);
			cb.cb = origCb;
			currentCallback = cb;
			return result;
		};

		// After not from cache call
		conf.on("set", function (id) {
			if (!currentCallback) {
				conf.delete(id);
				return;
			}
			if (waiting[id]) {
				// Race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
				if (typeof waiting[id] === "function") waiting[id] = [waiting[id], currentCallback.cb];
				else waiting[id].push(currentCallback.cb);
			} else {
				waiting[id] = currentCallback.cb;
			}
			delete currentCallback.cb;
			currentCallback.id = id;
			currentCallback = null;
		});

		// On delete
		conf.on("delete", function (id) {
			var result;
			// If false, we don't have value yet, so we assume that intention is not
			// to memoize this call. After value is obtained we don't cache it but
			// gracefully pass to callback
			if (hasOwnProperty.call(waiting, id)) return;
			if (!cache[id]) return;
			result = cache[id];
			delete cache[id];
			conf.emit("deleteasync", id, slice.call(result.args, 1));
		});

		// On clear
		conf.on("clear", function () {
			var oldCache = cache;
			cache = create(null);
			conf.emit(
				"clearasync", objectMap(oldCache, function (data) { return slice.call(data.args, 1); })
			);
		});
	};
	return async;
}

var promise = {};

var primitiveSet;
var hasRequiredPrimitiveSet;

function requirePrimitiveSet () {
	if (hasRequiredPrimitiveSet) return primitiveSet;
	hasRequiredPrimitiveSet = 1;

	var forEach = Array.prototype.forEach, create = Object.create;

	// eslint-disable-next-line no-unused-vars
	primitiveSet = function (arg /*, …args*/) {
		var set = create(null);
		forEach.call(arguments, function (name) { set[name] = true; });
		return set;
	};
	return primitiveSet;
}

var isCallable;
var hasRequiredIsCallable;

function requireIsCallable () {
	if (hasRequiredIsCallable) return isCallable;
	hasRequiredIsCallable = 1;

	isCallable = function (obj) { return typeof obj === "function"; };
	return isCallable;
}

var validateStringifiable;
var hasRequiredValidateStringifiable;

function requireValidateStringifiable () {
	if (hasRequiredValidateStringifiable) return validateStringifiable;
	hasRequiredValidateStringifiable = 1;

	var isCallable = requireIsCallable();

	validateStringifiable = function (stringifiable) {
		try {
			if (stringifiable && isCallable(stringifiable.toString)) return stringifiable.toString();
			return String(stringifiable);
		} catch (e) {
			throw new TypeError("Passed argument cannot be stringifed");
		}
	};
	return validateStringifiable;
}

var validateStringifiableValue;
var hasRequiredValidateStringifiableValue;

function requireValidateStringifiableValue () {
	if (hasRequiredValidateStringifiableValue) return validateStringifiableValue;
	hasRequiredValidateStringifiableValue = 1;

	var ensureValue   = validValue
	  , stringifiable = requireValidateStringifiable();

	validateStringifiableValue = function (value) { return stringifiable(ensureValue(value)); };
	return validateStringifiableValue;
}

var safeToString;
var hasRequiredSafeToString;

function requireSafeToString () {
	if (hasRequiredSafeToString) return safeToString;
	hasRequiredSafeToString = 1;

	var isCallable = requireIsCallable();

	safeToString = function (value) {
		try {
			if (value && isCallable(value.toString)) return value.toString();
			return String(value);
		} catch (e) {
			return "<Non-coercible to string value>";
		}
	};
	return safeToString;
}

var toShortStringRepresentation;
var hasRequiredToShortStringRepresentation;

function requireToShortStringRepresentation () {
	if (hasRequiredToShortStringRepresentation) return toShortStringRepresentation;
	hasRequiredToShortStringRepresentation = 1;

	var safeToString = requireSafeToString();

	var reNewLine = /[\n\r\u2028\u2029]/g;

	toShortStringRepresentation = function (value) {
		var string = safeToString(value);
		// Trim if too long
		if (string.length > 100) string = string.slice(0, 99) + "…";
		// Replace eventual new lines
		string = string.replace(reNewLine, function (char) {
			return JSON.stringify(char).slice(1, -1);
		});
		return string;
	};
	return toShortStringRepresentation;
}

var isPromise = {exports: {}};

var hasRequiredIsPromise;

function requireIsPromise () {
	if (hasRequiredIsPromise) return isPromise.exports;
	hasRequiredIsPromise = 1;
	isPromise.exports = isPromise$1;
	isPromise.exports.default = isPromise$1;

	function isPromise$1(obj) {
	  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}
	return isPromise.exports;
}

/* eslint max-statements: 0 */

var hasRequiredPromise;

function requirePromise () {
	if (hasRequiredPromise) return promise;
	hasRequiredPromise = 1;

	var objectMap     = requireMap()
	  , primitiveSet  = requirePrimitiveSet()
	  , ensureString  = requireValidateStringifiableValue()
	  , toShortString = requireToShortStringRepresentation()
	  , isPromise     = requireIsPromise()
	  , nextTick      = requireNextTick();

	var create = Object.create
	  , supportedModes = primitiveSet("then", "then:finally", "done", "done:finally");

	registeredExtensions.promise = function (mode, conf) {
		var waiting = create(null), cache = create(null), promises = create(null);

		if (mode === true) {
			mode = null;
		} else {
			mode = ensureString(mode);
			if (!supportedModes[mode]) {
				throw new TypeError("'" + toShortString(mode) + "' is not valid promise mode");
			}
		}

		// After not from cache call
		conf.on("set", function (id, ignore, promise) {
			var isFailed = false;

			if (!isPromise(promise)) {
				// Non promise result
				cache[id] = promise;
				conf.emit("setasync", id, 1);
				return;
			}
			waiting[id] = 1;
			promises[id] = promise;
			var onSuccess = function (result) {
				var count = waiting[id];
				if (isFailed) {
					throw new Error(
						"Memoizee error: Detected unordered then|done & finally resolution, which " +
							"in turn makes proper detection of success/failure impossible (when in " +
							"'done:finally' mode)\n" +
							"Consider to rely on 'then' or 'done' mode instead."
					);
				}
				if (!count) return; // Deleted from cache before resolved
				delete waiting[id];
				cache[id] = result;
				conf.emit("setasync", id, count);
			};
			var onFailure = function () {
				isFailed = true;
				if (!waiting[id]) return; // Deleted from cache (or succeed in case of finally)
				delete waiting[id];
				delete promises[id];
				conf.delete(id);
			};

			var resolvedMode = mode;
			if (!resolvedMode) resolvedMode = "then";

			if (resolvedMode === "then") {
				var nextTickFailure = function () { nextTick(onFailure); };
				// Eventual finally needs to be attached to non rejected promise
				// (so we not force propagation of unhandled rejection)
				promise = promise.then(function (result) {
					nextTick(onSuccess.bind(this, result));
				}, nextTickFailure);
				// If `finally` is a function we attach to it to remove cancelled promises.
				if (typeof promise.finally === "function") {
					promise.finally(nextTickFailure);
				}
			} else if (resolvedMode === "done") {
				// Not recommended, as it may mute any eventual "Unhandled error" events
				if (typeof promise.done !== "function") {
					throw new Error(
						"Memoizee error: Retrieved promise does not implement 'done' " +
							"in 'done' mode"
					);
				}
				promise.done(onSuccess, onFailure);
			} else if (resolvedMode === "done:finally") {
				// The only mode with no side effects assuming library does not throw unconditionally
				// for rejected promises.
				if (typeof promise.done !== "function") {
					throw new Error(
						"Memoizee error: Retrieved promise does not implement 'done' " +
							"in 'done:finally' mode"
					);
				}
				if (typeof promise.finally !== "function") {
					throw new Error(
						"Memoizee error: Retrieved promise does not implement 'finally' " +
							"in 'done:finally' mode"
					);
				}
				promise.done(onSuccess);
				promise.finally(onFailure);
			}
		});

		// From cache (sync)
		conf.on("get", function (id, args, context) {
			var promise;
			if (waiting[id]) {
				++waiting[id]; // Still waiting
				return;
			}
			promise = promises[id];
			var emit = function () { conf.emit("getasync", id, args, context); };
			if (isPromise(promise)) {
				if (typeof promise.done === "function") promise.done(emit);
				else {
					promise.then(function () { nextTick(emit); });
				}
			} else {
				emit();
			}
		});

		// On delete
		conf.on("delete", function (id) {
			delete promises[id];
			if (waiting[id]) {
				delete waiting[id];
				return; // Not yet resolved
			}
			if (!hasOwnProperty.call(cache, id)) return;
			var result = cache[id];
			delete cache[id];
			conf.emit("deleteasync", id, [result]);
		});

		// On clear
		conf.on("clear", function () {
			var oldCache = cache;
			cache = create(null);
			waiting = create(null);
			promises = create(null);
			conf.emit("clearasync", objectMap(oldCache, function (data) { return [data]; }));
		});
	};
	return promise;
}

var dispose = {};

var hasRequiredDispose;

function requireDispose () {
	if (hasRequiredDispose) return dispose;
	hasRequiredDispose = 1;

	var callable   = validCallable
	  , forEach    = forEach$1
	  , extensions = registeredExtensions
	  , apply      = Function.prototype.apply;

	extensions.dispose = function (dispose, conf, options) {
		var del;
		callable(dispose);
		if ((options.async && extensions.async) || (options.promise && extensions.promise)) {
			conf.on(
				"deleteasync",
				(del = function (id, resultArray) { apply.call(dispose, null, resultArray); })
			);
			conf.on("clearasync", function (cache) {
				forEach(cache, function (result, id) { del(id, result); });
			});
			return;
		}
		conf.on("delete", (del = function (id, result) { dispose(result); }));
		conf.on("clear", function (cache) {
			forEach(cache, function (result, id) { del(id, result); });
		});
	};
	return dispose;
}

var maxAge = {};

var maxTimeout;
var hasRequiredMaxTimeout;

function requireMaxTimeout () {
	if (hasRequiredMaxTimeout) return maxTimeout;
	hasRequiredMaxTimeout = 1;

	maxTimeout = 2147483647;
	return maxTimeout;
}

var validTimeout;
var hasRequiredValidTimeout;

function requireValidTimeout () {
	if (hasRequiredValidTimeout) return validTimeout;
	hasRequiredValidTimeout = 1;

	var toPosInt   = toPosInteger
	  , maxTimeout = requireMaxTimeout();

	validTimeout = function (value) {
		value = toPosInt(value);
		if (value > maxTimeout) throw new TypeError(value + " exceeds maximum possible timeout");
		return value;
	};
	return validTimeout;
}

/* eslint consistent-this: 0 */

var hasRequiredMaxAge;

function requireMaxAge () {
	if (hasRequiredMaxAge) return maxAge;
	hasRequiredMaxAge = 1;

	var aFrom      = requireFrom()
	  , forEach    = forEach$1
	  , nextTick   = requireNextTick()
	  , isPromise  = requireIsPromise()
	  , timeout    = requireValidTimeout()
	  , extensions = registeredExtensions;

	var noop = Function.prototype, max = Math.max, min = Math.min, create = Object.create;

	extensions.maxAge = function (maxAge, conf, options) {
		var timeouts, postfix, preFetchAge, preFetchTimeouts;

		maxAge = timeout(maxAge);
		if (!maxAge) return;

		timeouts = create(null);
		postfix =
			(options.async && extensions.async) || (options.promise && extensions.promise)
				? "async"
				: "";
		conf.on("set" + postfix, function (id) {
			timeouts[id] = setTimeout(function () { conf.delete(id); }, maxAge);
			if (typeof timeouts[id].unref === "function") timeouts[id].unref();
			if (!preFetchTimeouts) return;
			if (preFetchTimeouts[id]) {
				if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
			}
			preFetchTimeouts[id] = setTimeout(function () {
				delete preFetchTimeouts[id];
			}, preFetchAge);
			if (typeof preFetchTimeouts[id].unref === "function") preFetchTimeouts[id].unref();
		});
		conf.on("delete" + postfix, function (id) {
			clearTimeout(timeouts[id]);
			delete timeouts[id];
			if (!preFetchTimeouts) return;
			if (preFetchTimeouts[id] !== "nextTick") clearTimeout(preFetchTimeouts[id]);
			delete preFetchTimeouts[id];
		});

		if (options.preFetch) {
			if (options.preFetch === true || isNaN(options.preFetch)) {
				preFetchAge = 0.333;
			} else {
				preFetchAge = max(min(Number(options.preFetch), 1), 0);
			}
			if (preFetchAge) {
				preFetchTimeouts = {};
				preFetchAge = (1 - preFetchAge) * maxAge;
				conf.on("get" + postfix, function (id, args, context) {
					if (!preFetchTimeouts[id]) {
						preFetchTimeouts[id] = "nextTick";
						nextTick(function () {
							var result;
							if (preFetchTimeouts[id] !== "nextTick") return;
							delete preFetchTimeouts[id];
							conf.delete(id);
							if (options.async) {
								args = aFrom(args);
								args.push(noop);
							}
							result = conf.memoized.apply(context, args);
							if (options.promise) {
								// Supress eventual error warnings
								if (isPromise(result)) {
									if (typeof result.done === "function") result.done(noop, noop);
									else result.then(noop, noop);
								}
							}
						});
					}
				});
			}
		}

		conf.on("clear" + postfix, function () {
			forEach(timeouts, function (id) { clearTimeout(id); });
			timeouts = {};
			if (preFetchTimeouts) {
				forEach(preFetchTimeouts, function (id) { if (id !== "nextTick") clearTimeout(id); });
				preFetchTimeouts = {};
			}
		});
	};
	return maxAge;
}

var max = {};

var lruQueue;
var hasRequiredLruQueue;

function requireLruQueue () {
	if (hasRequiredLruQueue) return lruQueue;
	hasRequiredLruQueue = 1;

	var toPosInt = toPosInteger

	  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;

	lruQueue = function (limit) {
		var size = 0, base = 1, queue = create(null), map = create(null), index = 0, del;
		limit = toPosInt(limit);
		return {
			hit: function (id) {
				var oldIndex = map[id], nuIndex = ++index;
				queue[nuIndex] = id;
				map[id] = nuIndex;
				if (!oldIndex) {
					++size;
					if (size <= limit) return;
					id = queue[base];
					del(id);
					return id;
				}
				delete queue[oldIndex];
				if (base !== oldIndex) return;
				while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
			},
			delete: del = function (id) {
				var oldIndex = map[id];
				if (!oldIndex) return;
				delete queue[oldIndex];
				delete map[id];
				--size;
				if (base !== oldIndex) return;
				if (!size) {
					index = 0;
					base = 1;
					return;
				}
				while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
			},
			clear: function () {
				size = 0;
				base = 1;
				queue = create(null);
				map = create(null);
				index = 0;
			}
		};
	};
	return lruQueue;
}

var hasRequiredMax;

function requireMax () {
	if (hasRequiredMax) return max;
	hasRequiredMax = 1;

	var toPosInteger$1 = toPosInteger
	  , lruQueue     = requireLruQueue()
	  , extensions   = registeredExtensions;

	extensions.max = function (max, conf, options) {
		var postfix, queue, hit;

		max = toPosInteger$1(max);
		if (!max) return;

		queue = lruQueue(max);
		postfix =
			(options.async && extensions.async) || (options.promise && extensions.promise)
				? "async"
				: "";

		conf.on(
			"set" + postfix,
			(hit = function (id) {
				id = queue.hit(id);
				if (id === undefined) return;
				conf.delete(id);
			})
		);
		conf.on("get" + postfix, hit);
		conf.on("delete" + postfix, queue.delete);
		conf.on("clear" + postfix, queue.clear);
	};
	return max;
}

var refCounter = {};

var hasRequiredRefCounter;

function requireRefCounter () {
	if (hasRequiredRefCounter) return refCounter;
	hasRequiredRefCounter = 1;

	var d                = dExports
	  , extensions       = registeredExtensions
	  , create           = Object.create
	  , defineProperties = Object.defineProperties;

	extensions.refCounter = function (ignore, conf, options) {
		var cache, postfix;

		cache = create(null);
		postfix =
			(options.async && extensions.async) || (options.promise && extensions.promise)
				? "async"
				: "";

		conf.on("set" + postfix, function (id, length) { cache[id] = length || 1; });
		conf.on("get" + postfix, function (id) { ++cache[id]; });
		conf.on("delete" + postfix, function (id) { delete cache[id]; });
		conf.on("clear" + postfix, function () { cache = {}; });

		defineProperties(conf.memoized, {
			deleteRef: d(function () {
				var id = conf.get(arguments);
				if (id === null) return null;
				if (!cache[id]) return null;
				if (!--cache[id]) {
					conf.delete(id);
					return true;
				}
				return false;
			}),
			getRefCount: d(function () {
				var id = conf.get(arguments);
				if (id === null) return 0;
				if (!cache[id]) return 0;
				return cache[id];
			}),
		});
	};
	return refCounter;
}

var normalizeOpts = normalizeOptions
  , resolveLength = resolveLength$2
  , plain         = plain$1;

var memoizee = function (fn/*, options*/) {
	var options = normalizeOpts(arguments[1]), length;

	if (!options.normalizer) {
		length = options.length = resolveLength(options.length, fn.length, options.async);
		if (length !== 0) {
			if (options.primitive) {
				if (length === false) {
					options.normalizer = requirePrimitive();
				} else if (length > 1) {
					options.normalizer = requireGetPrimitiveFixed()(length);
				}
			} else if (length === false) options.normalizer = requireGet()();
			else if (length === 1) options.normalizer = requireGet1()();
			else options.normalizer = requireGetFixed()(length);
		}
	}

	// Assure extensions
	if (options.async) requireAsync();
	if (options.promise) requirePromise();
	if (options.dispose) requireDispose();
	if (options.maxAge) requireMaxAge();
	if (options.max) requireMax();
	if (options.refCounter) requireRefCounter();

	return plain(fn, options);
};

const memoize = /*@__PURE__*/getDefaultExportFromCjs(memoizee);

//#region src/util/portalMeta.ts
const _fetchPortalMeta = memoize(async function(portalUrl) {
	const endpoint = "/api/meta";
	let fullEndpoint = "";
	if (portalUrl) try {
		const portalUrlObj = new URL(portalUrl);
		portalUrlObj.pathname = endpoint;
		fullEndpoint = portalUrlObj.toString();
		if (!fullEndpoint.startsWith("http")) fullEndpoint = `https://${fullEndpoint}`;
	} catch (error) {
		throw new Error(`Invalid portal URL: ${portalUrl}`);
	}
	else {
		const baseUrl = getApiBaseUrl({ currentUrl: portalUrl });
		if (!baseUrl) throw new Error("Could not detect portal API endpoint");
		fullEndpoint = `${baseUrl}${endpoint}`;
	}
	try {
		const response = await fetch(fullEndpoint);
		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
		const data = await response.json();
		if (!data.domain) throw new Error("Response does not contain required 'domain' property");
		return data;
	} catch (error) {
		throw error instanceof Error ? error : new Error(String(error));
	}
}, { promise: true });
async function __test_clearCache() {
	await _fetchPortalMeta.clear?.();
}
async function fetchPortalMeta(portalUrl) {
	return _fetchPortalMeta(portalUrl);
}
function getPluginMeta(meta, pluginName, key) {
	const pluginMeta = meta?.plugins?.[pluginName]?.meta;
	if (!pluginMeta) return void 0;
	if (!key) return pluginMeta;
	return key.split(".").reduce((acc, part) => acc?.[part], pluginMeta);
}

//#region src/types/api.ts
const ERROR_CATEGORIES = {
	CAPABILITY: "capability",
	FEATURE: "feature",
	PLUGIN: "plugin",
	SYSTEM: "system"
};

//#region src/util/widget.ts
function sortWidgets(widgets) {
	return [...widgets].sort((a, b) => {
		const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
		const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
		const colA = a.position.location?.column ?? Number.MAX_SAFE_INTEGER;
		const colB = b.position.location?.column ?? Number.MAX_SAFE_INTEGER;
		return orderA - orderB || colA - colB || a.id.localeCompare(b.id);
	});
}

var runtime = {};

var runtime_cjs = {};

(function (exports$1) {

	var runtime = index_cjs;



	Object.prototype.hasOwnProperty.call(runtime, '__proto__') &&
		!Object.prototype.hasOwnProperty.call(exports$1, '__proto__') &&
		Object.defineProperty(exports$1, '__proto__', {
			enumerable: true,
			value: runtime['__proto__']
		});

	Object.keys(runtime).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports$1, k)) exports$1[k] = runtime[k];
	});
	
} (runtime_cjs));

(function (exports$1) {
	var __createBinding = (runtime && runtime.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (runtime && runtime.__exportStar) || function(m, exports$1) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports$1, "__esModule", { value: true });
	__exportStar(runtime_cjs, exports$1);
	
} (runtime));

//#region src/api/framework.ts
var Framework = class {
	get appName() {
		return this._appName;
	}
	get framework() {
		if (!this.#_framework) throw new Error("Framework not set");
		return this.#_framework;
	}
	set framework(value) {
		this.#_framework = value;
	}
	get meta() {
		return this.#meta;
	}
	get portalUrl() {
		if (!this.#portalUrl) throw new Error("Portal URL not initialized. Call initialize() first.");
		return this.#portalUrl;
	}
	#_framework = null;
	#capabilities;
	#isInitialized = false;
	#meta = null;
	#plugins;
	#portalUrl = null;
	_appName;
	widgetAreas = /* @__PURE__ */ new Map();
	widgets = /* @__PURE__ */ new Map();
	constructor(capabilities, plugins, appName) {
		this.#capabilities = capabilities;
		this.#plugins = plugins;
		this._appName = appName;
		plugins.framework = this;
		capabilities.framework = this;
	}
	_loadRemote = (...args) => runtime.loadRemote.apply(null, args);
	enablePlugin(id) {
		validateNamespacedId(id);
		this.#plugins.enablePlugin(id);
	}
	getAssociatedCapabilities(primaryCapabilityId) {
		for (const plugin of this.getPlugins()) if (plugin.capabilityAssociations) {
			const associations = plugin.capabilityAssociations.find((assoc) => assoc.primary === primaryCapabilityId);
			if (associations) return associations.associated;
		}
		return [];
	}
	async getCapabilitiesByType(type) {
		return await this.#capabilities.getAllOfType(type);
	}
	async getCapability(id) {
		return await this.#capabilities.get(id);
	}
	async getFeature(id) {
		validateNamespacedId(id);
		const feature = await this.#plugins.getFeatureWithFallback(id);
		if (!feature) throw new Error(`Feature ${id} not found`);
		return feature;
	}
	getPluginManager() {
		return this.#plugins;
	}
	getPlugins() {
		return this.#plugins.getPlugins();
	}
	getPrimaryCapability(associatedCapabilityId) {
		for (const plugin of this.getPlugins()) if (plugin.capabilityAssociations) {
			const associations = plugin.capabilityAssociations.find((assoc) => assoc.associated.includes(associatedCapabilityId));
			if (associations) return associations.primary;
		}
		return null;
	}
	getWidgetArea(id) {
		const area = this.widgetAreas.get(id);
		if (!area) throw new Error(`Widget area ${id} not found`);
		return area;
	}
	getWidgetsForArea(id) {
		if (!this.widgetAreas.has(id)) throw new Error(`Widget area ${id} not found`);
		return sortWidgets(Array.from(this.widgets.values()).filter((w) => w.areaId === id));
	}
	hasCapability(type) {
		validateNamespacedId(type);
		return this.#plugins.hasCapability(type);
	}
	async initialize() {
		if (this.#isInitialized) {
			console.warn(`Framework for ${this._appName} already initialized.`);
			return { success: true };
		}
		for (const plugin of this.getPlugins()) if (plugin.widgets) {
			plugin.widgets.areas?.forEach((area) => {
				this.registerWidgetArea(area);
			});
			if (plugin.widgets.widgets?.length) this.registerWidgetsFromPlugin(plugin.id, plugin.widgets.widgets);
		}
		if (!this.#portalUrl) await this.#fetchAndSetPortalMeta();
		const errors = [];
		const pluginFailures = await this.#plugins.initializePlugins();
		for (const [id, error] of pluginFailures) errors.push({
			category: ERROR_CATEGORIES.PLUGIN,
			error,
			id
		});
		await this.#plugins.retryFailedPlugins();
		for (const pluginId of this.#plugins.getEnabledPlugins()) {
			const plugin = this.#plugins.getOrActivatePlugin(pluginId);
			if (!plugin) errors.push({
				category: ERROR_CATEGORIES.PLUGIN,
				error: /* @__PURE__ */ new Error(`Failed to load plugin: ${pluginId}`),
				id: pluginId
			});
			else {
				if (!validatePlugin(plugin)) {
					errors.push({
						category: ERROR_CATEGORIES.PLUGIN,
						error: /* @__PURE__ */ new Error(`Plugin ${plugin.id} does not comply with Plugin interface`),
						id: plugin.id
					});
					return;
				}
				plugin.capabilities?.forEach((capability) => {
					this.#capabilities.register(capability, plugin.id);
				});
			}
		}
		const capabilityFailures = await this.#capabilities.initializeAll();
		for (const [id, error] of capabilityFailures) errors.push({
			category: ERROR_CATEGORIES.CAPABILITY,
			error,
			id
		});
		for (const plugin of this.getPlugins()) if (plugin.features) for (const feature of plugin.features) {
			if (!validateFeature(feature)) {
				errors.push({
					category: ERROR_CATEGORIES.FEATURE,
					error: /* @__PURE__ */ new Error(`Feature ${feature.id} does not comply with FrameworkFeature interface`),
					id: feature.id
				});
				continue;
			}
			try {
				await this.loadFeature(feature.id);
			} catch (error) {
				errors.push({
					category: ERROR_CATEGORIES.FEATURE,
					error: error instanceof Error ? error : new Error(String(error)),
					id: feature.id
				});
			}
		}
		const success = errors.length === 0;
		if (success) this.#isInitialized = true;
		return {
			failures: errors.length > 0 ? errors : void 0,
			success
		};
	}
	isFeatureAvailable(id) {
		const state = this.#plugins.getPluginState(id);
		return state?.loadState === "loaded" && state?.initState === "initialized";
	}
	isInitialized() {
		return this.#isInitialized;
	}
	isPluginEnabled(id) {
		validateNamespacedId(id);
		return this.#plugins.isPluginEnabled(id);
	}
	async loadFeature(id) {
		validateNamespacedId(id);
		return await this.#plugins.loadFeature(id);
	}
	registerCapability(capability, pluginId) {
		this.#capabilities.register(capability, pluginId);
	}
	registerWidget(widget) {
		if (this.widgets.has(widget.id)) throw new Error(`Widget with id ${widget.id} already registered`);
		if (!this.widgetAreas.has(widget.areaId)) throw new Error(`Widget area ${widget.areaId} not registered`);
		const definition = {
			...widget,
			component: createRemoteComponentLoader({
				componentPath: widget.componentName,
				pluginId: widget.pluginId
			}, this, defaultRemoteOptions)
		};
		this.widgets.set(widget.id, definition);
	}
	registerWidgetArea(area) {
		this.widgetAreas.set(area.id, area);
	}
	/**
	* Registers all widgets from a plugin configuration
	*/
	registerWidgetsFromPlugin(pluginId, widgets) {
		widgets.forEach((widget) => {
			this.registerWidget({
				...widget,
				componentName: widget.componentName,
				pluginId
			});
		});
	}
	resolvePluginModule(pluginId, exportName) {
		const mapping = this.#plugins.getRemoteModule(pluginId);
		if (!mapping) throw new Error(`No module mapping found for plugin: ${pluginId}`);
		return `${mapping.moduleId}/${exportName}`;
	}
	async #fetchAndSetPortalMeta() {
		try {
			const meta = await fetchPortalMeta();
			if (!meta?.domain) throw new Error("Invalid portal meta: missing domain");
			this.#meta = meta;
			this.#portalUrl = meta.domain.startsWith("http") ? meta.domain : `https://${meta.domain}`;
		} catch (error) {
			console.error("Failed to fetch portal meta:", error);
			const fallbackUrl = env.VITE_PORTAL_DOMAIN || getCurrentLocation().origin;
			this.#portalUrl = fallbackUrl;
			console.warn(`Using fallback portal URL: ${fallbackUrl}`);
		}
	}
};

//#region src/capabilities/manager.ts
var CapabilityManager = class {
	set framework(framework) {
		this._framework = framework;
	}
	get framework() {
		if (!this._framework) throw new Error("Framework not set");
		return this._framework;
	}
	#capabilities = /* @__PURE__ */ new Map();
	#capabilityToPlugin = /* @__PURE__ */ new Map();
	#deferredPromises = /* @__PURE__ */ new Map();
	#initialized = /* @__PURE__ */ new Set();
	#typeIndex = /* @__PURE__ */ new Map();
	#typeRegistrationOrder = [];
	_framework = null;
	get #framework() {
		if (!this._framework) throw new Error("Framework not set");
		return this._framework;
	}
	async destroyAll() {
		const failures = /* @__PURE__ */ new Map();
		const dependencyGraph = /* @__PURE__ */ new Map();
		const allCapabilities = Array.from(this.#capabilities.values());
		for (const cap of allCapabilities) dependencyGraph.set(cap.id, [...cap.dependencies || []]);
		const sortedCapabilities = this.#resolveDependencyOrder(dependencyGraph).reverse();
		for (const cap of sortedCapabilities) try {
			if (!this.#initialized.has(cap.id)) continue;
			await cap.destroy(this.#framework);
			this.#initialized.delete(cap.id);
		} catch (error) {
			failures.set(cap.id, error instanceof Error ? error : new Error(String(error)));
		}
		return failures;
	}
	async get(id) {
		const capability = this.#capabilities.get(id);
		if (!capability) return void 0;
		if (this.#initialized.has(id)) return capability;
		const deferred = this.#deferredPromises.get(id);
		if (!deferred) return void 0;
		await deferred.promise;
		return this.#capabilities.get(id);
	}
	async getAllOfType(type) {
		const ids = this.#typeIndex.get(type) || [];
		const filteredCaps = (await Promise.all(ids.map((id) => this.get(id)))).filter(Boolean);
		const pluginOrder = this.#framework.getPluginManager().getInitializationOrder();
		const pluginOrderMap = new Map(pluginOrder.map((id, index) => [id, index]));
		const originalIndices = new Map(filteredCaps.map((cap, idx) => [cap.id, idx]));
		return filteredCaps.sort((a, b) => {
			const aPlugin = this.#capabilityToPlugin.get(a.id) || "";
			const bPlugin = this.#capabilityToPlugin.get(b.id) || "";
			const diff = (pluginOrderMap.get(aPlugin) ?? pluginOrder.length) - (pluginOrderMap.get(bPlugin) ?? pluginOrder.length);
			if (diff !== 0) return diff;
			return (originalIndices.get(a.id) ?? 0) - (originalIndices.get(b.id) ?? 0);
		});
	}
	async initializeAll() {
		const failures = /* @__PURE__ */ new Map();
		const dependencyGraph = /* @__PURE__ */ new Map();
		const allCapabilities = Array.from(this.#capabilities.values());
		for (const cap of allCapabilities) dependencyGraph.set(cap.id, [...cap.dependencies || []]);
		const sortedCapabilities = this.#resolveDependencyOrder(dependencyGraph);
		for (const cap of sortedCapabilities) if (!this.#deferredPromises.has(cap.id)) {
			let resolveFn = () => {};
			let rejectFn = () => {};
			const promise = new Promise((resolve, reject) => {
				resolveFn = resolve;
				rejectFn = reject;
			});
			this.#deferredPromises.set(cap.id, {
				promise,
				reject: rejectFn,
				resolve: resolveFn
			});
		}
		for (const cap of sortedCapabilities) {
			if (this.#initialized.has(cap.id)) {
				console.warn(`Capability ${cap.id} already initialized`);
				continue;
			}
			if (!validateCapability(cap)) {
				const validationResult = validateCapabilityDetailed(cap);
				const errorMessage = validationResult.missingProperties.length > 0 ? `Capability ${cap.id} validation failed: ${validationResult.missingProperties.join(", ")}` : `Capability ${cap.id} validation failed: unknown validation issues`;
				const err = new Error(errorMessage);
				this.#deferredPromises.get(cap.id)?.reject(err);
				failures.set(cap.id, err);
				continue;
			}
			try {
				await cap.initialize(this.#framework);
				this.#initialized.add(cap.id);
				this.#deferredPromises.get(cap.id).resolve();
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				this.#deferredPromises.get(cap.id).reject(err);
				failures.set(cap.id, err);
			}
		}
		return failures;
	}
	register(capability, pluginId) {
		if (this.#capabilities.has(capability.id)) {
			console.warn(`Capability ${capability.id} already registered by plugin ${this.#capabilityToPlugin.get(capability.id)}. Plugin ${pluginId} attempted to re-register it.`);
			return;
		}
		this.#capabilityToPlugin.set(capability.id, pluginId);
		this.#capabilities.set(capability.id, capability);
		if (!this.#typeIndex.has(capability.type)) {
			this.#typeIndex.set(capability.type, []);
			this.#typeRegistrationOrder.push(capability.type);
		}
		this.#typeIndex.get(capability.type).push(capability.id);
	}
	#resolveDependencyOrder(dependencyGraph) {
		const graph = new DependencyGraph();
		for (const [id, deps] of dependencyGraph) {
			graph.addNode(id);
			for (const depId of deps) graph.addDependency(id, depId);
		}
		for (const type of this.#typeRegistrationOrder) {
			const typeCapIds = this.#typeIndex.get(type) || [];
			for (let i = 1; i < typeCapIds.length; i++) {
				const prevId = typeCapIds[i - 1];
				const currId = typeCapIds[i];
				if (!graph.getDependencies(currId).size && !graph.getDependencies(prevId).size && !graph.getDependents(prevId).has(currId)) graph.addDependency(currId, prevId);
			}
		}
		return graph.topologicalSort().map((id) => this.#capabilities.get(id)).filter((cap) => !!cap);
	}
};

//#region src/util/getPluginInfo.ts
function getPluginInfo(mod) {
	const tempPlugin = mod.default();
	if (!tempPlugin.id) throw new Error("Plugin module must provide id");
	return { id: tempPlugin.id };
}

//#region src/api/builder.ts
var Builder = class {
	get framework() {
		if (!this.#framework) {
			console.log("[Builder] Building new framework instance");
			this.#framework = this.build();
		}
		return this.#framework;
	}
	#capabilities;
	#framework = null;
	#operations = [];
	#plugins;
	_appName;
	constructor(appName) {
		this._appName = appName;
	}
	async build() {
		this.#plugins = new PluginManager();
		this.#capabilities = new CapabilityManager();
		for (const op of this.#operations) await op();
		return new Framework(this.#capabilities, this.#plugins, this._appName);
	}
	getPlugins() {
		return Array.from(this.#plugins?.getPlugins() ?? []);
	}
	registerPluginFactory(id, factory) {
		this.#operations.push(async () => {
			if (!this.#plugins) throw new Error("Builder not initialized");
			this.#plugins.registerFactory(id, factory);
		});
		return this;
	}
	async registerRemoteModule(remoteEntry, moduleId) {
		this.#operations.push(async () => {
			if (!this.#plugins) throw new Error("Builder not initialized");
			try {
				const mod = await runtime.loadRemote(moduleId);
				const { id: pluginId } = getPluginInfo(mod);
				this.#plugins.registerRemoteModule(moduleId, remoteEntry, pluginId);
				this.#plugins.registerFactory(pluginId, mod.default);
				this.#plugins.enableAndActivatePlugin(pluginId);
			} catch (error) {
				console.error(`Failed to register remote module ${moduleId}:`, error);
				throw error;
			}
		});
		return this;
	}
};

//#region src/components/ErrorDisplay.tsx
const categoryLabels = {
	capability: "Capability Error",
	feature: "Feature Error",
	plugin: "Plugin Error",
	system: "System Error"
};
function ErrorDisplay({ error, onRetry }) {
	const hasCategories = "errors" in error && Array.isArray(error.errors);
	const groupedErrors = hasCategories ? error.errors?.reduce((groups, err) => {
		const category = err.category;
		if (!groups[category]) groups[category] = [];
		groups[category].push(err);
		return groups;
	}, {}) : null;
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "min-h-screen w-full flex items-center justify-center",
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "space-y-6 p-6 max-w-2xl w-full flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
					className: "w-full space-y-2",
					role: "alert",
					children: [
						/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
							className: "flex justify-center mb-4",
							children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 text-red-600" })
						}),
						/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
							className: "text-2xl font-semibold text-red-600",
							children: "Framework Initialization Failed"
						}),
						!hasCategories && /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
							className: "text-gray-600",
							children: error.message || "An unexpected error occurred during initialization"
						})
					]
				}),
				groupedErrors && /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
					className: "w-full space-y-6 text-left",
					role: "alert",
					children: Object.entries(groupedErrors).map(([category, errors]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h3", {
							className: "font-medium text-gray-900",
							children: categoryLabels[category]
						}), errors.map((error$1) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
							className: "p-4 bg-red-50 rounded-lg border border-red-200",
							children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
								className: "font-medium text-red-900",
								children: error$1.error.originalId || error$1.id
							}), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
								className: "mt-1 text-sm text-red-800",
								children: error$1.error.message
							})]
						}, error$1.id))]
					}, category))
				}),
				onRetry && /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
					className: "mt-6 px-6 py-2.5 bg-red-50 hover:bg-red-100\n                      text-red-600 font-medium rounded-lg transition-colors duration-200",
					onClick: onRetry,
					children: "Retry Initialization"
				})
			]
		})
	});
}

//#region src/util/pluginManifest.ts
const _getPortalPluginManifests = memoize(async (appName, portalUrl) => {
	const baseUrl = getApiBaseUrl({ currentUrl: portalUrl });
	if (!baseUrl) throw new Error("Could not detect base API url");
	const url = new URL(baseUrl);
	url.searchParams.set("app", appName);
	const meta = await fetchPortalMeta(url.toString());
	if (!meta.plugins) throw new Error("Portal meta does not contain required 'plugins' property");
	const manifests = [];
	for (const pluginName in meta.plugins) {
		const plugin = meta.plugins[pluginName];
		if (plugin.web_bundles) manifests.push(...plugin.web_bundles);
	}
	return manifests;
});
async function getPortalPluginManifests(appName, portalUrl) {
	return _getPortalPluginManifests(appName, portalUrl);
}

//#region src/util/framework-initializer.ts
const initializationState = /* @__PURE__ */ new Map();
async function initializeFramework(options) {
	const { appName, configure, existingBuilder } = options;
	const errors = [];
	let builder = existingBuilder || initializationState.get(appName)?.builder;
	let framework;
	try {
		if (!builder) {
			builder = new Builder(options.appName);
			runtime.init({
				name: appName,
				remotes: []
			});
			const manifestsMap = await getPortalPluginManifests(appName, env.VITE_PORTAL_DOMAIN);
			await Promise.all(manifestsMap.map(async (manifestUrl, index) => {
				try {
					const moduleId = `remote-${index}`;
					await runtime.registerRemotes([{
						entry: manifestUrl,
						name: moduleId
					}]);
					await builder.registerRemoteModule(manifestUrl, moduleId);
				} catch (err) {
					errors.push({
						category: ERROR_CATEGORIES.PLUGIN,
						error: err instanceof Error ? err : new Error(String(err)),
						id: `plugin-load-${index}`
					});
				}
			}));
			builder = configure(builder);
		}
		framework = await builder.framework;
		let initResult = { success: true };
		if (!framework.isInitialized()) {
			initResult = await framework.initialize();
			if (initResult.failures) errors.push(...initResult.failures);
		} else console.warn(`Framework instance for ${appName} already initialized - skipping initialize() call`);
		const result = {
			builder,
			framework,
			...errors.length > 0 ? { errors } : {},
			success: errors.length === 0 && initResult.success
		};
		if (result.framework.isInitialized()) initializationState.set(appName, {
			builder: result.builder,
			framework: result.framework
		});
		else initializationState.delete(appName);
		return result;
	} catch (err) {
		if (!builder) throw err;
		return {
			builder,
			errors: [{
				category: ERROR_CATEGORIES.SYSTEM,
				error: err instanceof Error ? err : new Error(String(err)),
				id: "system-initialization"
			}],
			framework,
			success: false
		};
	}
}
function shouldInitialize(builder, framework) {
	return !framework?.isInitialized();
}

//#region src/contexts/framework.tsx
const FrameworkContext = dashboard__loadShare__react__loadShare__.createContext(null);
function FrameworkProvider({ appName, children, configure }) {
	const builderRef = dashboard__loadShare__react__loadShare__.useRef();
	const frameworkRef = dashboard__loadShare__react__loadShare__.useRef();
	const [state, setState] = dashboard__loadShare__react__loadShare__.useState({
		error: null,
		framework: null,
		isLoading: true
	});
	const initializeFrameworkInstance = dashboard__loadShare__react__loadShare__.useCallback(async () => {
		try {
			if (!shouldInitialize(builderRef.current, frameworkRef.current)) {
				setState({
					error: null,
					framework: frameworkRef.current,
					isLoading: false
				});
				document.dispatchEvent(new CustomEvent("portal:boot:complete", { detail: {
					success: true,
					error: null
				} }));
				return;
			}
			setState((prev) => ({
				...prev,
				error: null,
				isLoading: true
			}));
			const result = await initializeFramework({
				appName,
				configure,
				existingBuilder: builderRef.current
			});
			builderRef.current = result.builder;
			frameworkRef.current = result.framework;
			if (result.errors) throw Object.assign(/* @__PURE__ */ new Error("Framework initialization failed"), { errors: result.errors });
			setState({
				error: null,
				framework: result.framework,
				isLoading: false
			});
			document.dispatchEvent(new CustomEvent("portal:boot:complete", { detail: {
				success: true,
				error: null
			} }));
		} catch (err) {
			console.error("[FrameworkProvider] Initialization error:", err);
			if (err && typeof err === "object" && "errors" in err) {
				console.error("[FrameworkProvider] Individual errors:");
				for (const [key, error$1] of Object.entries(err.errors)) console.error(`  ${key}:`, error$1);
			}
			const error = err instanceof Error ? err : /* @__PURE__ */ new Error("Failed to initialize framework");
			setState({
				error,
				framework: null,
				isLoading: false
			});
			document.dispatchEvent(new CustomEvent("portal:boot:complete", { detail: {
				success: false,
				error
			} }));
		}
	}, [appName, configure]);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		initializeFrameworkInstance();
	}, [
		appName,
		configure,
		initializeFrameworkInstance
	]);
	const contextValue = {
		error: state.error,
		framework: state.framework,
		getAppName: () => appName,
		getWidgetArea: (id) => {
			if (!state.framework) throw new Error("Framework not initialized");
			return state.framework.getWidgetArea(id);
		},
		getWidgetsForArea: (id) => {
			if (!state.framework) throw new Error("Framework not initialized");
			return state.framework.getWidgetsForArea(id);
		},
		isLoading: state.isLoading,
		reinitialize: initializeFrameworkInstance
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(FrameworkContext.Provider, {
		value: contextValue,
		children
	});
}
function useFramework() {
	const context = dashboard__loadShare__react__loadShare__.useContext(FrameworkContext);
	if (!context) throw new Error("useFramework must be used within a FrameworkProvider");
	return context;
}
function useFrameworkLoading() {
	const context = dashboard__loadShare__react__loadShare__.useContext(FrameworkContext);
	if (!context) throw new Error("useFrameworkLoading must be used within a FrameworkProvider");
	return {
		error: context.error,
		isLoading: context.isLoading,
		reinitialize: context.reinitialize
	};
}
function useFrameworkData(fetchData, deps = []) {
	const { framework, isLoading: frameworkLoading, error: frameworkError } = useFramework();
	const [data, setData] = dashboard__loadShare__react__loadShare__.useState(null);
	const [error, setError] = dashboard__loadShare__react__loadShare__.useState(null);
	const [isLoading, setIsLoading] = dashboard__loadShare__react__loadShare__.useState(true);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		let mounted = true;
		if (frameworkError) {
			if (mounted) {
				setError(frameworkError);
				setIsLoading(false);
			}
			return;
		} else if (frameworkLoading) {
			if (mounted) setIsLoading(true);
			return;
		}
		setIsLoading(true);
		setError(null);
		fetchData().then((result) => {
			if (mounted) {
				setData(result);
				setIsLoading(false);
			}
		}).catch((err) => {
			if (mounted) {
				setError(err);
				setIsLoading(false);
			}
		});
		return () => {
			mounted = false;
		};
	}, [
		framework,
		frameworkLoading,
		frameworkError,
		fetchData,
		...deps
	]);
	return {
		data,
		error,
		isLoading
	};
}
function useCapability(id) {
	const { framework } = useFramework();
	return useFrameworkData(dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getCapability(id);
	}, [framework, id]));
}
function useFeature(id) {
	const { framework } = useFramework();
	return useFrameworkData(dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getFeature(id);
	}, [framework, id]));
}
function useCapabilitiesByType(typeId) {
	const { framework } = useFramework();
	return useFrameworkData(dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getCapabilitiesByType(typeId);
	}, [framework, typeId]));
}

//#region src/hooks/useWidgetArea.ts
function useWidgetArea(id) {
	const { framework } = useFramework();
	const area = framework.getWidgetArea(id);
	const filteredWidgets = framework.getWidgetsForArea(id).filter((widget) => {
		if (widget.visibilityHook) return widget.visibilityHook();
		return true;
	});
	const sortedWidgets = sortWidgets(filteredWidgets);
	return {
		area,
		isVisible: filteredWidgets.length > 0,
		widgets: sortedWidgets
	};
}

//#region src/components/FlexWidgetArea.tsx
function FlexWidgetArea({ className, id, tag = "div" }) {
	const { isVisible, widgets } = useWidgetArea(id);
	if (!isVisible) return null;
	return /* @__PURE__ */ jsxRuntimeExports.jsx(tag, {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("flex flex-col", className),
		children: widgets.map((widget) => {
			const Widget = widget.component;
			return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Widget, {}) }, widget.id);
		})
	});
}

//#region src/types/widget.ts
const DEFAULT_WIDGET_AREA_DEFINITION = {
	gap: 16,
	rowHeight: 50
};

//#region src/util/grid.ts
function generateDimensionClasses(prefix) {
	const classes = {};
	for (let i = 1; i <= 12; i++) classes[i] = `${prefix}-${i}`;
	return classes;
}
function generateGridGapClasses() {
	return {
		0: "gap-0",
		1: "gap-px",
		2: "gap-0.5",
		4: "gap-1",
		6: "gap-1.5",
		8: "gap-2",
		10: "gap-2.5",
		12: "gap-3",
		14: "gap-3.5",
		16: "gap-4",
		20: "gap-5",
		24: "gap-6",
		28: "gap-7",
		32: "gap-8",
		36: "gap-9",
		40: "gap-10",
		44: "gap-11",
		48: "gap-12",
		56: "gap-14",
		64: "gap-16",
		80: "gap-20",
		96: "gap-24",
		112: "gap-28",
		128: "gap-32",
		144: "gap-36",
		160: "gap-40",
		176: "gap-44",
		192: "gap-48",
		208: "gap-52",
		224: "gap-56",
		240: "gap-60",
		256: "gap-64",
		288: "gap-72",
		320: "gap-80",
		384: "gap-96"
	};
}
function generateGridSpanClasses(type) {
	const classes = {};
	for (let i = 1; i <= 12; i++) classes[`span_${i}`] = `${type}-span-${i}`;
	return classes;
}
function getColumnStartClass(start) {
	return `col-start-${start}`;
}
function getColumnEndClass(end) {
	return `col-end-${end}`;
}
function getColumnSpanClass(span) {
	return `col-span-${span}`;
}
function getColumnEndSpanClass(span) {
	return `col-end-[span_${span}]`;
}
function getMobileSpanClass() {
	return "col-span-1";
}
function getResponsiveClass(baseClass, breakpoint = "sm") {
	return `${breakpoint}:${baseClass}`;
}
function getResponsiveColumnStartClass(start) {
	return getResponsiveClass(getColumnStartClass(start));
}
function getResponsiveColumnEndClass(end) {
	return getResponsiveClass(getColumnEndClass(end));
}
function getResponsiveColumnSpanClass(span) {
	return getResponsiveClass(getColumnSpanClass(span));
}
function getResponsiveColumnEndSpanClass(span) {
	return getResponsiveClass(getColumnEndSpanClass(span));
}
function generateResponsiveGridSpanClasses() {
	const classes = {};
	for (let span = 1; span <= 12; span++) classes[`auto_span_${span}`] = `${getMobileSpanClass()} ${getColumnStartClass("auto")} ${getResponsiveColumnEndSpanClass(span)}`;
	for (let start = 1; start <= 12; start++) for (let end = start + 1; end <= 13; end++) classes[`start_${start}_end_${end}`] = `${getMobileSpanClass()} ${getResponsiveColumnStartClass(start)} ${getResponsiveColumnEndClass(end)}`;
	for (let start = 1; start <= 12; start++) for (let span = 1; span <= 12; span++) classes[`start_${start}_span_${span}`] = `${getMobileSpanClass()} ${getResponsiveColumnStartClass(start)} ${getResponsiveColumnEndSpanClass(span)}`;
	return classes;
}
function generateResponsiveGridColumnClasses() {
	const classes = {};
	for (let i = 1; i <= 12; i++) classes[i] = `grid-cols-1 tablet:grid-cols-${i}`;
	return classes;
}
const RESPONSIVE_GRID_COLUMN_CLASSES = generateResponsiveGridColumnClasses();
const GRID_ROW_SPAN_CLASSES = generateGridSpanClasses("row");
const RESPONSIVE_GRID_COLUMN_SPAN_CLASSES = generateResponsiveGridSpanClasses();
const GRID_GAP_CLASSES = generateGridGapClasses();
const MIN_WIDTH_CLASSES = generateDimensionClasses("min-w");
const MIN_HEIGHT_CLASSES = generateDimensionClasses("min-h");
const MAX_WIDTH_CLASSES = generateDimensionClasses("max-w");
const MAX_HEIGHT_CLASSES = generateDimensionClasses("max-h");
function getGridAutoRows(rowHeight = DEFAULT_WIDGET_AREA_DEFINITION.rowHeight) {
	if ((rowHeight ?? DEFAULT_WIDGET_AREA_DEFINITION.rowHeight) === "auto") return "auto-rows-auto";
	return "";
}
function getGridGap(gap = DEFAULT_WIDGET_AREA_DEFINITION.gap) {
	return GRID_GAP_CLASSES[gap ?? DEFAULT_WIDGET_AREA_DEFINITION.gap] || "";
}
function getGridRowSpanClass(height) {
	return GRID_ROW_SPAN_CLASSES[`span_${height}`] || "";
}
function getGridStyles(area) {
	const gapStyle = getGridGap(area.grid.gap) ? void 0 : area.grid.gap ? `${area.grid.gap}px` : void 0;
	const autoRowsClass = getGridAutoRows(area.grid.rowHeight);
	let autoRowsStyle;
	if (!autoRowsClass && area.grid.rowHeight && typeof area.grid.rowHeight === "number") autoRowsStyle = `${area.grid.rowHeight}px`;
	else autoRowsStyle = void 0;
	const styles = {};
	if (gapStyle) styles.gap = gapStyle;
	if (autoRowsStyle) styles.gridAutoRows = autoRowsStyle;
	return styles;
}
function getMaxHeightClass(height) {
	return MAX_HEIGHT_CLASSES[height] || "";
}
function getMaxWidthClass(width) {
	return MAX_WIDTH_CLASSES[width] || "";
}
function getMinHeightClass(height) {
	return MIN_HEIGHT_CLASSES[height] || "";
}
function getMinWidthClass(width) {
	return MIN_WIDTH_CLASSES[width] || "";
}
function getResponsiveGridColumnSpanClass(column, span) {
	const spanValue = span || 1;
	if (column !== void 0 && span !== void 0) return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[`start_${column}_span_${span}`] || "";
	else if (column !== void 0) return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[`start_${column}_span_1`] || "";
	else {
		const key = `auto_span_${spanValue}`;
		if (RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key]) return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key];
		return `${getMobileSpanClass()} ${getResponsiveColumnSpanClass(spanValue)}`;
	}
}
function getResponsiveGridTemplateColumnsClass(columns) {
	return RESPONSIVE_GRID_COLUMN_CLASSES[columns] || "grid-cols-1 sm:grid-cols-1";
}

//#region src/components/GridWidgetArea.tsx
function GridWidgetArea({ id }) {
	const { area, isVisible, widgets } = useWidgetArea(id);
	if (!isVisible) return null;
	const gridAutoRowsClass = getGridAutoRows(area.grid.rowHeight);
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("grid", getGridGap(area.grid.gap) || "gap-5", getResponsiveGridTemplateColumnsClass(area.grid.columns), gridAutoRowsClass),
		style: getGridStyles(area),
		children: widgets.map((widget) => {
			const Widget = widget.component;
			const columnSpanClass = getResponsiveGridColumnSpanClass(widget.position.location?.column, widget.position.size.width);
			const rowSpanClass = getGridRowSpanClass(widget.position.size.height);
			const minWidthClass = widget.minWidth ? getMinWidthClass(widget.minWidth) : "";
			const minHeightClass = widget.minHeight ? getMinHeightClass(widget.minHeight) : "";
			const maxWidthClass = widget.maxWidth ? getMaxWidthClass(widget.maxWidth) : "";
			const maxHeightClass = widget.maxHeight ? getMaxHeightClass(widget.maxHeight) : "";
			const widgetStyles = {};
			if (widget.minWidth && !minWidthClass) widgetStyles.minWidth = `${widget.minWidth}px`;
			if (widget.minHeight && !minHeightClass) widgetStyles.minHeight = `${widget.minHeight}px`;
			if (widget.maxWidth && !maxWidthClass) widgetStyles.maxWidth = `${widget.maxWidth}px`;
			if (widget.maxHeight && !maxHeightClass) widgetStyles.maxHeight = `${widget.maxHeight}px`;
			return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
				className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("bg-background rounded-md border p-4", columnSpanClass, rowSpanClass, minWidthClass, minHeightClass, maxWidthClass, maxHeightClass),
				style: widgetStyles,
				children: /* @__PURE__ */ jsxRuntimeExports.jsx(Widget, {})
			}, widget.id);
		})
	});
}

//#region src/components/RouteErrorBoundaryFallback.tsx
function RouteErrorBoundaryFallback({ error, resetErrorBoundary }) {
	if (error === void 0 || error === null) {
		console.warn("RouteErrorBoundaryFallback: Received null/undefined error");
		return null;
	}
	let errorMessage;
	let statusCode;
	if (typeof error === "string") errorMessage = error;
	else if (error instanceof Error) errorMessage = error.message;
	else {
		const routerError = error;
		statusCode = routerError.status;
		if (routerError.statusText) errorMessage = routerError.statusText;
		else if (routerError.data?.message) errorMessage = routerError.data.message;
		else if (routerError.message) errorMessage = routerError.message;
		else {
			errorMessage = "An unknown error occurred";
			console.error("RouteErrorBoundaryFallback received an unhandled error format:", error);
		}
	}
	const lowerCaseMessage = errorMessage.toLowerCase();
	const isResolutionError = lowerCaseMessage.includes("component") || lowerCaseMessage.includes("export") || lowerCaseMessage.includes("plugin") || lowerCaseMessage.includes("module");
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "p-4 route-error-boundary",
		"data-testid": "route-error-boundary-fallback",
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			role: "alert",
			children: [
				/* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
					className: "text-lg font-semibold mb-2",
					children: statusCode ? `Error ${statusCode}` : isResolutionError ? "Failed to load resource" : "An error occurred"
				}),
				/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
					className: "text-red-600 mb-4",
					children: errorMessage
				}),
				typeof resetErrorBoundary === "function" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
					"aria-label": "Retry loading",
					className: "px-4 py-2 bg-red-100 rounded hover:bg-red-200 retry-button",
					onClick: resetErrorBoundary,
					children: "Retry"
				})
			]
		})
	});
}

//#region src/components/RouteErrorBoundary.tsx
function RouteErrorBoundary({ children }) {
	let routerError = null;
	let useRouteErrorAttempted = false;
	try {
		useRouteErrorAttempted = true;
		const potentialRouterError = dashboard__loadShare__react_mf_2_router__loadShare__.useRouteError();
		if (potentialRouterError !== null && potentialRouterError !== void 0) routerError = potentialRouterError;
		else console.info("RouteErrorBoundary: useRouteError() succeeded but returned null/undefined. No router error available.");
	} catch (e) {
		console.info("RouteErrorBoundary: useRouteError() failed. Assuming standard Error Boundary usage.");
	}
	if (useRouteErrorAttempted && routerError !== null) return /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundaryFallback, {
		error: routerError,
		resetErrorBoundary: void 0
	});
	if (children) {
		const reactErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
			return /* @__PURE__ */ jsxRuntimeExports.jsx(RouteErrorBoundaryFallback, {
				error,
				resetErrorBoundary
			});
		};
		return /* @__PURE__ */ jsxRuntimeExports.jsx(m, {
			FallbackComponent: reactErrorBoundaryFallback,
			children
		});
	}
	console.warn("RouteErrorBoundary: Rendered without children and no router error available. Rendering null.");
	return null;
}

//#region src/components/RouteLoading.tsx
function RouteLoading() {
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: "flex items-center justify-center p-4",
		role: "alert",
		children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
			className: "animate-pulse",
			children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
				className: "space-y-3 mt-4",
				children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded" }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded" })]
			})]
		})
	});
}

//#region src/testing/MockFrameworkProvider.tsx
function MockFrameworkProvider({ appName, children, framework }) {
	const contextValue = {
		error: null,
		framework,
		getAppName: () => appName,
		getFeature: (id) => {
			console.warn(`MockFrameworkProvider: getFeature(${id}) called. Returning undefined.`);
		},
		getWidgetRegistrations: () => {
			console.warn("MockFrameworkProvider: getWidgetRegistrations() called. Returning empty array.");
			return [];
		},
		isLoading: false,
		reinitialize: () => {
			console.warn("MockFrameworkProvider: reinitialize() called. No action taken.");
		}
	};
	return /* @__PURE__ */ jsxRuntimeExports.jsx(FrameworkContext.Provider, {
		value: contextValue,
		children
	});
}

//#region src/util/domain.ts
function cleanProtocolString(str) {
	return str.replace(/^https?:\/\//, "").replace(/\.+$/, "");
}
function cleanTrailingSlashes(str) {
	return str.replace(/\/+$/, "");
}
function getAccountSubdomain(dashboardSubdomain, options = {}) {
	if (!dashboardSubdomain) return getCurrentLocation().hostname;
	return getProtocolDomain(dashboardSubdomain, options);
}
function getProtocolDomain(proto, { isRootDomain = env.VITE_PORTAL_DOMAIN_IS_ROOT } = {}) {
	const cleanProto = cleanTrailingSlashes(cleanProtocolString(proto));
	const domain = getCurrentLocation().hostname;
	if (!isRootDomain) {
		const parts = domain.split(".");
		return `${cleanProto}.${parts.length > 2 ? parts.slice(-2).join(".") : domain}`;
	}
	return `${cleanProto}.${domain}`;
}

//#region src/util/getSdk.ts
async function getSdk(framework) {
	const sdkCaps = await framework.getCapabilitiesByType("core:sdk");
	if (!sdkCaps?.length) throw new Error("SDK not found");
	return sdkCaps.pop().getSdk();
}

//#region src/util/refineConfig.ts
function syncAuthProviderWithDataProvider(dataProvider, authProvider, options) {
	if (!authProvider) return () => {};
	const currentToken = typeof authProvider.getToken === "function" ? authProvider.getToken() : authProvider.token || authProvider.currentToken || null;
	if (currentToken) {
		dataProvider.setAuthToken(currentToken);
		options?.onTokenChange?.(currentToken);
	}
	if (typeof authProvider.on === "function") return authProvider.on("authCheckSuccess", (params) => {
		dataProvider.setAuthToken(params.token);
		options?.onTokenChange?.(params.token);
	});
	return () => {};
}
function ensureResource(resources = [], resourceName, meta = {}) {
	return resources.some((r) => r.name === resourceName) ? resources : [...resources, {
		meta: {
			dataProviderName: resourceName,
			...meta
		},
		name: resourceName
	}];
}
function getDefaultRefineOptions() {
	return {
		disableTelemetry: true,
		disableRouteChangeHandler: true,
		mutationMode: "pessimistic",
		syncWithLocation: true,
		warnWhenUnsavedChanges: true
	};
}
function mergeRefineConfig(existing = {}, customDataProviders = {}, requiredResources = []) {
	const dataProvider = {
		...normalizeDataProvider(existing.dataProvider),
		...customDataProviders
	};
	let resources = existing.resources || [];
	for (const resource of requiredResources) resources = ensureResource(resources, resource.name, resource.meta);
	return {
		...existing,
		dataProvider,
		options: {
			...getDefaultRefineOptions(),
			...existing.options
		},
		resources
	};
}
function normalizeDataProvider(dataProvider) {
	if (!dataProvider) return {};
	if (typeof dataProvider === "function" || typeof dataProvider === "string") return { default: dataProvider };
	return dataProvider;
}

export { Builder, ErrorDisplay, FlexWidgetArea, Framework, FrameworkProvider, GridWidgetArea, MockFrameworkProvider, PluginManager, RouteErrorBoundary, RouteErrorBoundaryFallback, RouteLoading, __test_clearCache, cleanProtocolString, cleanTrailingSlashes, createNamespacedId, createRemoteComponentLoader, defaultRemoteOptions, ensureResource, env, fetchPortalMeta, getAccountSubdomain, getApiBaseUrl, getCurrentLocation, getDefaultRefineOptions, getPluginMeta, getPortalPluginManifests, getProtocolDomain, getSdk, isNamespacedId, mergeRefineConfig, normalizeDataProvider, normalizeId, parseNamespacedId, resetCurrentLocation, setCurrentLocation, syncAuthProviderWithDataProvider, useCapabilitiesByType, useCapability, useFeature, useFramework, useFrameworkLoading, validateCapability, validateCapabilityDetailed, validateFeature, validateFeatureDetailed, validateNamespacedId, validatePlugin, validatePluginDetailed };
