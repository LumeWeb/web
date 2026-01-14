import { createEnv, z, createRoot } from './index-DRtNAoCS.js';
import { dashboard__loadShare__react__loadShare__, React3 } from './dashboard__loadShare__react__loadShare__-A-_ogCU6.js';
import { createLucideIcon, jsxRuntimeExports } from './createLucideIcon-DMX48tGS.js';
import { federationRuntime } from './virtual_mf-REMOTE_ENTRY_ID-D6NDo0aN.js';
import { getDefaultExportFromCjs } from './_commonjsHelpers-BILit0S-.js';
import { index_cjs } from './dashboard__mf_v__runtimeInit__mf_v__-CrvQyIUV.js';
import { dashboard__loadShare__react_mf_2_dom__loadShare__ } from './dashboard__loadShare__react_mf_2_dom__loadShare__-sIXfFKrj.js';
import './index-C__1Ej_O.js';
import { dashboard__loadShare__react_mf_2_router__loadShare__, dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './dashboard__loadShare__react_mf_2_router__loadShare__-BKb1-sjI.js';
import './virtualExposes-DwA08f_D.js';
import './preload-helper-Dk3k6Zm1.js';

function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
      if (k !== 'default' && !(k in n)) {
        const d = Object.getOwnPropertyDescriptor(e, k);
        if (d) {
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    } }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: 'Module' }));
}

/**
 * @license lucide-react v0.511.0 - ISC
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

//#region src/env.ts
const env = createEnv({
	client: {
		VITE_PORTAL_ALLOW_LOCALHOST: z.boolean().optional(),
		VITE_PORTAL_DOMAIN: z.string().includes(".").optional(),
		VITE_PORTAL_DOMAIN_IS_ROOT: z.boolean().optional()
	},
	clientPrefix: "VITE_",
	emptyStringAsUndefined: true,
	runtimeEnv: window
});

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
	const name = rest.join(":");
	return {
		name,
		namespace
	};
}
function validateNamespacedId(id) {
	if (!id.includes(":") || id.split(":").length !== 2) throw new Error(`Invalid namespaced identifier: ${id}`);
}

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
			return void 0;
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
		if (!this.isPluginEnabled(id)) return void 0;
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
		return void 0;
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
				const error = new PluginLoadError(pluginId, new Error(`Plugin ${pluginId} does not comply with Plugin interface. Missing: ${pluginValidationResult.missingProperties.join(", ")}`));
				failures.set(pluginId, error);
				this.#markPluginFailed(pluginId, error);
				continue;
			}
			const deps = plugin.dependencies ?? [];
			const unreadyDeps = deps.filter((dep) => {
				if (!this.isPluginEnabled(dep.id)) return false;
				const state = this.#pluginStates.get(dep.id);
				return state?.initState !== "initialized";
			});
			if (unreadyDeps.length > 0) {
				const error = new PluginLoadError(pluginId, new Error(`Dependencies not ready: ${unreadyDeps.map((d) => d.id).join(", ")}`));
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
			const cause = error instanceof Error ? error : new Error(String(error));
			const featureError = new FeatureLoadError(id, cause);
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
			const cause = error instanceof Error ? error : new Error(String(error));
			const featureError = new FeatureLoadError(id, cause);
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
				const hasFeature = Array.from(this.#pluginFactories.values()).some((factory) => {
					const plugin$1 = factory();
					return plugin$1.features?.some((f) => f.id === depId);
				});
				if (!hasFeature) throw new Error(`Plugin ${pluginId}: Missing required feature dependency: ${depId}`);
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

//#region src/plugins/context-bridge.tsx
var ContextBridgeStore = class ContextBridgeStore {
	static instance;
	contextMap = /* @__PURE__ */ new Map();
	contextNameMap = /* @__PURE__ */ new Map();
	subscribers = /* @__PURE__ */ new Map();
	values = /* @__PURE__ */ new Map();
	static getInstance() {
		if (!this.instance) this.instance = new ContextBridgeStore();
		return this.instance;
	}
	getContext(id) {
		return this.contextMap.get(id);
	}
	getName(id) {
		return this.contextNameMap.get(id);
	}
	getRegisteredContextIds() {
		return Array.from(this.contextMap.keys());
	}
	getValue(id) {
		return this.values.get(id);
	}
	register(context, name = "") {
		for (const [id$1, existingContext] of this.contextMap) if (existingContext === context) return id$1;
		const id = Symbol();
		this.contextMap.set(id, context);
		this.contextNameMap.set(id, name);
		const defaultValue = context._currentValue;
		if (defaultValue !== void 0) this.values.set(id, defaultValue);
		return id;
	}
	setValue(id, value) {
		this.values.set(id, value);
		this.subscribers.get(id)?.forEach((listener) => listener(value));
	}
	subscribe(id, listener) {
		if (!this.subscribers.has(id)) this.subscribers.set(id, /* @__PURE__ */ new Set());
		const subscribers = this.subscribers.get(id);
		subscribers.add(listener);
		const currentValue = this.values.get(id);
		if (currentValue !== void 0) queueMicrotask(() => {
			if (subscribers.has(listener)) listener(currentValue);
		});
		return () => {
			subscribers.delete(listener);
		};
	}
};
const store = ContextBridgeStore.getInstance();
const DummyContext = dashboard__loadShare__react__loadShare__.createContext(void 0);
function ContextBridgeProvider({ children, contextId, name }) {
	const context = store.getContext(contextId);
	const value = dashboard__loadShare__react__loadShare__.useContext(context || DummyContext);
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (context) store.setValue(contextId, value);
		if (name) console.debug(`Setting up host context ${name} in ContextBridgeProvider`);
	}, [
		context,
		value,
		contextId,
		name
	]);
	return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function HostContextBridge({ children = [] }) {
	const contextIds = store.getRegisteredContextIds();
	return contextIds.reduce((acc, contextId) => /* @__PURE__ */ jsxRuntimeExports.jsx(ContextBridgeProvider, {
		contextId,
		name: store.getName(contextId) || "",
		children: acc
	}), children);
}
function registerBridgedContext(context, name) {
	return store.register(context, name);
}
function RemoteContextBridge({ children, contextId, name = "" }) {
	const context = store.getContext(contextId);
	const [value, setValue] = React3.useState(() => {
		return context ? store.getValue(contextId) : void 0;
	});
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		if (!context) return;
		if (name) console.debug("Setting up remote context %s in RemoteContextBridge", name);
		const initialValue = store.getValue(contextId);
		if (initialValue !== void 0) setValue(initialValue);
		return store.subscribe(contextId, (newValue) => {
			setValue(newValue);
		});
	}, [
		contextId,
		context,
		name
	]);
	if (!context) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
	return /* @__PURE__ */ jsxRuntimeExports.jsx(context.Provider, {
		value,
		children
	});
}
function RemoteContextConsumer({ children, context }) {
	const [value, setValue] = dashboard__loadShare__react__loadShare__.useState(() => {
		const allContexts = store.getRegisteredContextIds();
		for (const id of allContexts) if (store.getContext(id) === context) return store.getValue(id);
		return void 0;
	});
	dashboard__loadShare__react__loadShare__.useEffect(() => {
		const allContexts = store.getRegisteredContextIds();
		for (const id of allContexts) if (store.getContext(id) === context) return store.subscribe(id, setValue);
	}, [context]);
	if (value === void 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
	return /* @__PURE__ */ jsxRuntimeExports.jsx(context.Provider, {
		value,
		children
	});
}

var define_process_env_default$1 = {};
const RouterContext = React3.createContext(null);
const BROWSER_LOG_KEY = "FEDERATION_DEBUG";
const BROWSER_LOG_VALUE = "1";
function isBrowserEnv() {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}
function isBrowserDebug() {
  try {
    if (isBrowserEnv() && window.localStorage) {
      return localStorage.getItem(BROWSER_LOG_KEY) === BROWSER_LOG_VALUE;
    }
  } catch (error) {
    return false;
  }
  return false;
}
function isDebugMode() {
  if (typeof process !== "undefined" && define_process_env_default$1 && define_process_env_default$1["FEDERATION_DEBUG"]) {
    return Boolean(define_process_env_default$1["FEDERATION_DEBUG"]);
  }
  if (typeof FEDERATION_DEBUG !== "undefined" && Boolean(FEDERATION_DEBUG)) {
    return true;
  }
  return isBrowserDebug();
}
let Logger = class Logger2 {
  setPrefix(prefix) {
    this.prefix = prefix;
  }
  log(...args) {
    console.log(this.prefix, ...args);
  }
  warn(...args) {
    console.log(this.prefix, ...args);
  }
  error(...args) {
    console.log(this.prefix, ...args);
  }
  success(...args) {
    console.log(this.prefix, ...args);
  }
  info(...args) {
    console.log(this.prefix, ...args);
  }
  ready(...args) {
    console.log(this.prefix, ...args);
  }
  debug(...args) {
    if (isDebugMode()) {
      console.log(this.prefix, ...args);
    }
  }
  constructor(prefix) {
    this.prefix = prefix;
  }
};
function createLogger(prefix) {
  return new Logger(prefix);
}
function importNodeModule(name) {
  if (!name) {
    throw new Error("import specifier is required");
  }
  const importModule = new Function("name", `return import(name)`);
  return importModule(name).then((res2) => res2).catch((error) => {
    console.error(`Error importing module ${name}:`, error);
    throw error;
  });
}
const loadNodeFetch = async () => {
  const fetchModule = await importNodeModule("node-fetch");
  return fetchModule.default || fetchModule;
};
const lazyLoaderHookFetch = async (input, init, loaderHook2) => {
  const hook = (url2, init2) => {
    return loaderHook2.lifecycle.fetch.emit(url2, init2);
  };
  const res2 = await hook(input, init || {});
  if (!res2 || !(res2 instanceof Response)) {
    const fetchFunction = typeof fetch === "undefined" ? await loadNodeFetch() : fetch;
    return fetchFunction(input, init || {});
  }
  return res2;
};
const createScriptNode = typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url, cb, attrs, loaderHook) => {
  if (loaderHook == null ? void 0 : loaderHook.createScriptHook) {
    const hookResult = loaderHook.createScriptHook(url);
    if (hookResult && typeof hookResult === "object" && "url" in hookResult) {
      url = hookResult.url;
    }
  }
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e) {
    console.error("Error constructing URL:", e);
    cb(new Error(`Invalid URL: ${e}`));
    return;
  }
  const getFetch = async () => {
    if (loaderHook == null ? void 0 : loaderHook.fetch) {
      return (input, init) => lazyLoaderHookFetch(input, init, loaderHook);
    }
    return typeof fetch === "undefined" ? loadNodeFetch() : fetch;
  };
  const handleScriptFetch = async (f, urlObj) => {
    try {
      var _vm_constants;
      const res = await f(urlObj.href);
      const data = await res.text();
      const [path, vm] = await Promise.all([
        importNodeModule("path"),
        importNodeModule("vm")
      ]);
      const scriptContext = {
        exports: {},
        module: {
          exports: {}
        }
      };
      const urlDirname = urlObj.pathname.split("/").slice(0, -1).join("/");
      const filename = path.basename(urlObj.pathname);
      var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
      const script = new vm.Script(`(function(exports, module, require, __dirname, __filename) {${data}
})`, {
        filename,
        importModuleDynamically: (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER = (_vm_constants = vm.constants) == null ? void 0 : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) != null ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER : importNodeModule
      });
      script.runInThisContext()(scriptContext.exports, scriptContext.module, eval("require"), urlDirname, filename);
      const exportedInterface = scriptContext.module.exports || scriptContext.exports;
      if (attrs && exportedInterface && attrs["globalName"]) {
        const container = exportedInterface[attrs["globalName"]] || exportedInterface;
        cb(void 0, container);
        return;
      }
      cb(void 0, exportedInterface);
    } catch (e) {
      cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
    }
  };
  getFetch().then(async (f2) => {
    if ((attrs == null ? void 0 : attrs["type"]) === "esm" || (attrs == null ? void 0 : attrs["type"]) === "module") {
      return loadModule(urlObj.href, {
        fetch: f2,
        vm: await importNodeModule("vm")
      }).then(async (module) => {
        await module.evaluate();
        cb(void 0, module.namespace);
      }).catch((e) => {
        cb(e instanceof Error ? e : new Error(`Script execution error: ${e}`));
      });
    }
    handleScriptFetch(f2, urlObj);
  }).catch((err) => {
    cb(err);
  });
} : (url2, cb2, attrs2, loaderHook2) => {
  cb2(new Error("createScriptNode is disabled in non-Node.js environment"));
};
typeof ENV_TARGET === "undefined" || ENV_TARGET !== "web" ? (url2, info) => {
  return new Promise((resolve, reject) => {
    createScriptNode(url2, (error, scriptContext2) => {
      if (error) {
        reject(error);
      } else {
        var _info_attrs, _info_attrs1;
        const remoteEntryKey = (info == null ? void 0 : (_info_attrs = info.attrs) == null ? void 0 : _info_attrs["globalName"]) || `__FEDERATION_${info == null ? void 0 : (_info_attrs1 = info.attrs) == null ? void 0 : _info_attrs1["name"]}:custom__`;
        const entryExports = globalThis[remoteEntryKey] = scriptContext2;
        resolve(entryExports);
      }
    }, info.attrs, info.loaderHook);
  });
} : (url2, info) => {
  throw new Error("loadScriptNode is disabled in non-Node.js environment");
};
async function loadModule(url2, options) {
  const { fetch: fetch1, vm: vm2 } = options;
  const response = await fetch1(url2);
  const code = await response.text();
  const module = new vm2.SourceTextModule(code, {
    // @ts-ignore
    importModuleDynamically: async (specifier, script2) => {
      const resolvedUrl = new URL(specifier, url2).href;
      return loadModule(resolvedUrl, options);
    }
  });
  await module.link(async (specifier) => {
    const resolvedUrl = new URL(specifier, url2).href;
    const module2 = await loadModule(resolvedUrl, options);
    return module2;
  });
  return module;
}
const LoggerInstance = createLogger(
  "[ Module Federation Bridge React ]"
);
function pathJoin(...args) {
  const res2 = args.reduce((res22, path2) => {
    let nPath = path2;
    if (!nPath || typeof nPath !== "string") {
      return res22;
    }
    if (nPath[0] !== "/") {
      nPath = `/${nPath}`;
    }
    const lastIndex = nPath.length - 1;
    if (nPath[lastIndex] === "/") {
      nPath = nPath.substring(0, lastIndex);
    }
    return res22 + nPath;
  }, "");
  return res2 || "/";
}
const getModuleName = (id) => {
  if (!id) {
    return id;
  }
  const idArray = id.split("/");
  if (idArray.length < 2) {
    return id;
  }
  return idArray[0] + "/" + idArray[1];
};
const getRootDomDefaultClassName = (moduleName) => {
  if (!moduleName) {
    return "";
  }
  const name = getModuleName(moduleName).replace(/\@/, "").replace(/\//, "-");
  return `bridge-root-component-${name}`;
};

const ErrorBoundaryContext$1 = dashboard__loadShare__react__loadShare__.createContext(null);
const initialState$1 = {
  didCatch: false,
  error: null
};
let ErrorBoundary$1 = class ErrorBoundary extends dashboard__loadShare__react__loadShare__.Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState$1;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      var _this$props$onReset, _this$props;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_this$props$onReset = (_this$props = this.props).onReset) === null || _this$props$onReset === void 0 ? void 0 : _this$props$onReset.call(_this$props, {
        args,
        reason: "imperative-api"
      });
      this.setState(initialState$1);
    }
  }
  componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props2, error, info);
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;
    if (didCatch && prevState.error !== null && hasArrayChanged$1(prevProps.resetKeys, resetKeys)) {
      var _this$props$onReset2, _this$props3;
      (_this$props$onReset2 = (_this$props3 = this.props).onReset) === null || _this$props$onReset2 === void 0 ? void 0 : _this$props$onReset2.call(_this$props3, {
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys"
      });
      this.setState(initialState$1);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let childToRender = children;
    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = dashboard__loadShare__react__loadShare__.createElement(FallbackComponent, props);
      } else if (fallback !== void 0) {
        childToRender = fallback;
      } else {
        throw error;
      }
    }
    return dashboard__loadShare__react__loadShare__.createElement(ErrorBoundaryContext$1.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, childToRender);
  }
};
function hasArrayChanged$1() {
  let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}
function createBaseBridgeComponent({
  createRoot,
  defaultRootOptions,
  ...bridgeInfo
}) {
  return () => {
    const rootMap = /* @__PURE__ */ new Map();
    const instance = federationRuntime.instance;
    LoggerInstance.debug(
      `createBridgeComponent instance from props >>>`,
      instance
    );
    const RawComponent = (info) => {
      const { appInfo, propsInfo, ...restProps } = info;
      const { moduleName, memoryRoute, basename = "/" } = appInfo;
      return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RouterContext.Provider, { value: { moduleName, basename, memoryRoute } }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
        bridgeInfo.rootComponent,
        {
          ...propsInfo,
          basename,
          ...restProps
        }
      ));
    };
    return {
      async render(info) {
        var _a, _b, _c, _d, _e, _f;
        LoggerInstance.debug(`createBridgeComponent render Info`, info);
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          fallback,
          rootOptions,
          ...propsInfo
        } = info;
        const mergedRootOptions = {
          ...defaultRootOptions,
          ...rootOptions
        };
        const beforeBridgeRenderRes = ((_c = (_b = (_a = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _a.lifecycle) == null ? void 0 : _b.beforeBridgeRender) == null ? void 0 : _c.emit(info)) || {};
        const rootComponentWithErrorBoundary = /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
          ErrorBoundary$1,
          {
            FallbackComponent: fallback
          },
          /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
            RawComponent,
            {
              appInfo: {
                moduleName,
                basename,
                memoryRoute
              },
              propsInfo: {
                ...propsInfo,
                ...beforeBridgeRenderRes == null ? void 0 : beforeBridgeRenderRes.extraProps
              }
            }
          )
        );
        if (bridgeInfo.render) {
          await Promise.resolve(
            bridgeInfo.render(rootComponentWithErrorBoundary, dom)
          ).then((root) => rootMap.set(dom, root));
        } else {
          let root = rootMap.get(dom);
          if (!root && createRoot) {
            root = createRoot(dom, mergedRootOptions);
            rootMap.set(dom, root);
          }
          if (root && "render" in root) {
            root.render(rootComponentWithErrorBoundary);
          }
        }
        ((_f = (_e = (_d = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _d.lifecycle) == null ? void 0 : _e.afterBridgeRender) == null ? void 0 : _f.emit(info)) || {};
      },
      destroy(info) {
        var _a, _b, _c;
        const { dom } = info;
        LoggerInstance.debug(`createBridgeComponent destroy Info`, info);
        const root = rootMap.get(dom);
        if (root) {
          if ("unmount" in root) {
            root.unmount();
          } else {
            console.warn("Root does not have unmount method");
          }
          rootMap.delete(dom);
        }
        (_c = (_b = (_a = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _a.lifecycle) == null ? void 0 : _b.afterBridgeDestroy) == null ? void 0 : _c.emit(info);
      }
    };
  };
}

function createReact18Root(container, options) {
  return createRoot(container, options);
}
function createBridgeComponent$1(bridgeInfo) {
  const fullBridgeInfo = {
    createRoot: createReact18Root,
    ...bridgeInfo
  };
  return createBaseBridgeComponent(fullBridgeInfo);
}

const ErrorBoundaryContext = dashboard__loadShare__react__loadShare__.createContext(null);

const initialState = {
  didCatch: false,
  error: null
};
class ErrorBoundary extends dashboard__loadShare__react__loadShare__.Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      var _this$props$onReset, _this$props;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_this$props$onReset = (_this$props = this.props).onReset) === null || _this$props$onReset === void 0 ? void 0 : _this$props$onReset.call(_this$props, {
        args,
        reason: "imperative-api"
      });
      this.setState(initialState);
    }
  }
  componentDidCatch(error, info) {
    var _this$props$onError, _this$props2;
    (_this$props$onError = (_this$props2 = this.props).onError) === null || _this$props$onError === void 0 ? void 0 : _this$props$onError.call(_this$props2, error, info);
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;

    // There's an edge case where if the thing that triggered the error happens to *also* be in the resetKeys array,
    // we'd end up resetting the error boundary immediately.
    // This would likely trigger a second error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call of cDU after the error is set.

    if (didCatch && prevState.error !== null && hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      var _this$props$onReset2, _this$props3;
      (_this$props$onReset2 = (_this$props3 = this.props).onReset) === null || _this$props$onReset2 === void 0 ? void 0 : _this$props$onReset2.call(_this$props3, {
        next: resetKeys,
        prev: prevProps.resetKeys,
        reason: "keys"
      });
      this.setState(initialState);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let childToRender = children;
    if (didCatch) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof fallbackRender === "function") {
        childToRender = fallbackRender(props);
      } else if (FallbackComponent) {
        childToRender = dashboard__loadShare__react__loadShare__.createElement(FallbackComponent, props);
      } else if (fallback !== undefined) {
        childToRender = fallback;
      } else {
        {
          console.error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop");
        }
        throw error;
      }
    }
    return dashboard__loadShare__react__loadShare__.createElement(ErrorBoundaryContext.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, childToRender);
  }
}
function hasArrayChanged() {
  let a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  return a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));
}

//#region src/plugins/remoteComponentLoader.tsx
function createRemoteComponentLoader(config, framework, options) {
	const { componentPath, pluginId, strategy = "no-bridge" } = config;
	const LoadingElement = /* @__PURE__ */ jsxRuntimeExports.jsx(options.LoadingComponent, {});
	const ErrorFallback = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(options.ErrorComponent, { ...props });
	const loadRemoteModule = async () => {
		const modulePath = await framework.resolvePluginModule(pluginId, componentPath);
		return framework._loadRemote(modulePath);
	};
	if (strategy === "bridge") return async () => {
		const module = await loadRemoteModule();
		const Component = module.default || module;
		if (typeof Component !== "function" && typeof Component !== "object") throw new Error(`Remote module ${pluginId}:${componentPath} did not export a valid React component.`);
		const bridgeFactory = createBridgeComponent(Component);
		return bridgeFactory();
	};
	else return createRemoteComponent$1({
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
const DefaultErrorComponent$1 = ({ error, resetErrorBoundary }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
	/* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Error loading component" }),
	/* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: error.message }),
	/* @__PURE__ */ jsxRuntimeExports.jsx("button", {
		onClick: resetErrorBoundary,
		children: "Retry"
	})
] });
const DefaultLoadingComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
const defaultRemoteOptions = {
	ErrorComponent: DefaultErrorComponent$1,
	LoadingComponent: DefaultLoadingComponent
};
function createBridgeComponent(Component) {
	const WrappedComponent = dashboard__loadShare__react__loadShare__.forwardRef((props, ref) => {
		return store.getRegisteredContextIds().reduce((children, contextId) => /* @__PURE__ */ jsxRuntimeExports.jsx(RemoteContextBridge, {
			contextId,
			children
		}), /* @__PURE__ */ jsxRuntimeExports.jsx(Component, {
			...props,
			ref
		}));
	});
	WrappedComponent.displayName = `Bridge(${(Component.displayName ?? Component.name) || "Component"})`;
	const bridge = createBridgeComponent$1({ rootComponent: WrappedComponent });
	return () => bridge();
}
function createRemoteComponent$1(info) {
	const LazyComponent = createLazyRemoteComponent$1(info);
	return dashboard__loadShare__react__loadShare__.forwardRef((props, ref) => {
		const { props: componentProps } = props;
		return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, {
			FallbackComponent: info.fallback,
			children: /* @__PURE__ */ jsxRuntimeExports.jsx(React3.Suspense, {
				fallback: info.loading,
				children: componentProps !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, { ...componentProps }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LazyComponent, {})
			})
		});
	});
}
function createLazyRemoteComponent$1(info) {
	const exportName = info?.export || "default";
	return React3.lazy(async () => {
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
  const baseUrl = `${finalProtocol}//${urlObject.hostname}${port ? ":" + port : ""}`.replace(/\/$/, "");
  return baseUrl.replace(/\/$/, "");
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

(function (module, exports) {

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

	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods; 
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

(function (exports) {

	var runtime = index_cjs;



	Object.prototype.hasOwnProperty.call(runtime, '__proto__') &&
		!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
		Object.defineProperty(exports, '__proto__', {
			enumerable: true,
			value: runtime['__proto__']
		});

	Object.keys(runtime).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = runtime[k];
	}); 
} (runtime_cjs));

(function (exports) {
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
	var __exportStar = (runtime && runtime.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(runtime_cjs, exports);
	
} (runtime));

// src/utils.ts
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
var TYPE_PREVIOUS_RESOLVED = "Z";
var Deferred$1 = class Deferred {
  promise;
  resolve;
  reject;
  constructor() {
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

// src/unflatten.ts
var globalObj = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : void 0;
function unflatten(parsed) {
  const { hydrated, values } = this;
  if (typeof parsed === "number")
    return hydrate.call(this, parsed);
  if (!Array.isArray(parsed) || !parsed.length)
    throw new SyntaxError();
  const startIndex = values.length;
  for (const value of parsed) {
    values.push(value);
  }
  hydrated.length = values.length;
  return hydrate.call(this, startIndex);
}
function hydrate(index) {
  const { hydrated, values, deferred, plugins } = this;
  let result;
  const stack = [
    [
      index,
      (v) => {
        result = v;
      }
    ]
  ];
  let postRun = [];
  while (stack.length > 0) {
    const [index2, set] = stack.pop();
    switch (index2) {
      case UNDEFINED:
        set(void 0);
        continue;
      case NULL:
        set(null);
        continue;
      case NAN:
        set(NaN);
        continue;
      case POSITIVE_INFINITY:
        set(Infinity);
        continue;
      case NEGATIVE_INFINITY:
        set(-Infinity);
        continue;
      case NEGATIVE_ZERO:
        set(-0);
        continue;
    }
    if (hydrated[index2]) {
      set(hydrated[index2]);
      continue;
    }
    const value = values[index2];
    if (!value || typeof value !== "object") {
      hydrated[index2] = value;
      set(value);
      continue;
    }
    if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const [type, b, c] = value;
        switch (type) {
          case TYPE_DATE:
            set(hydrated[index2] = new Date(b));
            continue;
          case TYPE_URL:
            set(hydrated[index2] = new URL(b));
            continue;
          case TYPE_BIGINT:
            set(hydrated[index2] = BigInt(b));
            continue;
          case TYPE_REGEXP:
            set(hydrated[index2] = new RegExp(b, c));
            continue;
          case TYPE_SYMBOL:
            set(hydrated[index2] = Symbol.for(b));
            continue;
          case TYPE_SET:
            const newSet = /* @__PURE__ */ new Set();
            hydrated[index2] = newSet;
            for (let i = 1; i < value.length; i++)
              stack.push([
                value[i],
                (v) => {
                  newSet.add(v);
                }
              ]);
            set(newSet);
            continue;
          case TYPE_MAP:
            const map = /* @__PURE__ */ new Map();
            hydrated[index2] = map;
            for (let i = 1; i < value.length; i += 2) {
              const r = [];
              stack.push([
                value[i + 1],
                (v) => {
                  r[1] = v;
                }
              ]);
              stack.push([
                value[i],
                (k) => {
                  r[0] = k;
                }
              ]);
              postRun.push(() => {
                map.set(r[0], r[1]);
              });
            }
            set(map);
            continue;
          case TYPE_NULL_OBJECT:
            const obj = /* @__PURE__ */ Object.create(null);
            hydrated[index2] = obj;
            for (const key of Object.keys(b).reverse()) {
              const r = [];
              stack.push([
                b[key],
                (v) => {
                  r[1] = v;
                }
              ]);
              stack.push([
                Number(key.slice(1)),
                (k) => {
                  r[0] = k;
                }
              ]);
              postRun.push(() => {
                obj[r[0]] = r[1];
              });
            }
            set(obj);
            continue;
          case TYPE_PROMISE:
            if (hydrated[b]) {
              set(hydrated[index2] = hydrated[b]);
            } else {
              const d = new Deferred$1();
              deferred[b] = d;
              set(hydrated[index2] = d.promise);
            }
            continue;
          case TYPE_ERROR:
            const [, message, errorType] = value;
            let error = errorType && globalObj && globalObj[errorType] ? new globalObj[errorType](message) : new Error(message);
            hydrated[index2] = error;
            set(error);
            continue;
          case TYPE_PREVIOUS_RESOLVED:
            set(hydrated[index2] = hydrated[b]);
            continue;
          default:
            if (Array.isArray(plugins)) {
              const r = [];
              const vals = value.slice(1);
              for (let i = 0; i < vals.length; i++) {
                const v = vals[i];
                stack.push([
                  v,
                  (v2) => {
                    r[i] = v2;
                  }
                ]);
              }
              postRun.push(() => {
                for (const plugin of plugins) {
                  const result2 = plugin(value[0], ...r);
                  if (result2) {
                    set(hydrated[index2] = result2.value);
                    return;
                  }
                }
                throw new SyntaxError();
              });
              continue;
            }
            throw new SyntaxError();
        }
      } else {
        const array = [];
        hydrated[index2] = array;
        for (let i = 0; i < value.length; i++) {
          const n = value[i];
          if (n !== HOLE) {
            stack.push([
              n,
              (v) => {
                array[i] = v;
              }
            ]);
          }
        }
        set(array);
        continue;
      }
    } else {
      const object = {};
      hydrated[index2] = object;
      for (const key of Object.keys(value).reverse()) {
        const r = [];
        stack.push([
          value[key],
          (v) => {
            r[1] = v;
          }
        ]);
        stack.push([
          Number(key.slice(1)),
          (k) => {
            r[0] = k;
          }
        ]);
        postRun.push(() => {
          object[r[0]] = r[1];
        });
      }
      set(object);
      continue;
    }
  }
  while (postRun.length > 0) {
    postRun.pop()();
  }
  return result;
}

// src/turbo-stream.ts
async function decode(readable, options) {
  const { plugins } = options ?? {};
  const done = new Deferred$1();
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
 * react-router v7.5.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var PopStateEventType = "popstate";
function createBrowserHistory(options = {}) {
  function createBrowserLocation(window2, globalHistory) {
    let { pathname, search, hash } = window2.location;
    return createLocation(
      "",
      { pathname, search, hash },
      // state defaults to `null` because `window.history.state` does
      globalHistory.state && globalHistory.state.usr || null,
      globalHistory.state && globalHistory.state.key || "default"
    );
  }
  function createBrowserHref(window2, to) {
    return typeof to === "string" ? to : createPath(to);
  }
  return getUrlBasedHistory(
    createBrowserLocation,
    createBrowserHref,
    null,
    options
  );
}
function invariant(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
function warning(cond, message) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message);
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
}
function createKey() {
  return Math.random().toString(36).substring(2, 10);
}
function getHistoryState(location, index) {
  return {
    usr: location.state,
    key: location.key,
    idx: index
  };
}
function createLocation(current, to, state = null, key) {
  let location = {
    pathname: typeof current === "string" ? current : current.pathname,
    search: "",
    hash: "",
    ...typeof to === "string" ? parsePath(to) : to,
    state,
    // TODO: This could be cleaned up.  push/replace should probably just take
    // full Locations now and avoid the need to run through this flow at all
    // But that's a pretty big refactor to the current test suite so going to
    // keep as is for the time being and just let any incoming keys take precedence
    key: to && to.key || key || createKey()
  };
  return location;
}
function createPath({
  pathname = "/",
  search = "",
  hash = ""
}) {
  if (search && search !== "?")
    pathname += search.charAt(0) === "?" ? search : "?" + search;
  if (hash && hash !== "#")
    pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
  return pathname;
}
function parsePath(path) {
  let parsedPath = {};
  if (path) {
    let hashIndex = path.indexOf("#");
    if (hashIndex >= 0) {
      parsedPath.hash = path.substring(hashIndex);
      path = path.substring(0, hashIndex);
    }
    let searchIndex = path.indexOf("?");
    if (searchIndex >= 0) {
      parsedPath.search = path.substring(searchIndex);
      path = path.substring(0, searchIndex);
    }
    if (path) {
      parsedPath.pathname = path;
    }
  }
  return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref2, validateLocation, options = {}) {
  let { window: window2 = document.defaultView, v5Compat = false } = options;
  let globalHistory = window2.history;
  let action = "POP";
  let listener = null;
  let index = getIndex();
  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "");
  }
  function getIndex() {
    let state = globalHistory.state || { idx: null };
    return state.idx;
  }
  function handlePop() {
    action = "POP";
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({ action, location: history.location, delta });
    }
  }
  function push(to, state) {
    action = "PUSH";
    let location = createLocation(history.location, to, state);
    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window2.location.assign(url);
    }
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }
  }
  function replace2(to, state) {
    action = "REPLACE";
    let location = createLocation(history.location, to, state);
    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);
    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }
  function createURL(to) {
    let base = window2.location.origin !== "null" ? window2.location.origin : window2.location.href;
    let href2 = typeof to === "string" ? to : createPath(to);
    href2 = href2.replace(/ $/, "%20");
    invariant(
      base,
      `No window.location.(origin|href) available to create URL for href: ${href2}`
    );
    return new URL(href2, base);
  }
  let history = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window2, globalHistory);
    },
    listen(fn) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window2.addEventListener(PopStateEventType, handlePop);
      listener = fn;
      return () => {
        window2.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref2(window2, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash
      };
    },
    push,
    replace: replace2,
    go(n) {
      return globalHistory.go(n);
    }
  };
  return history;
}
var _map;
var unstable_RouterContextProvider = class {
  constructor(init) {
    __privateAdd(this, _map, /* @__PURE__ */ new Map());
    if (init) {
      for (let [context, value] of init) {
        this.set(context, value);
      }
    }
  }
  get(context) {
    if (__privateGet(this, _map).has(context)) {
      return __privateGet(this, _map).get(context);
    }
    if (context.defaultValue !== void 0) {
      return context.defaultValue;
    }
    throw new Error("No value found for context");
  }
  set(context, value) {
    __privateGet(this, _map).set(context, value);
  }
};
_map = /* @__PURE__ */ new WeakMap();
var unsupportedLazyRouteObjectKeys = /* @__PURE__ */ new Set([
  "lazy",
  "caseSensitive",
  "path",
  "id",
  "index",
  "children"
]);
function isUnsupportedLazyRouteObjectKey(key) {
  return unsupportedLazyRouteObjectKeys.has(
    key
  );
}
var unsupportedLazyRouteFunctionKeys = /* @__PURE__ */ new Set([
  "lazy",
  "caseSensitive",
  "path",
  "id",
  "index",
  "unstable_middleware",
  "children"
]);
function isUnsupportedLazyRouteFunctionKey(key) {
  return unsupportedLazyRouteFunctionKeys.has(
    key
  );
}
function isIndexRoute(route) {
  return route.index === true;
}
function convertRoutesToDataRoutes(routes, mapRouteProperties2, parentPath = [], manifest = {}) {
  return routes.map((route, index) => {
    let treePath = [...parentPath, String(index)];
    let id = typeof route.id === "string" ? route.id : treePath.join("-");
    invariant(
      route.index !== true || !route.children,
      `Cannot specify children on an index route`
    );
    invariant(
      !manifest[id],
      `Found a route id collision on id "${id}".  Route id's must be globally unique within Data Router usages`
    );
    if (isIndexRoute(route)) {
      let indexRoute = {
        ...route,
        ...mapRouteProperties2(route),
        id
      };
      manifest[id] = indexRoute;
      return indexRoute;
    } else {
      let pathOrLayoutRoute = {
        ...route,
        ...mapRouteProperties2(route),
        id,
        children: void 0
      };
      manifest[id] = pathOrLayoutRoute;
      if (route.children) {
        pathOrLayoutRoute.children = convertRoutesToDataRoutes(
          route.children,
          mapRouteProperties2,
          treePath,
          manifest
        );
      }
      return pathOrLayoutRoute;
    }
  });
}
function matchRoutes(routes, locationArg, basename = "/") {
  return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial) {
  let location = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
  let pathname = stripBasename(location.pathname || "/", basename);
  if (pathname == null) {
    return null;
  }
  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);
  let matches = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    let decoded = decodePath(pathname);
    matches = matchRouteBranch(
      branches[i],
      decoded,
      allowPartial
    );
  }
  return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
  let { route, pathname, params } = match;
  return {
    id: route.id,
    pathname,
    params,
    data: loaderData[route.id],
    handle: route.handle
  };
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "") {
  let flattenRoute = (route, index, relativePath) => {
    let meta = {
      relativePath: relativePath === void 0 ? route.path || "" : relativePath,
      caseSensitive: route.caseSensitive === true,
      childrenIndex: index,
      route
    };
    if (meta.relativePath.startsWith("/")) {
      invariant(
        meta.relativePath.startsWith(parentPath),
        `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
      );
      meta.relativePath = meta.relativePath.slice(parentPath.length);
    }
    let path = joinPaths([parentPath, meta.relativePath]);
    let routesMeta = parentsMeta.concat(meta);
    if (route.children && route.children.length > 0) {
      invariant(
        // Our types know better, but runtime JS may not!
        // @ts-expect-error
        route.index !== true,
        `Index routes must not have child routes. Please remove all child routes from route path "${path}".`
      );
      flattenRoutes(route.children, branches, routesMeta, path);
    }
    if (route.path == null && !route.index) {
      return;
    }
    branches.push({
      path,
      score: computeScore(path, route.index),
      routesMeta
    });
  };
  routes.forEach((route, index) => {
    if (route.path === "" || !route.path?.includes("?")) {
      flattenRoute(route, index);
    } else {
      for (let exploded of explodeOptionalSegments(route.path)) {
        flattenRoute(route, index, exploded);
      }
    }
  });
  return branches;
}
function explodeOptionalSegments(path) {
  let segments = path.split("/");
  if (segments.length === 0) return [];
  let [first, ...rest] = segments;
  let isOptional = first.endsWith("?");
  let required = first.replace(/\?$/, "");
  if (rest.length === 0) {
    return isOptional ? [required, ""] : [required];
  }
  let restExploded = explodeOptionalSegments(rest.join("/"));
  let result = [];
  result.push(
    ...restExploded.map(
      (subpath) => subpath === "" ? required : [required, subpath].join("/")
    )
  );
  if (isOptional) {
    result.push(...restExploded);
  }
  return result.map(
    (exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded
  );
}
function rankRouteBranches(branches) {
  branches.sort(
    (a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(
      a.routesMeta.map((meta) => meta.childrenIndex),
      b.routesMeta.map((meta) => meta.childrenIndex)
    )
  );
}
var paramRe = /^:[\w-]+$/;
var dynamicSegmentValue = 3;
var indexRouteValue = 2;
var emptySegmentValue = 1;
var staticSegmentValue = 10;
var splatPenalty = -2;
var isSplat = (s) => s === "*";
function computeScore(path, index) {
  let segments = path.split("/");
  let initialScore = segments.length;
  if (segments.some(isSplat)) {
    initialScore += splatPenalty;
  }
  if (index) {
    initialScore += indexRouteValue;
  }
  return segments.filter((s) => !isSplat(s)).reduce(
    (score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue),
    initialScore
  );
}
function compareIndexes(a, b) {
  let siblings = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);
  return siblings ? (
    // If two routes are siblings, we should try to match the earlier sibling
    // first. This allows people to have fine-grained control over the matching
    // behavior by simply putting routes with identical paths in the order they
    // want them tried.
    a[a.length - 1] - b[b.length - 1]
  ) : (
    // Otherwise, it doesn't really make sense to rank non-siblings by index,
    // so they sort equally.
    0
  );
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
  let { routesMeta } = branch;
  let matchedParams = {};
  let matchedPathname = "/";
  let matches = [];
  for (let i = 0; i < routesMeta.length; ++i) {
    let meta = routesMeta[i];
    let end = i === routesMeta.length - 1;
    let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
    let match = matchPath(
      { path: meta.relativePath, caseSensitive: meta.caseSensitive, end },
      remainingPathname
    );
    let route = meta.route;
    if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) {
      match = matchPath(
        {
          path: meta.relativePath,
          caseSensitive: meta.caseSensitive,
          end: false
        },
        remainingPathname
      );
    }
    if (!match) {
      return null;
    }
    Object.assign(matchedParams, match.params);
    matches.push({
      // TODO: Can this as be avoided?
      params: matchedParams,
      pathname: joinPaths([matchedPathname, match.pathname]),
      pathnameBase: normalizePathname(
        joinPaths([matchedPathname, match.pathnameBase])
      ),
      route
    });
    if (match.pathnameBase !== "/") {
      matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
    }
  }
  return matches;
}
function matchPath(pattern, pathname) {
  if (typeof pattern === "string") {
    pattern = { path: pattern, caseSensitive: false, end: true };
  }
  let [matcher, compiledParams] = compilePath(
    pattern.path,
    pattern.caseSensitive,
    pattern.end
  );
  let match = pathname.match(matcher);
  if (!match) return null;
  let matchedPathname = match[0];
  let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
  let captureGroups = match.slice(1);
  let params = compiledParams.reduce(
    (memo2, { paramName, isOptional }, index) => {
      if (paramName === "*") {
        let splatValue = captureGroups[index] || "";
        pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
      }
      const value = captureGroups[index];
      if (isOptional && !value) {
        memo2[paramName] = void 0;
      } else {
        memo2[paramName] = (value || "").replace(/%2F/g, "/");
      }
      return memo2;
    },
    {}
  );
  return {
    params,
    pathname: matchedPathname,
    pathnameBase,
    pattern
  };
}
function compilePath(path, caseSensitive = false, end = true) {
  warning(
    path === "*" || !path.endsWith("*") || path.endsWith("/*"),
    `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`
  );
  let params = [];
  let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(
    /\/:([\w-]+)(\?)?/g,
    (_, paramName, isOptional) => {
      params.push({ paramName, isOptional: isOptional != null });
      return isOptional ? "/?([^\\/]+)?" : "/([^\\/]+)";
    }
  );
  if (path.endsWith("*")) {
    params.push({ paramName: "*" });
    regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
  } else if (end) {
    regexpSource += "\\/*$";
  } else if (path !== "" && path !== "/") {
    regexpSource += "(?:(?=\\/|$))";
  } else ;
  let matcher = new RegExp(regexpSource, caseSensitive ? void 0 : "i");
  return [matcher, params];
}
function decodePath(value) {
  try {
    return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
  } catch (error) {
    warning(
      false,
      `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`
    );
    return value;
  }
}
function stripBasename(pathname, basename) {
  if (basename === "/") return pathname;
  if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) {
    return null;
  }
  let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
  let nextChar = pathname.charAt(startIndex);
  if (nextChar && nextChar !== "/") {
    return null;
  }
  return pathname.slice(startIndex) || "/";
}
function resolvePath(to, fromPathname = "/") {
  let {
    pathname: toPathname,
    search = "",
    hash = ""
  } = typeof to === "string" ? parsePath(to) : to;
  let pathname = toPathname ? toPathname.startsWith("/") ? toPathname : resolvePathname(toPathname, fromPathname) : fromPathname;
  return {
    pathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash)
  };
}
function resolvePathname(relativePath, fromPathname) {
  let segments = fromPathname.replace(/\/+$/, "").split("/");
  let relativeSegments = relativePath.split("/");
  relativeSegments.forEach((segment) => {
    if (segment === "..") {
      if (segments.length > 1) segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });
  return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
  return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(
    path
  )}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
  return matches.filter(
    (match, index) => index === 0 || match.route.path && match.route.path.length > 0
  );
}
function getResolveToMatches(matches) {
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches.map(
    (match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase
  );
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
  let to;
  if (typeof toArg === "string") {
    to = parsePath(toArg);
  } else {
    to = { ...toArg };
    invariant(
      !to.pathname || !to.pathname.includes("?"),
      getInvalidPathError("?", "pathname", "search", to)
    );
    invariant(
      !to.pathname || !to.pathname.includes("#"),
      getInvalidPathError("#", "pathname", "hash", to)
    );
    invariant(
      !to.search || !to.search.includes("#"),
      getInvalidPathError("#", "search", "hash", to)
    );
  }
  let isEmptyPath = toArg === "" || to.pathname === "";
  let toPathname = isEmptyPath ? "/" : to.pathname;
  let from;
  if (toPathname == null) {
    from = locationPathname;
  } else {
    let routePathnameIndex = routePathnames.length - 1;
    if (!isPathRelative && toPathname.startsWith("..")) {
      let toSegments = toPathname.split("/");
      while (toSegments[0] === "..") {
        toSegments.shift();
        routePathnameIndex -= 1;
      }
      to.pathname = toSegments.join("/");
    }
    from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
  }
  let path = resolvePath(to, from);
  let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
  let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
  if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) {
    path.pathname += "/";
  }
  return path;
}
var joinPaths = (paths) => paths.join("/").replace(/\/\/+/g, "/");
var normalizePathname = (pathname) => pathname.replace(/\/+$/, "").replace(/^\/*/, "/");
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
var DataWithResponseInit = class {
  constructor(data2, init) {
    this.type = "DataWithResponseInit";
    this.data = data2;
    this.init = init || null;
  }
};
function data(data2, init) {
  return new DataWithResponseInit(
    data2,
    typeof init === "number" ? { status: init } : init
  );
}
var redirect = (url, init = 302) => {
  let responseInit = init;
  if (typeof responseInit === "number") {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === "undefined") {
    responseInit.status = 302;
  }
  let headers = new Headers(responseInit.headers);
  headers.set("Location", url);
  return new Response(null, { ...responseInit, headers });
};
var ErrorResponseImpl = class {
  constructor(status, statusText, data2, internal = false) {
    this.status = status;
    this.statusText = statusText || "";
    this.internal = internal;
    if (data2 instanceof Error) {
      this.data = data2.toString();
      this.error = data2;
    } else {
      this.data = data2;
    }
  }
};
function isRouteErrorResponse(error) {
  return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
var validMutationMethodsArr = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE"
];
var validMutationMethods = new Set(
  validMutationMethodsArr
);
var validRequestMethodsArr = [
  "GET",
  ...validMutationMethodsArr
];
var validRequestMethods = new Set(validRequestMethodsArr);
var redirectStatusCodes = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
var redirectPreserveMethodStatusCodes = /* @__PURE__ */ new Set([307, 308]);
var IDLE_NAVIGATION = {
  state: "idle",
  location: void 0,
  formMethod: void 0,
  formAction: void 0,
  formEncType: void 0,
  formData: void 0,
  json: void 0,
  text: void 0
};
var IDLE_FETCHER = {
  state: "idle",
  data: void 0,
  formMethod: void 0,
  formAction: void 0,
  formEncType: void 0,
  formData: void 0,
  json: void 0,
  text: void 0
};
var IDLE_BLOCKER = {
  state: "unblocked",
  proceed: void 0,
  reset: void 0,
  location: void 0
};
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var defaultMapRouteProperties = (route) => ({
  hasErrorBoundary: Boolean(route.hasErrorBoundary)
});
var TRANSITIONS_STORAGE_KEY = "remix-router-transitions";
var ResetLoaderDataSymbol = Symbol("ResetLoaderData");
function createRouter(init) {
  const routerWindow = init.window ? init.window : typeof window !== "undefined" ? window : void 0;
  const isBrowser2 = typeof routerWindow !== "undefined" && typeof routerWindow.document !== "undefined" && typeof routerWindow.document.createElement !== "undefined";
  invariant(
    init.routes.length > 0,
    "You must provide a non-empty routes array to createRouter"
  );
  let mapRouteProperties2 = init.mapRouteProperties || defaultMapRouteProperties;
  let manifest = {};
  let dataRoutes = convertRoutesToDataRoutes(
    init.routes,
    mapRouteProperties2,
    void 0,
    manifest
  );
  let inFlightDataRoutes;
  let basename = init.basename || "/";
  let dataStrategyImpl = init.dataStrategy || defaultDataStrategyWithMiddleware;
  let future = {
    unstable_middleware: false,
    ...init.future
  };
  let unlistenHistory = null;
  let subscribers = /* @__PURE__ */ new Set();
  let savedScrollPositions2 = null;
  let getScrollRestorationKey2 = null;
  let getScrollPosition = null;
  let initialScrollRestored = init.hydrationData != null;
  let initialMatches = matchRoutes(dataRoutes, init.history.location, basename);
  let initialMatchesIsFOW = false;
  let initialErrors = null;
  if (initialMatches == null && !init.patchRoutesOnNavigation) {
    let error = getInternalRouterError(404, {
      pathname: init.history.location.pathname
    });
    let { matches, route } = getShortCircuitMatches(dataRoutes);
    initialMatches = matches;
    initialErrors = { [route.id]: error };
  }
  if (initialMatches && !init.hydrationData) {
    let fogOfWar = checkFogOfWar(
      initialMatches,
      dataRoutes,
      init.history.location.pathname
    );
    if (fogOfWar.active) {
      initialMatches = null;
    }
  }
  let initialized;
  if (!initialMatches) {
    initialized = false;
    initialMatches = [];
    let fogOfWar = checkFogOfWar(
      null,
      dataRoutes,
      init.history.location.pathname
    );
    if (fogOfWar.active && fogOfWar.matches) {
      initialMatchesIsFOW = true;
      initialMatches = fogOfWar.matches;
    }
  } else if (initialMatches.some((m) => m.route.lazy)) {
    initialized = false;
  } else if (!initialMatches.some((m) => m.route.loader)) {
    initialized = true;
  } else {
    let loaderData = init.hydrationData ? init.hydrationData.loaderData : null;
    let errors = init.hydrationData ? init.hydrationData.errors : null;
    if (errors) {
      let idx = initialMatches.findIndex(
        (m) => errors[m.route.id] !== void 0
      );
      initialized = initialMatches.slice(0, idx + 1).every((m) => !shouldLoadRouteOnHydration(m.route, loaderData, errors));
    } else {
      initialized = initialMatches.every(
        (m) => !shouldLoadRouteOnHydration(m.route, loaderData, errors)
      );
    }
  }
  let router;
  let state = {
    historyAction: init.history.action,
    location: init.history.location,
    matches: initialMatches,
    initialized,
    navigation: IDLE_NAVIGATION,
    // Don't restore on initial updateState() if we were SSR'd
    restoreScrollPosition: init.hydrationData != null ? false : null,
    preventScrollReset: false,
    revalidation: "idle",
    loaderData: init.hydrationData && init.hydrationData.loaderData || {},
    actionData: init.hydrationData && init.hydrationData.actionData || null,
    errors: init.hydrationData && init.hydrationData.errors || initialErrors,
    fetchers: /* @__PURE__ */ new Map(),
    blockers: /* @__PURE__ */ new Map()
  };
  let pendingAction = "POP";
  let pendingPreventScrollReset = false;
  let pendingNavigationController;
  let pendingViewTransitionEnabled = false;
  let appliedViewTransitions = /* @__PURE__ */ new Map();
  let removePageHideEventListener = null;
  let isUninterruptedRevalidation = false;
  let isRevalidationRequired = false;
  let cancelledFetcherLoads = /* @__PURE__ */ new Set();
  let fetchControllers = /* @__PURE__ */ new Map();
  let incrementingLoadId = 0;
  let pendingNavigationLoadId = -1;
  let fetchReloadIds = /* @__PURE__ */ new Map();
  let fetchRedirectIds = /* @__PURE__ */ new Set();
  let fetchLoadMatches = /* @__PURE__ */ new Map();
  let activeFetchers = /* @__PURE__ */ new Map();
  let fetchersQueuedForDeletion = /* @__PURE__ */ new Set();
  let blockerFunctions = /* @__PURE__ */ new Map();
  let unblockBlockerHistoryUpdate = void 0;
  let pendingRevalidationDfd = null;
  function initialize() {
    unlistenHistory = init.history.listen(
      ({ action: historyAction, location, delta }) => {
        if (unblockBlockerHistoryUpdate) {
          unblockBlockerHistoryUpdate();
          unblockBlockerHistoryUpdate = void 0;
          return;
        }
        warning(
          blockerFunctions.size === 0 || delta != null,
          "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL."
        );
        let blockerKey = shouldBlockNavigation({
          currentLocation: state.location,
          nextLocation: location,
          historyAction
        });
        if (blockerKey && delta != null) {
          let nextHistoryUpdatePromise = new Promise((resolve) => {
            unblockBlockerHistoryUpdate = resolve;
          });
          init.history.go(delta * -1);
          updateBlocker(blockerKey, {
            state: "blocked",
            location,
            proceed() {
              updateBlocker(blockerKey, {
                state: "proceeding",
                proceed: void 0,
                reset: void 0,
                location
              });
              nextHistoryUpdatePromise.then(() => init.history.go(delta));
            },
            reset() {
              let blockers = new Map(state.blockers);
              blockers.set(blockerKey, IDLE_BLOCKER);
              updateState({ blockers });
            }
          });
          return;
        }
        return startNavigation(historyAction, location);
      }
    );
    if (isBrowser2) {
      restoreAppliedTransitions(routerWindow, appliedViewTransitions);
      let _saveAppliedTransitions = () => persistAppliedTransitions(routerWindow, appliedViewTransitions);
      routerWindow.addEventListener("pagehide", _saveAppliedTransitions);
      removePageHideEventListener = () => routerWindow.removeEventListener("pagehide", _saveAppliedTransitions);
    }
    if (!state.initialized) {
      startNavigation("POP", state.location, {
        initialHydration: true
      });
    }
    return router;
  }
  function dispose() {
    if (unlistenHistory) {
      unlistenHistory();
    }
    if (removePageHideEventListener) {
      removePageHideEventListener();
    }
    subscribers.clear();
    pendingNavigationController && pendingNavigationController.abort();
    state.fetchers.forEach((_, key) => deleteFetcher(key));
    state.blockers.forEach((_, key) => deleteBlocker(key));
  }
  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }
  function updateState(newState, opts = {}) {
    state = {
      ...state,
      ...newState
    };
    let unmountedFetchers = [];
    let mountedFetchers = [];
    state.fetchers.forEach((fetcher, key) => {
      if (fetcher.state === "idle") {
        if (fetchersQueuedForDeletion.has(key)) {
          unmountedFetchers.push(key);
        } else {
          mountedFetchers.push(key);
        }
      }
    });
    fetchersQueuedForDeletion.forEach((key) => {
      if (!state.fetchers.has(key) && !fetchControllers.has(key)) {
        unmountedFetchers.push(key);
      }
    });
    [...subscribers].forEach(
      (subscriber) => subscriber(state, {
        deletedFetchers: unmountedFetchers,
        viewTransitionOpts: opts.viewTransitionOpts,
        flushSync: opts.flushSync === true
      })
    );
    unmountedFetchers.forEach((key) => deleteFetcher(key));
    mountedFetchers.forEach((key) => state.fetchers.delete(key));
  }
  function completeNavigation(location, newState, { flushSync } = {}) {
    let isActionReload = state.actionData != null && state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && state.navigation.state === "loading" && location.state?._isRedirect !== true;
    let actionData;
    if (newState.actionData) {
      if (Object.keys(newState.actionData).length > 0) {
        actionData = newState.actionData;
      } else {
        actionData = null;
      }
    } else if (isActionReload) {
      actionData = state.actionData;
    } else {
      actionData = null;
    }
    let loaderData = newState.loaderData ? mergeLoaderData(
      state.loaderData,
      newState.loaderData,
      newState.matches || [],
      newState.errors
    ) : state.loaderData;
    let blockers = state.blockers;
    if (blockers.size > 0) {
      blockers = new Map(blockers);
      blockers.forEach((_, k) => blockers.set(k, IDLE_BLOCKER));
    }
    let preventScrollReset = pendingPreventScrollReset === true || state.navigation.formMethod != null && isMutationMethod(state.navigation.formMethod) && location.state?._isRedirect !== true;
    if (inFlightDataRoutes) {
      dataRoutes = inFlightDataRoutes;
      inFlightDataRoutes = void 0;
    }
    if (isUninterruptedRevalidation) ; else if (pendingAction === "POP") ; else if (pendingAction === "PUSH") {
      init.history.push(location, location.state);
    } else if (pendingAction === "REPLACE") {
      init.history.replace(location, location.state);
    }
    let viewTransitionOpts;
    if (pendingAction === "POP") {
      let priorPaths = appliedViewTransitions.get(state.location.pathname);
      if (priorPaths && priorPaths.has(location.pathname)) {
        viewTransitionOpts = {
          currentLocation: state.location,
          nextLocation: location
        };
      } else if (appliedViewTransitions.has(location.pathname)) {
        viewTransitionOpts = {
          currentLocation: location,
          nextLocation: state.location
        };
      }
    } else if (pendingViewTransitionEnabled) {
      let toPaths = appliedViewTransitions.get(state.location.pathname);
      if (toPaths) {
        toPaths.add(location.pathname);
      } else {
        toPaths = /* @__PURE__ */ new Set([location.pathname]);
        appliedViewTransitions.set(state.location.pathname, toPaths);
      }
      viewTransitionOpts = {
        currentLocation: state.location,
        nextLocation: location
      };
    }
    updateState(
      {
        ...newState,
        // matches, errors, fetchers go through as-is
        actionData,
        loaderData,
        historyAction: pendingAction,
        location,
        initialized: true,
        navigation: IDLE_NAVIGATION,
        revalidation: "idle",
        restoreScrollPosition: getSavedScrollPosition(
          location,
          newState.matches || state.matches
        ),
        preventScrollReset,
        blockers
      },
      {
        viewTransitionOpts,
        flushSync: flushSync === true
      }
    );
    pendingAction = "POP";
    pendingPreventScrollReset = false;
    pendingViewTransitionEnabled = false;
    isUninterruptedRevalidation = false;
    isRevalidationRequired = false;
    pendingRevalidationDfd?.resolve();
    pendingRevalidationDfd = null;
  }
  async function navigate(to, opts) {
    if (typeof to === "number") {
      init.history.go(to);
      return;
    }
    let normalizedPath = normalizeTo(
      state.location,
      state.matches,
      basename,
      to,
      opts?.fromRouteId,
      opts?.relative
    );
    let { path, submission, error } = normalizeNavigateOptions(
      false,
      normalizedPath,
      opts
    );
    let currentLocation = state.location;
    let nextLocation = createLocation(state.location, path, opts && opts.state);
    nextLocation = {
      ...nextLocation,
      ...init.history.encodeLocation(nextLocation)
    };
    let userReplace = opts && opts.replace != null ? opts.replace : void 0;
    let historyAction = "PUSH";
    if (userReplace === true) {
      historyAction = "REPLACE";
    } else if (userReplace === false) ; else if (submission != null && isMutationMethod(submission.formMethod) && submission.formAction === state.location.pathname + state.location.search) {
      historyAction = "REPLACE";
    }
    let preventScrollReset = opts && "preventScrollReset" in opts ? opts.preventScrollReset === true : void 0;
    let flushSync = (opts && opts.flushSync) === true;
    let blockerKey = shouldBlockNavigation({
      currentLocation,
      nextLocation,
      historyAction
    });
    if (blockerKey) {
      updateBlocker(blockerKey, {
        state: "blocked",
        location: nextLocation,
        proceed() {
          updateBlocker(blockerKey, {
            state: "proceeding",
            proceed: void 0,
            reset: void 0,
            location: nextLocation
          });
          navigate(to, opts);
        },
        reset() {
          let blockers = new Map(state.blockers);
          blockers.set(blockerKey, IDLE_BLOCKER);
          updateState({ blockers });
        }
      });
      return;
    }
    await startNavigation(historyAction, nextLocation, {
      submission,
      // Send through the formData serialization error if we have one so we can
      // render at the right error boundary after we match routes
      pendingError: error,
      preventScrollReset,
      replace: opts && opts.replace,
      enableViewTransition: opts && opts.viewTransition,
      flushSync
    });
  }
  function revalidate() {
    if (!pendingRevalidationDfd) {
      pendingRevalidationDfd = createDeferred();
    }
    interruptActiveLoads();
    updateState({ revalidation: "loading" });
    let promise = pendingRevalidationDfd.promise;
    if (state.navigation.state === "submitting") {
      return promise;
    }
    if (state.navigation.state === "idle") {
      startNavigation(state.historyAction, state.location, {
        startUninterruptedRevalidation: true
      });
      return promise;
    }
    startNavigation(
      pendingAction || state.historyAction,
      state.navigation.location,
      {
        overrideNavigation: state.navigation,
        // Proxy through any rending view transition
        enableViewTransition: pendingViewTransitionEnabled === true
      }
    );
    return promise;
  }
  async function startNavigation(historyAction, location, opts) {
    pendingNavigationController && pendingNavigationController.abort();
    pendingNavigationController = null;
    pendingAction = historyAction;
    isUninterruptedRevalidation = (opts && opts.startUninterruptedRevalidation) === true;
    saveScrollPosition(state.location, state.matches);
    pendingPreventScrollReset = (opts && opts.preventScrollReset) === true;
    pendingViewTransitionEnabled = (opts && opts.enableViewTransition) === true;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let loadingNavigation = opts && opts.overrideNavigation;
    let matches = opts?.initialHydration && state.matches && state.matches.length > 0 && !initialMatchesIsFOW ? (
      // `matchRoutes()` has already been called if we're in here via `router.initialize()`
      state.matches
    ) : matchRoutes(routesToUse, location, basename);
    let flushSync = (opts && opts.flushSync) === true;
    if (matches && state.initialized && !isRevalidationRequired && isHashChangeOnly(state.location, location) && !(opts && opts.submission && isMutationMethod(opts.submission.formMethod))) {
      completeNavigation(location, { matches }, { flushSync });
      return;
    }
    let fogOfWar = checkFogOfWar(matches, routesToUse, location.pathname);
    if (fogOfWar.active && fogOfWar.matches) {
      matches = fogOfWar.matches;
    }
    if (!matches) {
      let { error, notFoundMatches, route } = handleNavigational404(
        location.pathname
      );
      completeNavigation(
        location,
        {
          matches: notFoundMatches,
          loaderData: {},
          errors: {
            [route.id]: error
          }
        },
        { flushSync }
      );
      return;
    }
    pendingNavigationController = new AbortController();
    let request = createClientSideRequest(
      init.history,
      location,
      pendingNavigationController.signal,
      opts && opts.submission
    );
    let scopedContext = new unstable_RouterContextProvider(
      init.unstable_getContext ? await init.unstable_getContext() : void 0
    );
    let pendingActionResult;
    if (opts && opts.pendingError) {
      pendingActionResult = [
        findNearestBoundary(matches).route.id,
        { type: "error", error: opts.pendingError }
      ];
    } else if (opts && opts.submission && isMutationMethod(opts.submission.formMethod)) {
      let actionResult = await handleAction(
        request,
        location,
        opts.submission,
        matches,
        scopedContext,
        fogOfWar.active,
        { replace: opts.replace, flushSync }
      );
      if (actionResult.shortCircuited) {
        return;
      }
      if (actionResult.pendingActionResult) {
        let [routeId, result] = actionResult.pendingActionResult;
        if (isErrorResult(result) && isRouteErrorResponse(result.error) && result.error.status === 404) {
          pendingNavigationController = null;
          completeNavigation(location, {
            matches: actionResult.matches,
            loaderData: {},
            errors: {
              [routeId]: result.error
            }
          });
          return;
        }
      }
      matches = actionResult.matches || matches;
      pendingActionResult = actionResult.pendingActionResult;
      loadingNavigation = getLoadingNavigation(location, opts.submission);
      flushSync = false;
      fogOfWar.active = false;
      request = createClientSideRequest(
        init.history,
        request.url,
        request.signal
      );
    }
    let {
      shortCircuited,
      matches: updatedMatches,
      loaderData,
      errors
    } = await handleLoaders(
      request,
      location,
      matches,
      scopedContext,
      fogOfWar.active,
      loadingNavigation,
      opts && opts.submission,
      opts && opts.fetcherSubmission,
      opts && opts.replace,
      opts && opts.initialHydration === true,
      flushSync,
      pendingActionResult
    );
    if (shortCircuited) {
      return;
    }
    pendingNavigationController = null;
    completeNavigation(location, {
      matches: updatedMatches || matches,
      ...getActionDataForCommit(pendingActionResult),
      loaderData,
      errors
    });
  }
  async function handleAction(request, location, submission, matches, scopedContext, isFogOfWar, opts = {}) {
    interruptActiveLoads();
    let navigation = getSubmittingNavigation(location, submission);
    updateState({ navigation }, { flushSync: opts.flushSync === true });
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(
        matches,
        location.pathname,
        request.signal
      );
      if (discoverResult.type === "aborted") {
        return { shortCircuited: true };
      } else if (discoverResult.type === "error") {
        let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
        return {
          matches: discoverResult.partialMatches,
          pendingActionResult: [
            boundaryId,
            {
              type: "error",
              error: discoverResult.error
            }
          ]
        };
      } else if (!discoverResult.matches) {
        let { notFoundMatches, error, route } = handleNavigational404(
          location.pathname
        );
        return {
          matches: notFoundMatches,
          pendingActionResult: [
            route.id,
            {
              type: "error",
              error
            }
          ]
        };
      } else {
        matches = discoverResult.matches;
      }
    }
    let result;
    let actionMatch = getTargetMatch(matches, location);
    if (!actionMatch.route.action && !actionMatch.route.lazy) {
      result = {
        type: "error",
        error: getInternalRouterError(405, {
          method: request.method,
          pathname: location.pathname,
          routeId: actionMatch.route.id
        })
      };
    } else {
      let results = await callDataStrategy(
        "action",
        request,
        [actionMatch],
        matches,
        scopedContext,
        null
      );
      result = results[actionMatch.route.id];
      if (!result) {
        for (let match of matches) {
          if (results[match.route.id]) {
            result = results[match.route.id];
            break;
          }
        }
      }
      if (request.signal.aborted) {
        return { shortCircuited: true };
      }
    }
    if (isRedirectResult(result)) {
      let replace2;
      if (opts && opts.replace != null) {
        replace2 = opts.replace;
      } else {
        let location2 = normalizeRedirectLocation(
          result.response.headers.get("Location"),
          new URL(request.url),
          basename
        );
        replace2 = location2 === state.location.pathname + state.location.search;
      }
      await startRedirectNavigation(request, result, true, {
        submission,
        replace: replace2
      });
      return { shortCircuited: true };
    }
    if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(matches, actionMatch.route.id);
      if ((opts && opts.replace) !== true) {
        pendingAction = "PUSH";
      }
      return {
        matches,
        pendingActionResult: [boundaryMatch.route.id, result]
      };
    }
    return {
      matches,
      pendingActionResult: [actionMatch.route.id, result]
    };
  }
  async function handleLoaders(request, location, matches, scopedContext, isFogOfWar, overrideNavigation, submission, fetcherSubmission, replace2, initialHydration, flushSync, pendingActionResult) {
    let loadingNavigation = overrideNavigation || getLoadingNavigation(location, submission);
    let activeSubmission = submission || fetcherSubmission || getSubmissionFromNavigation(loadingNavigation);
    let shouldUpdateNavigationState = !isUninterruptedRevalidation && !initialHydration;
    if (isFogOfWar) {
      if (shouldUpdateNavigationState) {
        let actionData = getUpdatedActionData(pendingActionResult);
        updateState(
          {
            navigation: loadingNavigation,
            ...actionData !== void 0 ? { actionData } : {}
          },
          {
            flushSync
          }
        );
      }
      let discoverResult = await discoverRoutes(
        matches,
        location.pathname,
        request.signal
      );
      if (discoverResult.type === "aborted") {
        return { shortCircuited: true };
      } else if (discoverResult.type === "error") {
        let boundaryId = findNearestBoundary(discoverResult.partialMatches).route.id;
        return {
          matches: discoverResult.partialMatches,
          loaderData: {},
          errors: {
            [boundaryId]: discoverResult.error
          }
        };
      } else if (!discoverResult.matches) {
        let { error, notFoundMatches, route } = handleNavigational404(
          location.pathname
        );
        return {
          matches: notFoundMatches,
          loaderData: {},
          errors: {
            [route.id]: error
          }
        };
      } else {
        matches = discoverResult.matches;
      }
    }
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(
      init.history,
      state,
      matches,
      activeSubmission,
      location,
      initialHydration === true,
      isRevalidationRequired,
      cancelledFetcherLoads,
      fetchersQueuedForDeletion,
      fetchLoadMatches,
      fetchRedirectIds,
      routesToUse,
      basename,
      pendingActionResult
    );
    pendingNavigationLoadId = ++incrementingLoadId;
    if (matchesToLoad.length === 0 && revalidatingFetchers.length === 0) {
      let updatedFetchers2 = markFetchRedirectsDone();
      completeNavigation(
        location,
        {
          matches,
          loaderData: {},
          // Commit pending error if we're short circuiting
          errors: pendingActionResult && isErrorResult(pendingActionResult[1]) ? { [pendingActionResult[0]]: pendingActionResult[1].error } : null,
          ...getActionDataForCommit(pendingActionResult),
          ...updatedFetchers2 ? { fetchers: new Map(state.fetchers) } : {}
        },
        { flushSync }
      );
      return { shortCircuited: true };
    }
    if (shouldUpdateNavigationState) {
      let updates = {};
      if (!isFogOfWar) {
        updates.navigation = loadingNavigation;
        let actionData = getUpdatedActionData(pendingActionResult);
        if (actionData !== void 0) {
          updates.actionData = actionData;
        }
      }
      if (revalidatingFetchers.length > 0) {
        updates.fetchers = getUpdatedRevalidatingFetchers(revalidatingFetchers);
      }
      updateState(updates, { flushSync });
    }
    revalidatingFetchers.forEach((rf) => {
      abortFetcher(rf.key);
      if (rf.controller) {
        fetchControllers.set(rf.key, rf.controller);
      }
    });
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((f) => abortFetcher(f.key));
    if (pendingNavigationController) {
      pendingNavigationController.signal.addEventListener(
        "abort",
        abortPendingFetchRevalidations
      );
    }
    let { loaderResults, fetcherResults } = await callLoadersAndMaybeResolveData(
      matches,
      matchesToLoad,
      revalidatingFetchers,
      request,
      scopedContext
    );
    if (request.signal.aborted) {
      return { shortCircuited: true };
    }
    if (pendingNavigationController) {
      pendingNavigationController.signal.removeEventListener(
        "abort",
        abortPendingFetchRevalidations
      );
    }
    revalidatingFetchers.forEach((rf) => fetchControllers.delete(rf.key));
    let redirect2 = findRedirect(loaderResults);
    if (redirect2) {
      await startRedirectNavigation(request, redirect2.result, true, {
        replace: replace2
      });
      return { shortCircuited: true };
    }
    redirect2 = findRedirect(fetcherResults);
    if (redirect2) {
      fetchRedirectIds.add(redirect2.key);
      await startRedirectNavigation(request, redirect2.result, true, {
        replace: replace2
      });
      return { shortCircuited: true };
    }
    let { loaderData, errors } = processLoaderData(
      state,
      matches,
      loaderResults,
      pendingActionResult,
      revalidatingFetchers,
      fetcherResults
    );
    if (initialHydration && state.errors) {
      errors = { ...state.errors, ...errors };
    }
    let updatedFetchers = markFetchRedirectsDone();
    let didAbortFetchLoads = abortStaleFetchLoads(pendingNavigationLoadId);
    let shouldUpdateFetchers = updatedFetchers || didAbortFetchLoads || revalidatingFetchers.length > 0;
    return {
      matches,
      loaderData,
      errors,
      ...shouldUpdateFetchers ? { fetchers: new Map(state.fetchers) } : {}
    };
  }
  function getUpdatedActionData(pendingActionResult) {
    if (pendingActionResult && !isErrorResult(pendingActionResult[1])) {
      return {
        [pendingActionResult[0]]: pendingActionResult[1].data
      };
    } else if (state.actionData) {
      if (Object.keys(state.actionData).length === 0) {
        return null;
      } else {
        return state.actionData;
      }
    }
  }
  function getUpdatedRevalidatingFetchers(revalidatingFetchers) {
    revalidatingFetchers.forEach((rf) => {
      let fetcher = state.fetchers.get(rf.key);
      let revalidatingFetcher = getLoadingFetcher(
        void 0,
        fetcher ? fetcher.data : void 0
      );
      state.fetchers.set(rf.key, revalidatingFetcher);
    });
    return new Map(state.fetchers);
  }
  async function fetch2(key, routeId, href2, opts) {
    abortFetcher(key);
    let flushSync = (opts && opts.flushSync) === true;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let normalizedPath = normalizeTo(
      state.location,
      state.matches,
      basename,
      href2,
      routeId,
      opts?.relative
    );
    let matches = matchRoutes(routesToUse, normalizedPath, basename);
    let fogOfWar = checkFogOfWar(matches, routesToUse, normalizedPath);
    if (fogOfWar.active && fogOfWar.matches) {
      matches = fogOfWar.matches;
    }
    if (!matches) {
      setFetcherError(
        key,
        routeId,
        getInternalRouterError(404, { pathname: normalizedPath }),
        { flushSync }
      );
      return;
    }
    let { path, submission, error } = normalizeNavigateOptions(
      true,
      normalizedPath,
      opts
    );
    if (error) {
      setFetcherError(key, routeId, error, { flushSync });
      return;
    }
    let match = getTargetMatch(matches, path);
    let scopedContext = new unstable_RouterContextProvider(
      init.unstable_getContext ? await init.unstable_getContext() : void 0
    );
    let preventScrollReset = (opts && opts.preventScrollReset) === true;
    if (submission && isMutationMethod(submission.formMethod)) {
      await handleFetcherAction(
        key,
        routeId,
        path,
        match,
        matches,
        scopedContext,
        fogOfWar.active,
        flushSync,
        preventScrollReset,
        submission
      );
      return;
    }
    fetchLoadMatches.set(key, { routeId, path });
    await handleFetcherLoader(
      key,
      routeId,
      path,
      match,
      matches,
      scopedContext,
      fogOfWar.active,
      flushSync,
      preventScrollReset,
      submission
    );
  }
  async function handleFetcherAction(key, routeId, path, match, requestMatches, scopedContext, isFogOfWar, flushSync, preventScrollReset, submission) {
    interruptActiveLoads();
    fetchLoadMatches.delete(key);
    function detectAndHandle405Error(m) {
      if (!m.route.action && !m.route.lazy) {
        let error = getInternalRouterError(405, {
          method: submission.formMethod,
          pathname: path,
          routeId
        });
        setFetcherError(key, routeId, error, { flushSync });
        return true;
      }
      return false;
    }
    if (!isFogOfWar && detectAndHandle405Error(match)) {
      return;
    }
    let existingFetcher = state.fetchers.get(key);
    updateFetcherState(key, getSubmittingFetcher(submission, existingFetcher), {
      flushSync
    });
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(
      init.history,
      path,
      abortController.signal,
      submission
    );
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(
        requestMatches,
        path,
        fetchRequest.signal,
        key
      );
      if (discoverResult.type === "aborted") {
        return;
      } else if (discoverResult.type === "error") {
        setFetcherError(key, routeId, discoverResult.error, { flushSync });
        return;
      } else if (!discoverResult.matches) {
        setFetcherError(
          key,
          routeId,
          getInternalRouterError(404, { pathname: path }),
          { flushSync }
        );
        return;
      } else {
        requestMatches = discoverResult.matches;
        match = getTargetMatch(requestMatches, path);
        if (detectAndHandle405Error(match)) {
          return;
        }
      }
    }
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let actionResults = await callDataStrategy(
      "action",
      fetchRequest,
      [match],
      requestMatches,
      scopedContext,
      key
    );
    let actionResult = actionResults[match.route.id];
    if (fetchRequest.signal.aborted) {
      if (fetchControllers.get(key) === abortController) {
        fetchControllers.delete(key);
      }
      return;
    }
    if (fetchersQueuedForDeletion.has(key)) {
      if (isRedirectResult(actionResult) || isErrorResult(actionResult)) {
        updateFetcherState(key, getDoneFetcher(void 0));
        return;
      }
    } else {
      if (isRedirectResult(actionResult)) {
        fetchControllers.delete(key);
        if (pendingNavigationLoadId > originatingLoadId) {
          updateFetcherState(key, getDoneFetcher(void 0));
          return;
        } else {
          fetchRedirectIds.add(key);
          updateFetcherState(key, getLoadingFetcher(submission));
          return startRedirectNavigation(fetchRequest, actionResult, false, {
            fetcherSubmission: submission,
            preventScrollReset
          });
        }
      }
      if (isErrorResult(actionResult)) {
        setFetcherError(key, routeId, actionResult.error);
        return;
      }
    }
    let nextLocation = state.navigation.location || state.location;
    let revalidationRequest = createClientSideRequest(
      init.history,
      nextLocation,
      abortController.signal
    );
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let matches = state.navigation.state !== "idle" ? matchRoutes(routesToUse, state.navigation.location, basename) : state.matches;
    invariant(matches, "Didn't find any matches after fetcher action");
    let loadId = ++incrementingLoadId;
    fetchReloadIds.set(key, loadId);
    let loadFetcher = getLoadingFetcher(submission, actionResult.data);
    state.fetchers.set(key, loadFetcher);
    let [matchesToLoad, revalidatingFetchers] = getMatchesToLoad(
      init.history,
      state,
      matches,
      submission,
      nextLocation,
      false,
      isRevalidationRequired,
      cancelledFetcherLoads,
      fetchersQueuedForDeletion,
      fetchLoadMatches,
      fetchRedirectIds,
      routesToUse,
      basename,
      [match.route.id, actionResult]
    );
    revalidatingFetchers.filter((rf) => rf.key !== key).forEach((rf) => {
      let staleKey = rf.key;
      let existingFetcher2 = state.fetchers.get(staleKey);
      let revalidatingFetcher = getLoadingFetcher(
        void 0,
        existingFetcher2 ? existingFetcher2.data : void 0
      );
      state.fetchers.set(staleKey, revalidatingFetcher);
      abortFetcher(staleKey);
      if (rf.controller) {
        fetchControllers.set(staleKey, rf.controller);
      }
    });
    updateState({ fetchers: new Map(state.fetchers) });
    let abortPendingFetchRevalidations = () => revalidatingFetchers.forEach((rf) => abortFetcher(rf.key));
    abortController.signal.addEventListener(
      "abort",
      abortPendingFetchRevalidations
    );
    let { loaderResults, fetcherResults } = await callLoadersAndMaybeResolveData(
      matches,
      matchesToLoad,
      revalidatingFetchers,
      revalidationRequest,
      scopedContext
    );
    if (abortController.signal.aborted) {
      return;
    }
    abortController.signal.removeEventListener(
      "abort",
      abortPendingFetchRevalidations
    );
    fetchReloadIds.delete(key);
    fetchControllers.delete(key);
    revalidatingFetchers.forEach((r) => fetchControllers.delete(r.key));
    let redirect2 = findRedirect(loaderResults);
    if (redirect2) {
      return startRedirectNavigation(
        revalidationRequest,
        redirect2.result,
        false,
        { preventScrollReset }
      );
    }
    redirect2 = findRedirect(fetcherResults);
    if (redirect2) {
      fetchRedirectIds.add(redirect2.key);
      return startRedirectNavigation(
        revalidationRequest,
        redirect2.result,
        false,
        { preventScrollReset }
      );
    }
    let { loaderData, errors } = processLoaderData(
      state,
      matches,
      loaderResults,
      void 0,
      revalidatingFetchers,
      fetcherResults
    );
    if (state.fetchers.has(key)) {
      let doneFetcher = getDoneFetcher(actionResult.data);
      state.fetchers.set(key, doneFetcher);
    }
    abortStaleFetchLoads(loadId);
    if (state.navigation.state === "loading" && loadId > pendingNavigationLoadId) {
      invariant(pendingAction, "Expected pending action");
      pendingNavigationController && pendingNavigationController.abort();
      completeNavigation(state.navigation.location, {
        matches,
        loaderData,
        errors,
        fetchers: new Map(state.fetchers)
      });
    } else {
      updateState({
        errors,
        loaderData: mergeLoaderData(
          state.loaderData,
          loaderData,
          matches,
          errors
        ),
        fetchers: new Map(state.fetchers)
      });
      isRevalidationRequired = false;
    }
  }
  async function handleFetcherLoader(key, routeId, path, match, matches, scopedContext, isFogOfWar, flushSync, preventScrollReset, submission) {
    let existingFetcher = state.fetchers.get(key);
    updateFetcherState(
      key,
      getLoadingFetcher(
        submission,
        existingFetcher ? existingFetcher.data : void 0
      ),
      { flushSync }
    );
    let abortController = new AbortController();
    let fetchRequest = createClientSideRequest(
      init.history,
      path,
      abortController.signal
    );
    if (isFogOfWar) {
      let discoverResult = await discoverRoutes(
        matches,
        path,
        fetchRequest.signal,
        key
      );
      if (discoverResult.type === "aborted") {
        return;
      } else if (discoverResult.type === "error") {
        setFetcherError(key, routeId, discoverResult.error, { flushSync });
        return;
      } else if (!discoverResult.matches) {
        setFetcherError(
          key,
          routeId,
          getInternalRouterError(404, { pathname: path }),
          { flushSync }
        );
        return;
      } else {
        matches = discoverResult.matches;
        match = getTargetMatch(matches, path);
      }
    }
    fetchControllers.set(key, abortController);
    let originatingLoadId = incrementingLoadId;
    let results = await callDataStrategy(
      "loader",
      fetchRequest,
      [match],
      matches,
      scopedContext,
      key
    );
    let result = results[match.route.id];
    if (fetchControllers.get(key) === abortController) {
      fetchControllers.delete(key);
    }
    if (fetchRequest.signal.aborted) {
      return;
    }
    if (fetchersQueuedForDeletion.has(key)) {
      updateFetcherState(key, getDoneFetcher(void 0));
      return;
    }
    if (isRedirectResult(result)) {
      if (pendingNavigationLoadId > originatingLoadId) {
        updateFetcherState(key, getDoneFetcher(void 0));
        return;
      } else {
        fetchRedirectIds.add(key);
        await startRedirectNavigation(fetchRequest, result, false, {
          preventScrollReset
        });
        return;
      }
    }
    if (isErrorResult(result)) {
      setFetcherError(key, routeId, result.error);
      return;
    }
    updateFetcherState(key, getDoneFetcher(result.data));
  }
  async function startRedirectNavigation(request, redirect2, isNavigation, {
    submission,
    fetcherSubmission,
    preventScrollReset,
    replace: replace2
  } = {}) {
    if (redirect2.response.headers.has("X-Remix-Revalidate")) {
      isRevalidationRequired = true;
    }
    let location = redirect2.response.headers.get("Location");
    invariant(location, "Expected a Location header on the redirect Response");
    location = normalizeRedirectLocation(
      location,
      new URL(request.url),
      basename
    );
    let redirectLocation = createLocation(state.location, location, {
      _isRedirect: true
    });
    if (isBrowser2) {
      let isDocumentReload = false;
      if (redirect2.response.headers.has("X-Remix-Reload-Document")) {
        isDocumentReload = true;
      } else if (ABSOLUTE_URL_REGEX.test(location)) {
        const url = init.history.createURL(location);
        isDocumentReload = // Hard reload if it's an absolute URL to a new origin
        url.origin !== routerWindow.location.origin || // Hard reload if it's an absolute URL that does not match our basename
        stripBasename(url.pathname, basename) == null;
      }
      if (isDocumentReload) {
        if (replace2) {
          routerWindow.location.replace(location);
        } else {
          routerWindow.location.assign(location);
        }
        return;
      }
    }
    pendingNavigationController = null;
    let redirectNavigationType = replace2 === true || redirect2.response.headers.has("X-Remix-Replace") ? "REPLACE" : "PUSH";
    let { formMethod, formAction, formEncType } = state.navigation;
    if (!submission && !fetcherSubmission && formMethod && formAction && formEncType) {
      submission = getSubmissionFromNavigation(state.navigation);
    }
    let activeSubmission = submission || fetcherSubmission;
    if (redirectPreserveMethodStatusCodes.has(redirect2.response.status) && activeSubmission && isMutationMethod(activeSubmission.formMethod)) {
      await startNavigation(redirectNavigationType, redirectLocation, {
        submission: {
          ...activeSubmission,
          formAction: location
        },
        // Preserve these flags across redirects
        preventScrollReset: preventScrollReset || pendingPreventScrollReset,
        enableViewTransition: isNavigation ? pendingViewTransitionEnabled : void 0
      });
    } else {
      let overrideNavigation = getLoadingNavigation(
        redirectLocation,
        submission
      );
      await startNavigation(redirectNavigationType, redirectLocation, {
        overrideNavigation,
        // Send fetcher submissions through for shouldRevalidate
        fetcherSubmission,
        // Preserve these flags across redirects
        preventScrollReset: preventScrollReset || pendingPreventScrollReset,
        enableViewTransition: isNavigation ? pendingViewTransitionEnabled : void 0
      });
    }
  }
  async function callDataStrategy(type, request, matchesToLoad, matches, scopedContext, fetcherKey) {
    let results;
    let dataResults = {};
    try {
      results = await callDataStrategyImpl(
        dataStrategyImpl,
        type,
        request,
        matchesToLoad,
        matches,
        fetcherKey,
        manifest,
        mapRouteProperties2,
        scopedContext
      );
    } catch (e) {
      matchesToLoad.forEach((m) => {
        dataResults[m.route.id] = {
          type: "error",
          error: e
        };
      });
      return dataResults;
    }
    for (let [routeId, result] of Object.entries(results)) {
      if (isRedirectDataStrategyResult(result)) {
        let response = result.result;
        dataResults[routeId] = {
          type: "redirect",
          response: normalizeRelativeRoutingRedirectResponse(
            response,
            request,
            routeId,
            matches,
            basename
          )
        };
      } else {
        dataResults[routeId] = await convertDataStrategyResultToDataResult(
          result
        );
      }
    }
    return dataResults;
  }
  async function callLoadersAndMaybeResolveData(matches, matchesToLoad, fetchersToLoad, request, scopedContext) {
    let loaderResultsPromise = callDataStrategy(
      "loader",
      request,
      matchesToLoad,
      matches,
      scopedContext,
      null
    );
    let fetcherResultsPromise = Promise.all(
      fetchersToLoad.map(async (f) => {
        if (f.matches && f.match && f.controller) {
          let results = await callDataStrategy(
            "loader",
            createClientSideRequest(init.history, f.path, f.controller.signal),
            [f.match],
            f.matches,
            scopedContext,
            f.key
          );
          let result = results[f.match.route.id];
          return { [f.key]: result };
        } else {
          return Promise.resolve({
            [f.key]: {
              type: "error",
              error: getInternalRouterError(404, {
                pathname: f.path
              })
            }
          });
        }
      })
    );
    let loaderResults = await loaderResultsPromise;
    let fetcherResults = (await fetcherResultsPromise).reduce(
      (acc, r) => Object.assign(acc, r),
      {}
    );
    return {
      loaderResults,
      fetcherResults
    };
  }
  function interruptActiveLoads() {
    isRevalidationRequired = true;
    fetchLoadMatches.forEach((_, key) => {
      if (fetchControllers.has(key)) {
        cancelledFetcherLoads.add(key);
      }
      abortFetcher(key);
    });
  }
  function updateFetcherState(key, fetcher, opts = {}) {
    state.fetchers.set(key, fetcher);
    updateState(
      { fetchers: new Map(state.fetchers) },
      { flushSync: (opts && opts.flushSync) === true }
    );
  }
  function setFetcherError(key, routeId, error, opts = {}) {
    let boundaryMatch = findNearestBoundary(state.matches, routeId);
    deleteFetcher(key);
    updateState(
      {
        errors: {
          [boundaryMatch.route.id]: error
        },
        fetchers: new Map(state.fetchers)
      },
      { flushSync: (opts && opts.flushSync) === true }
    );
  }
  function getFetcher(key) {
    activeFetchers.set(key, (activeFetchers.get(key) || 0) + 1);
    if (fetchersQueuedForDeletion.has(key)) {
      fetchersQueuedForDeletion.delete(key);
    }
    return state.fetchers.get(key) || IDLE_FETCHER;
  }
  function deleteFetcher(key) {
    let fetcher = state.fetchers.get(key);
    if (fetchControllers.has(key) && !(fetcher && fetcher.state === "loading" && fetchReloadIds.has(key))) {
      abortFetcher(key);
    }
    fetchLoadMatches.delete(key);
    fetchReloadIds.delete(key);
    fetchRedirectIds.delete(key);
    fetchersQueuedForDeletion.delete(key);
    cancelledFetcherLoads.delete(key);
    state.fetchers.delete(key);
  }
  function queueFetcherForDeletion(key) {
    let count = (activeFetchers.get(key) || 0) - 1;
    if (count <= 0) {
      activeFetchers.delete(key);
      fetchersQueuedForDeletion.add(key);
    } else {
      activeFetchers.set(key, count);
    }
    updateState({ fetchers: new Map(state.fetchers) });
  }
  function abortFetcher(key) {
    let controller = fetchControllers.get(key);
    if (controller) {
      controller.abort();
      fetchControllers.delete(key);
    }
  }
  function markFetchersDone(keys) {
    for (let key of keys) {
      let fetcher = getFetcher(key);
      let doneFetcher = getDoneFetcher(fetcher.data);
      state.fetchers.set(key, doneFetcher);
    }
  }
  function markFetchRedirectsDone() {
    let doneKeys = [];
    let updatedFetchers = false;
    for (let key of fetchRedirectIds) {
      let fetcher = state.fetchers.get(key);
      invariant(fetcher, `Expected fetcher: ${key}`);
      if (fetcher.state === "loading") {
        fetchRedirectIds.delete(key);
        doneKeys.push(key);
        updatedFetchers = true;
      }
    }
    markFetchersDone(doneKeys);
    return updatedFetchers;
  }
  function abortStaleFetchLoads(landedId) {
    let yeetedKeys = [];
    for (let [key, id] of fetchReloadIds) {
      if (id < landedId) {
        let fetcher = state.fetchers.get(key);
        invariant(fetcher, `Expected fetcher: ${key}`);
        if (fetcher.state === "loading") {
          abortFetcher(key);
          fetchReloadIds.delete(key);
          yeetedKeys.push(key);
        }
      }
    }
    markFetchersDone(yeetedKeys);
    return yeetedKeys.length > 0;
  }
  function getBlocker(key, fn) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    if (blockerFunctions.get(key) !== fn) {
      blockerFunctions.set(key, fn);
    }
    return blocker;
  }
  function deleteBlocker(key) {
    state.blockers.delete(key);
    blockerFunctions.delete(key);
  }
  function updateBlocker(key, newBlocker) {
    let blocker = state.blockers.get(key) || IDLE_BLOCKER;
    invariant(
      blocker.state === "unblocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "blocked" || blocker.state === "blocked" && newBlocker.state === "proceeding" || blocker.state === "blocked" && newBlocker.state === "unblocked" || blocker.state === "proceeding" && newBlocker.state === "unblocked",
      `Invalid blocker state transition: ${blocker.state} -> ${newBlocker.state}`
    );
    let blockers = new Map(state.blockers);
    blockers.set(key, newBlocker);
    updateState({ blockers });
  }
  function shouldBlockNavigation({
    currentLocation,
    nextLocation,
    historyAction
  }) {
    if (blockerFunctions.size === 0) {
      return;
    }
    if (blockerFunctions.size > 1) {
      warning(false, "A router only supports one blocker at a time");
    }
    let entries = Array.from(blockerFunctions.entries());
    let [blockerKey, blockerFunction] = entries[entries.length - 1];
    let blocker = state.blockers.get(blockerKey);
    if (blocker && blocker.state === "proceeding") {
      return;
    }
    if (blockerFunction({ currentLocation, nextLocation, historyAction })) {
      return blockerKey;
    }
  }
  function handleNavigational404(pathname) {
    let error = getInternalRouterError(404, { pathname });
    let routesToUse = inFlightDataRoutes || dataRoutes;
    let { matches, route } = getShortCircuitMatches(routesToUse);
    return { notFoundMatches: matches, route, error };
  }
  function enableScrollRestoration(positions, getPosition, getKey) {
    savedScrollPositions2 = positions;
    getScrollPosition = getPosition;
    getScrollRestorationKey2 = getKey || null;
    if (!initialScrollRestored && state.navigation === IDLE_NAVIGATION) {
      initialScrollRestored = true;
      let y = getSavedScrollPosition(state.location, state.matches);
      if (y != null) {
        updateState({ restoreScrollPosition: y });
      }
    }
    return () => {
      savedScrollPositions2 = null;
      getScrollPosition = null;
      getScrollRestorationKey2 = null;
    };
  }
  function getScrollKey(location, matches) {
    if (getScrollRestorationKey2) {
      let key = getScrollRestorationKey2(
        location,
        matches.map((m) => convertRouteMatchToUiMatch(m, state.loaderData))
      );
      return key || location.key;
    }
    return location.key;
  }
  function saveScrollPosition(location, matches) {
    if (savedScrollPositions2 && getScrollPosition) {
      let key = getScrollKey(location, matches);
      savedScrollPositions2[key] = getScrollPosition();
    }
  }
  function getSavedScrollPosition(location, matches) {
    if (savedScrollPositions2) {
      let key = getScrollKey(location, matches);
      let y = savedScrollPositions2[key];
      if (typeof y === "number") {
        return y;
      }
    }
    return null;
  }
  function checkFogOfWar(matches, routesToUse, pathname) {
    if (init.patchRoutesOnNavigation) {
      if (!matches) {
        let fogMatches = matchRoutesImpl(
          routesToUse,
          pathname,
          basename,
          true
        );
        return { active: true, matches: fogMatches || [] };
      } else {
        if (Object.keys(matches[0].params).length > 0) {
          let partialMatches = matchRoutesImpl(
            routesToUse,
            pathname,
            basename,
            true
          );
          return { active: true, matches: partialMatches };
        }
      }
    }
    return { active: false, matches: null };
  }
  async function discoverRoutes(matches, pathname, signal, fetcherKey) {
    if (!init.patchRoutesOnNavigation) {
      return { type: "success", matches };
    }
    let partialMatches = matches;
    while (true) {
      let isNonHMR = inFlightDataRoutes == null;
      let routesToUse = inFlightDataRoutes || dataRoutes;
      let localManifest = manifest;
      try {
        await init.patchRoutesOnNavigation({
          signal,
          path: pathname,
          matches: partialMatches,
          fetcherKey,
          patch: (routeId, children) => {
            if (signal.aborted) return;
            patchRoutesImpl(
              routeId,
              children,
              routesToUse,
              localManifest,
              mapRouteProperties2
            );
          }
        });
      } catch (e) {
        return { type: "error", error: e, partialMatches };
      } finally {
        if (isNonHMR && !signal.aborted) {
          dataRoutes = [...dataRoutes];
        }
      }
      if (signal.aborted) {
        return { type: "aborted" };
      }
      let newMatches = matchRoutes(routesToUse, pathname, basename);
      if (newMatches) {
        return { type: "success", matches: newMatches };
      }
      let newPartialMatches = matchRoutesImpl(
        routesToUse,
        pathname,
        basename,
        true
      );
      if (!newPartialMatches || partialMatches.length === newPartialMatches.length && partialMatches.every(
        (m, i) => m.route.id === newPartialMatches[i].route.id
      )) {
        return { type: "success", matches: null };
      }
      partialMatches = newPartialMatches;
    }
  }
  function _internalSetRoutes(newRoutes) {
    manifest = {};
    inFlightDataRoutes = convertRoutesToDataRoutes(
      newRoutes,
      mapRouteProperties2,
      void 0,
      manifest
    );
  }
  function patchRoutes(routeId, children) {
    let isNonHMR = inFlightDataRoutes == null;
    let routesToUse = inFlightDataRoutes || dataRoutes;
    patchRoutesImpl(
      routeId,
      children,
      routesToUse,
      manifest,
      mapRouteProperties2
    );
    if (isNonHMR) {
      dataRoutes = [...dataRoutes];
      updateState({});
    }
  }
  router = {
    get basename() {
      return basename;
    },
    get future() {
      return future;
    },
    get state() {
      return state;
    },
    get routes() {
      return dataRoutes;
    },
    get window() {
      return routerWindow;
    },
    initialize,
    subscribe,
    enableScrollRestoration,
    navigate,
    fetch: fetch2,
    revalidate,
    // Passthrough to history-aware createHref used by useHref so we get proper
    // hash-aware URLs in DOM paths
    createHref: (to) => init.history.createHref(to),
    encodeLocation: (to) => init.history.encodeLocation(to),
    getFetcher,
    deleteFetcher: queueFetcherForDeletion,
    dispose,
    getBlocker,
    deleteBlocker,
    patchRoutes,
    _internalFetchControllers: fetchControllers,
    // TODO: Remove setRoutes, it's temporary to avoid dealing with
    // updating the tree while validating the update algorithm.
    _internalSetRoutes
  };
  return router;
}
function isSubmissionNavigation(opts) {
  return opts != null && ("formData" in opts && opts.formData != null || "body" in opts && opts.body !== void 0);
}
function normalizeTo(location, matches, basename, to, fromRouteId, relative) {
  let contextualMatches;
  let activeRouteMatch;
  if (fromRouteId) {
    contextualMatches = [];
    for (let match of matches) {
      contextualMatches.push(match);
      if (match.route.id === fromRouteId) {
        activeRouteMatch = match;
        break;
      }
    }
  } else {
    contextualMatches = matches;
    activeRouteMatch = matches[matches.length - 1];
  }
  let path = resolveTo(
    to ? to : ".",
    getResolveToMatches(contextualMatches),
    stripBasename(location.pathname, basename) || location.pathname,
    relative === "path"
  );
  if (to == null) {
    path.search = location.search;
    path.hash = location.hash;
  }
  if ((to == null || to === "" || to === ".") && activeRouteMatch) {
    let nakedIndex = hasNakedIndexQuery(path.search);
    if (activeRouteMatch.route.index && !nakedIndex) {
      path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
    } else if (!activeRouteMatch.route.index && nakedIndex) {
      let params = new URLSearchParams(path.search);
      let indexValues = params.getAll("index");
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? `?${qs}` : "";
    }
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function normalizeNavigateOptions(isFetcher, path, opts) {
  if (!opts || !isSubmissionNavigation(opts)) {
    return { path };
  }
  if (opts.formMethod && !isValidMethod(opts.formMethod)) {
    return {
      path,
      error: getInternalRouterError(405, { method: opts.formMethod })
    };
  }
  let getInvalidBodyError = () => ({
    path,
    error: getInternalRouterError(400, { type: "invalid-body" })
  });
  let rawFormMethod = opts.formMethod || "get";
  let formMethod = rawFormMethod.toUpperCase();
  let formAction = stripHashFromPath(path);
  if (opts.body !== void 0) {
    if (opts.formEncType === "text/plain") {
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      let text = typeof opts.body === "string" ? opts.body : opts.body instanceof FormData || opts.body instanceof URLSearchParams ? (
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#plain-text-form-data
        Array.from(opts.body.entries()).reduce(
          (acc, [name, value]) => `${acc}${name}=${value}
`,
          ""
        )
      ) : String(opts.body);
      return {
        path,
        submission: {
          formMethod,
          formAction,
          formEncType: opts.formEncType,
          formData: void 0,
          json: void 0,
          text
        }
      };
    } else if (opts.formEncType === "application/json") {
      if (!isMutationMethod(formMethod)) {
        return getInvalidBodyError();
      }
      try {
        let json = typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body;
        return {
          path,
          submission: {
            formMethod,
            formAction,
            formEncType: opts.formEncType,
            formData: void 0,
            json,
            text: void 0
          }
        };
      } catch (e) {
        return getInvalidBodyError();
      }
    }
  }
  invariant(
    typeof FormData === "function",
    "FormData is not available in this environment"
  );
  let searchParams;
  let formData;
  if (opts.formData) {
    searchParams = convertFormDataToSearchParams(opts.formData);
    formData = opts.formData;
  } else if (opts.body instanceof FormData) {
    searchParams = convertFormDataToSearchParams(opts.body);
    formData = opts.body;
  } else if (opts.body instanceof URLSearchParams) {
    searchParams = opts.body;
    formData = convertSearchParamsToFormData(searchParams);
  } else if (opts.body == null) {
    searchParams = new URLSearchParams();
    formData = new FormData();
  } else {
    try {
      searchParams = new URLSearchParams(opts.body);
      formData = convertSearchParamsToFormData(searchParams);
    } catch (e) {
      return getInvalidBodyError();
    }
  }
  let submission = {
    formMethod,
    formAction,
    formEncType: opts && opts.formEncType || "application/x-www-form-urlencoded",
    formData,
    json: void 0,
    text: void 0
  };
  if (isMutationMethod(submission.formMethod)) {
    return { path, submission };
  }
  let parsedPath = parsePath(path);
  if (isFetcher && parsedPath.search && hasNakedIndexQuery(parsedPath.search)) {
    searchParams.append("index", "");
  }
  parsedPath.search = `?${searchParams}`;
  return { path: createPath(parsedPath), submission };
}
function getLoaderMatchesUntilBoundary(matches, boundaryId, includeBoundary = false) {
  let index = matches.findIndex((m) => m.route.id === boundaryId);
  if (index >= 0) {
    return matches.slice(0, includeBoundary ? index + 1 : index);
  }
  return matches;
}
function getMatchesToLoad(history, state, matches, submission, location, initialHydration, isRevalidationRequired, cancelledFetcherLoads, fetchersQueuedForDeletion, fetchLoadMatches, fetchRedirectIds, routesToUse, basename, pendingActionResult) {
  let actionResult = pendingActionResult ? isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : pendingActionResult[1].data : void 0;
  let currentUrl = history.createURL(state.location);
  let nextUrl = history.createURL(location);
  let boundaryMatches = matches;
  if (initialHydration && state.errors) {
    boundaryMatches = getLoaderMatchesUntilBoundary(
      matches,
      Object.keys(state.errors)[0],
      true
    );
  } else if (pendingActionResult && isErrorResult(pendingActionResult[1])) {
    boundaryMatches = getLoaderMatchesUntilBoundary(
      matches,
      pendingActionResult[0]
    );
  }
  let actionStatus = pendingActionResult ? pendingActionResult[1].statusCode : void 0;
  let shouldSkipRevalidation = actionStatus && actionStatus >= 400;
  let navigationMatches = boundaryMatches.filter((match, index) => {
    let { route } = match;
    if (route.lazy) {
      return true;
    }
    if (route.loader == null) {
      return false;
    }
    if (initialHydration) {
      return shouldLoadRouteOnHydration(route, state.loaderData, state.errors);
    }
    if (isNewLoader(state.loaderData, state.matches[index], match)) {
      return true;
    }
    let currentRouteMatch = state.matches[index];
    let nextRouteMatch = match;
    return shouldRevalidateLoader(match, {
      currentUrl,
      currentParams: currentRouteMatch.params,
      nextUrl,
      nextParams: nextRouteMatch.params,
      ...submission,
      actionResult,
      actionStatus,
      defaultShouldRevalidate: shouldSkipRevalidation ? false : (
        // Forced revalidation due to submission, useRevalidator, or X-Remix-Revalidate
        isRevalidationRequired || currentUrl.pathname + currentUrl.search === nextUrl.pathname + nextUrl.search || // Search params affect all loaders
        currentUrl.search !== nextUrl.search || isNewRouteInstance(currentRouteMatch, nextRouteMatch)
      )
    });
  });
  let revalidatingFetchers = [];
  fetchLoadMatches.forEach((f, key) => {
    if (initialHydration || !matches.some((m) => m.route.id === f.routeId) || fetchersQueuedForDeletion.has(key)) {
      return;
    }
    let fetcherMatches = matchRoutes(routesToUse, f.path, basename);
    if (!fetcherMatches) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: null,
        match: null,
        controller: null
      });
      return;
    }
    let fetcher = state.fetchers.get(key);
    let fetcherMatch = getTargetMatch(fetcherMatches, f.path);
    let shouldRevalidate = false;
    if (fetchRedirectIds.has(key)) {
      shouldRevalidate = false;
    } else if (cancelledFetcherLoads.has(key)) {
      cancelledFetcherLoads.delete(key);
      shouldRevalidate = true;
    } else if (fetcher && fetcher.state !== "idle" && fetcher.data === void 0) {
      shouldRevalidate = isRevalidationRequired;
    } else {
      shouldRevalidate = shouldRevalidateLoader(fetcherMatch, {
        currentUrl,
        currentParams: state.matches[state.matches.length - 1].params,
        nextUrl,
        nextParams: matches[matches.length - 1].params,
        ...submission,
        actionResult,
        actionStatus,
        defaultShouldRevalidate: shouldSkipRevalidation ? false : isRevalidationRequired
      });
    }
    if (shouldRevalidate) {
      revalidatingFetchers.push({
        key,
        routeId: f.routeId,
        path: f.path,
        matches: fetcherMatches,
        match: fetcherMatch,
        controller: new AbortController()
      });
    }
  });
  return [navigationMatches, revalidatingFetchers];
}
function shouldLoadRouteOnHydration(route, loaderData, errors) {
  if (route.lazy) {
    return true;
  }
  if (!route.loader) {
    return false;
  }
  let hasData = loaderData != null && loaderData[route.id] !== void 0;
  let hasError = errors != null && errors[route.id] !== void 0;
  if (!hasData && hasError) {
    return false;
  }
  if (typeof route.loader === "function" && route.loader.hydrate === true) {
    return true;
  }
  return !hasData && !hasError;
}
function isNewLoader(currentLoaderData, currentMatch, match) {
  let isNew = (
    // [a] -> [a, b]
    !currentMatch || // [a, b] -> [a, c]
    match.route.id !== currentMatch.route.id
  );
  let isMissingData = !currentLoaderData.hasOwnProperty(match.route.id);
  return isNew || isMissingData;
}
function isNewRouteInstance(currentMatch, match) {
  let currentPath = currentMatch.route.path;
  return (
    // param change for this match, /users/123 -> /users/456
    currentMatch.pathname !== match.pathname || // splat param changed, which is not present in match.path
    // e.g. /files/images/avatar.jpg -> files/finances.xls
    currentPath != null && currentPath.endsWith("*") && currentMatch.params["*"] !== match.params["*"]
  );
}
function shouldRevalidateLoader(loaderMatch, arg) {
  if (loaderMatch.route.shouldRevalidate) {
    let routeChoice = loaderMatch.route.shouldRevalidate(arg);
    if (typeof routeChoice === "boolean") {
      return routeChoice;
    }
  }
  return arg.defaultShouldRevalidate;
}
function patchRoutesImpl(routeId, children, routesToUse, manifest, mapRouteProperties2) {
  let childrenToPatch;
  if (routeId) {
    let route = manifest[routeId];
    invariant(
      route,
      `No route found to patch children into: routeId = ${routeId}`
    );
    if (!route.children) {
      route.children = [];
    }
    childrenToPatch = route.children;
  } else {
    childrenToPatch = routesToUse;
  }
  let uniqueChildren = children.filter(
    (newRoute) => !childrenToPatch.some(
      (existingRoute) => isSameRoute(newRoute, existingRoute)
    )
  );
  let newRoutes = convertRoutesToDataRoutes(
    uniqueChildren,
    mapRouteProperties2,
    [routeId || "_", "patch", String(childrenToPatch?.length || "0")],
    manifest
  );
  childrenToPatch.push(...newRoutes);
}
function isSameRoute(newRoute, existingRoute) {
  if ("id" in newRoute && "id" in existingRoute && newRoute.id === existingRoute.id) {
    return true;
  }
  if (!(newRoute.index === existingRoute.index && newRoute.path === existingRoute.path && newRoute.caseSensitive === existingRoute.caseSensitive)) {
    return false;
  }
  if ((!newRoute.children || newRoute.children.length === 0) && (!existingRoute.children || existingRoute.children.length === 0)) {
    return true;
  }
  return newRoute.children.every(
    (aChild, i) => existingRoute.children?.some((bChild) => isSameRoute(aChild, bChild))
  );
}
var lazyRoutePropertyCache = /* @__PURE__ */ new WeakMap();
var loadLazyRouteProperty = ({
  key,
  route,
  manifest,
  mapRouteProperties: mapRouteProperties2
}) => {
  let routeToUpdate = manifest[route.id];
  invariant(routeToUpdate, "No route found in manifest");
  if (!routeToUpdate.lazy || typeof routeToUpdate.lazy !== "object") {
    return;
  }
  let lazyFn = routeToUpdate.lazy[key];
  if (!lazyFn) {
    return;
  }
  let cache = lazyRoutePropertyCache.get(routeToUpdate);
  if (!cache) {
    cache = {};
    lazyRoutePropertyCache.set(routeToUpdate, cache);
  }
  let cachedPromise = cache[key];
  if (cachedPromise) {
    return cachedPromise;
  }
  let propertyPromise = (async () => {
    let isUnsupported = isUnsupportedLazyRouteObjectKey(key);
    let staticRouteValue = routeToUpdate[key];
    let isStaticallyDefined = staticRouteValue !== void 0 && key !== "hasErrorBoundary";
    if (isUnsupported) {
      warning(
        !isUnsupported,
        "Route property " + key + " is not a supported lazy route property. This property will be ignored."
      );
      cache[key] = Promise.resolve();
    } else if (isStaticallyDefined) {
      warning(
        false,
        `Route "${routeToUpdate.id}" has a static property "${key}" defined. The lazy property will be ignored.`
      );
    } else {
      let value = await lazyFn();
      if (value != null) {
        Object.assign(routeToUpdate, { [key]: value });
        Object.assign(routeToUpdate, mapRouteProperties2(routeToUpdate));
      }
    }
    if (typeof routeToUpdate.lazy === "object") {
      routeToUpdate.lazy[key] = void 0;
      if (Object.values(routeToUpdate.lazy).every((value) => value === void 0)) {
        routeToUpdate.lazy = void 0;
      }
    }
  })();
  cache[key] = propertyPromise;
  return propertyPromise;
};
var lazyRouteFunctionCache = /* @__PURE__ */ new WeakMap();
function loadLazyRoute(route, type, manifest, mapRouteProperties2) {
  let routeToUpdate = manifest[route.id];
  invariant(routeToUpdate, "No route found in manifest");
  if (!route.lazy) {
    return {
      lazyRoutePromise: void 0,
      lazyHandlerPromise: void 0
    };
  }
  if (typeof route.lazy === "function") {
    let cachedPromise = lazyRouteFunctionCache.get(routeToUpdate);
    if (cachedPromise) {
      return {
        lazyRoutePromise: cachedPromise,
        lazyHandlerPromise: cachedPromise
      };
    }
    let lazyRoutePromise2 = (async () => {
      invariant(
        typeof route.lazy === "function",
        "No lazy route function found"
      );
      let lazyRoute = await route.lazy();
      let routeUpdates = {};
      for (let lazyRouteProperty in lazyRoute) {
        let lazyValue = lazyRoute[lazyRouteProperty];
        if (lazyValue === void 0) {
          continue;
        }
        let isUnsupported = isUnsupportedLazyRouteFunctionKey(lazyRouteProperty);
        let staticRouteValue = routeToUpdate[lazyRouteProperty];
        let isStaticallyDefined = staticRouteValue !== void 0 && // This property isn't static since it should always be updated based
        // on the route updates
        lazyRouteProperty !== "hasErrorBoundary";
        if (isUnsupported) {
          warning(
            !isUnsupported,
            "Route property " + lazyRouteProperty + " is not a supported property to be returned from a lazy route function. This property will be ignored."
          );
        } else if (isStaticallyDefined) {
          warning(
            !isStaticallyDefined,
            `Route "${routeToUpdate.id}" has a static property "${lazyRouteProperty}" defined but its lazy function is also returning a value for this property. The lazy route property "${lazyRouteProperty}" will be ignored.`
          );
        } else {
          routeUpdates[lazyRouteProperty] = lazyValue;
        }
      }
      Object.assign(routeToUpdate, routeUpdates);
      Object.assign(routeToUpdate, {
        // To keep things framework agnostic, we use the provided `mapRouteProperties`
        // function to set the framework-aware properties (`element`/`hasErrorBoundary`)
        // since the logic will differ between frameworks.
        ...mapRouteProperties2(routeToUpdate),
        lazy: void 0
      });
    })();
    lazyRouteFunctionCache.set(routeToUpdate, lazyRoutePromise2);
    return {
      lazyRoutePromise: lazyRoutePromise2,
      lazyHandlerPromise: lazyRoutePromise2
    };
  }
  let lazyKeys = Object.keys(route.lazy);
  let lazyPropertyPromises = [];
  let lazyHandlerPromise = void 0;
  for (let key of lazyKeys) {
    let promise = loadLazyRouteProperty({
      key,
      route,
      manifest,
      mapRouteProperties: mapRouteProperties2
    });
    if (promise) {
      lazyPropertyPromises.push(promise);
      if (key === type) {
        lazyHandlerPromise = promise;
      }
    }
  }
  let lazyRoutePromise = Promise.all(lazyPropertyPromises).then(() => {
  });
  return {
    lazyRoutePromise,
    lazyHandlerPromise
  };
}
function isNonNullable(value) {
  return value !== void 0;
}
function loadLazyMiddlewareForMatches(matches, manifest, mapRouteProperties2) {
  let promises = matches.map(({ route }) => {
    if (typeof route.lazy !== "object" || !route.lazy.unstable_middleware) {
      return void 0;
    }
    return loadLazyRouteProperty({
      key: "unstable_middleware",
      route,
      manifest,
      mapRouteProperties: mapRouteProperties2
    });
  }).filter(isNonNullable);
  return promises.length > 0 ? Promise.all(promises) : void 0;
}
async function defaultDataStrategy(args) {
  let matchesToLoad = args.matches.filter((m) => m.shouldLoad);
  let keyedResults = {};
  let results = await Promise.all(matchesToLoad.map((m) => m.resolve()));
  results.forEach((result, i) => {
    keyedResults[matchesToLoad[i].route.id] = result;
  });
  return keyedResults;
}
async function defaultDataStrategyWithMiddleware(args) {
  if (!args.matches.some((m) => m.route.unstable_middleware)) {
    return defaultDataStrategy(args);
  }
  return runMiddlewarePipeline(
    args,
    false,
    () => defaultDataStrategy(args),
    (error, routeId) => ({ [routeId]: { type: "error", result: error } })
  );
}
async function runMiddlewarePipeline(args, propagateResult, handler, errorHandler) {
  let { matches, request, params, context } = args;
  let middlewareState = {
    handlerResult: void 0
  };
  try {
    let tuples = matches.flatMap(
      (m) => m.route.unstable_middleware ? m.route.unstable_middleware.map((fn) => [m.route.id, fn]) : []
    );
    let result = await callRouteMiddleware(
      { request, params, context },
      tuples,
      propagateResult,
      middlewareState,
      handler
    );
    return propagateResult ? result : middlewareState.handlerResult;
  } catch (e) {
    if (!middlewareState.middlewareError) {
      throw e;
    }
    let result = await errorHandler(
      middlewareState.middlewareError.error,
      middlewareState.middlewareError.routeId
    );
    if (!middlewareState.handlerResult) {
      return result;
    }
    return Object.assign(middlewareState.handlerResult, result);
  }
}
async function callRouteMiddleware(args, middlewares, propagateResult, middlewareState, handler, idx = 0) {
  let { request } = args;
  if (request.signal.aborted) {
    if (request.signal.reason) {
      throw request.signal.reason;
    }
    throw new Error(
      `Request aborted without an \`AbortSignal.reason\`: ${request.method} ${request.url}`
    );
  }
  let tuple = middlewares[idx];
  if (!tuple) {
    middlewareState.handlerResult = await handler();
    return middlewareState.handlerResult;
  }
  let [routeId, middleware] = tuple;
  let nextCalled = false;
  let nextResult = void 0;
  let next = async () => {
    if (nextCalled) {
      throw new Error("You may only call `next()` once per middleware");
    }
    nextCalled = true;
    await callRouteMiddleware(
      args,
      middlewares,
      propagateResult,
      middlewareState,
      handler,
      idx + 1
    );
  };
  try {
    let result = await middleware(
      {
        request: args.request,
        params: args.params,
        context: args.context
      },
      next
    );
    if (nextCalled) {
      if (result === void 0) {
        return nextResult;
      } else {
        return result;
      }
    } else {
      return next();
    }
  } catch (error) {
    if (!middlewareState.middlewareError) {
      middlewareState.middlewareError = { routeId, error };
    } else if (middlewareState.middlewareError.error !== error) {
      middlewareState.middlewareError = { routeId, error };
    }
    throw error;
  }
}
async function callDataStrategyImpl(dataStrategyImpl, type, request, matchesToLoad, matches, fetcherKey, manifest, mapRouteProperties2, scopedContext) {
  let loadMiddlewarePromise = loadLazyMiddlewareForMatches(
    matches,
    manifest,
    mapRouteProperties2
  );
  let lazyRoutePromises = matches.map(
    (m) => loadLazyRoute(m.route, type, manifest, mapRouteProperties2)
  );
  if (loadMiddlewarePromise) {
    await loadMiddlewarePromise;
  }
  let dsMatches = matches.map((match, i) => {
    let { lazyRoutePromise, lazyHandlerPromise } = lazyRoutePromises[i];
    let shouldLoad = matchesToLoad.some((m) => m.route.id === match.route.id);
    let resolve = async (handlerOverride) => {
      if (handlerOverride && request.method === "GET" && (match.route.lazy || match.route.loader)) {
        shouldLoad = true;
      }
      return shouldLoad ? callLoaderOrAction({
        type,
        request,
        match,
        lazyHandlerPromise,
        lazyRoutePromise,
        handlerOverride,
        scopedContext
      }) : Promise.resolve({ type: "data", result: void 0 });
    };
    return {
      ...match,
      shouldLoad,
      resolve
    };
  });
  let results = await dataStrategyImpl({
    matches: dsMatches,
    request,
    params: matches[0].params,
    fetcherKey,
    context: scopedContext
  });
  let allLazyRoutePromises = lazyRoutePromises.flatMap(
    (promiseMap) => Object.values(promiseMap).filter(isNonNullable)
  );
  try {
    await Promise.all(allLazyRoutePromises);
  } catch (e) {
  }
  return results;
}
async function callLoaderOrAction({
  type,
  request,
  match,
  lazyHandlerPromise,
  lazyRoutePromise,
  handlerOverride,
  scopedContext
}) {
  let result;
  let onReject;
  let runHandler = (handler) => {
    let reject;
    let abortPromise = new Promise((_, r) => reject = r);
    onReject = () => reject();
    request.signal.addEventListener("abort", onReject);
    let actualHandler = (ctx) => {
      if (typeof handler !== "function") {
        return Promise.reject(
          new Error(
            `You cannot call the handler for a route which defines a boolean "${type}" [routeId: ${match.route.id}]`
          )
        );
      }
      return handler(
        {
          request,
          params: match.params,
          context: scopedContext
        },
        ...ctx !== void 0 ? [ctx] : []
      );
    };
    let handlerPromise = (async () => {
      try {
        let val = await (handlerOverride ? handlerOverride((ctx) => actualHandler(ctx)) : actualHandler());
        return { type: "data", result: val };
      } catch (e) {
        return { type: "error", result: e };
      }
    })();
    return Promise.race([handlerPromise, abortPromise]);
  };
  try {
    let handler = match.route[type];
    if (lazyHandlerPromise || lazyRoutePromise) {
      if (handler) {
        let handlerError;
        let [value] = await Promise.all([
          // If the handler throws, don't let it immediately bubble out,
          // since we need to let the lazy() execution finish so we know if this
          // route has a boundary that can handle the error
          runHandler(handler).catch((e) => {
            handlerError = e;
          }),
          // Ensure all lazy route promises are resolved before continuing
          lazyHandlerPromise,
          lazyRoutePromise
        ]);
        if (handlerError !== void 0) {
          throw handlerError;
        }
        result = value;
      } else {
        await lazyHandlerPromise;
        handler = match.route[type];
        if (handler) {
          [result] = await Promise.all([runHandler(handler), lazyRoutePromise]);
        } else if (type === "action") {
          let url = new URL(request.url);
          let pathname = url.pathname + url.search;
          throw getInternalRouterError(405, {
            method: request.method,
            pathname,
            routeId: match.route.id
          });
        } else {
          return { type: "data", result: void 0 };
        }
      }
    } else if (!handler) {
      let url = new URL(request.url);
      let pathname = url.pathname + url.search;
      throw getInternalRouterError(404, {
        pathname
      });
    } else {
      result = await runHandler(handler);
    }
  } catch (e) {
    return { type: "error", result: e };
  } finally {
    if (onReject) {
      request.signal.removeEventListener("abort", onReject);
    }
  }
  return result;
}
async function convertDataStrategyResultToDataResult(dataStrategyResult) {
  let { result, type } = dataStrategyResult;
  if (isResponse(result)) {
    let data2;
    try {
      let contentType = result.headers.get("Content-Type");
      if (contentType && /\bapplication\/json\b/.test(contentType)) {
        if (result.body == null) {
          data2 = null;
        } else {
          data2 = await result.json();
        }
      } else {
        data2 = await result.text();
      }
    } catch (e) {
      return { type: "error", error: e };
    }
    if (type === "error") {
      return {
        type: "error",
        error: new ErrorResponseImpl(result.status, result.statusText, data2),
        statusCode: result.status,
        headers: result.headers
      };
    }
    return {
      type: "data",
      data: data2,
      statusCode: result.status,
      headers: result.headers
    };
  }
  if (type === "error") {
    if (isDataWithResponseInit(result)) {
      if (result.data instanceof Error) {
        return {
          type: "error",
          error: result.data,
          statusCode: result.init?.status,
          headers: result.init?.headers ? new Headers(result.init.headers) : void 0
        };
      }
      return {
        type: "error",
        error: new ErrorResponseImpl(
          result.init?.status || 500,
          void 0,
          result.data
        ),
        statusCode: isRouteErrorResponse(result) ? result.status : void 0,
        headers: result.init?.headers ? new Headers(result.init.headers) : void 0
      };
    }
    return {
      type: "error",
      error: result,
      statusCode: isRouteErrorResponse(result) ? result.status : void 0
    };
  }
  if (isDataWithResponseInit(result)) {
    return {
      type: "data",
      data: result.data,
      statusCode: result.init?.status,
      headers: result.init?.headers ? new Headers(result.init.headers) : void 0
    };
  }
  return { type: "data", data: result };
}
function normalizeRelativeRoutingRedirectResponse(response, request, routeId, matches, basename) {
  let location = response.headers.get("Location");
  invariant(
    location,
    "Redirects returned/thrown from loaders/actions must have a Location header"
  );
  if (!ABSOLUTE_URL_REGEX.test(location)) {
    let trimmedMatches = matches.slice(
      0,
      matches.findIndex((m) => m.route.id === routeId) + 1
    );
    location = normalizeTo(
      new URL(request.url),
      trimmedMatches,
      basename,
      location
    );
    response.headers.set("Location", location);
  }
  return response;
}
function normalizeRedirectLocation(location, currentUrl, basename) {
  if (ABSOLUTE_URL_REGEX.test(location)) {
    let normalizedLocation = location;
    let url = normalizedLocation.startsWith("//") ? new URL(currentUrl.protocol + normalizedLocation) : new URL(normalizedLocation);
    let isSameBasename = stripBasename(url.pathname, basename) != null;
    if (url.origin === currentUrl.origin && isSameBasename) {
      return url.pathname + url.search + url.hash;
    }
  }
  return location;
}
function createClientSideRequest(history, location, signal, submission) {
  let url = history.createURL(stripHashFromPath(location)).toString();
  let init = { signal };
  if (submission && isMutationMethod(submission.formMethod)) {
    let { formMethod, formEncType } = submission;
    init.method = formMethod.toUpperCase();
    if (formEncType === "application/json") {
      init.headers = new Headers({ "Content-Type": formEncType });
      init.body = JSON.stringify(submission.json);
    } else if (formEncType === "text/plain") {
      init.body = submission.text;
    } else if (formEncType === "application/x-www-form-urlencoded" && submission.formData) {
      init.body = convertFormDataToSearchParams(submission.formData);
    } else {
      init.body = submission.formData;
    }
  }
  return new Request(url, init);
}
function convertFormDataToSearchParams(formData) {
  let searchParams = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    searchParams.append(key, typeof value === "string" ? value : value.name);
  }
  return searchParams;
}
function convertSearchParamsToFormData(searchParams) {
  let formData = new FormData();
  for (let [key, value] of searchParams.entries()) {
    formData.append(key, value);
  }
  return formData;
}
function processRouteLoaderData(matches, results, pendingActionResult, isStaticHandler = false, skipLoaderErrorBubbling = false) {
  let loaderData = {};
  let errors = null;
  let statusCode;
  let foundError = false;
  let loaderHeaders = {};
  let pendingError = pendingActionResult && isErrorResult(pendingActionResult[1]) ? pendingActionResult[1].error : void 0;
  matches.forEach((match) => {
    if (!(match.route.id in results)) {
      return;
    }
    let id = match.route.id;
    let result = results[id];
    invariant(
      !isRedirectResult(result),
      "Cannot handle redirect results in processLoaderData"
    );
    if (isErrorResult(result)) {
      let error = result.error;
      if (pendingError !== void 0) {
        error = pendingError;
        pendingError = void 0;
      }
      errors = errors || {};
      if (skipLoaderErrorBubbling) {
        errors[id] = error;
      } else {
        let boundaryMatch = findNearestBoundary(matches, id);
        if (errors[boundaryMatch.route.id] == null) {
          errors[boundaryMatch.route.id] = error;
        }
      }
      if (!isStaticHandler) {
        loaderData[id] = ResetLoaderDataSymbol;
      }
      if (!foundError) {
        foundError = true;
        statusCode = isRouteErrorResponse(result.error) ? result.error.status : 500;
      }
      if (result.headers) {
        loaderHeaders[id] = result.headers;
      }
    } else {
      loaderData[id] = result.data;
      if (result.statusCode && result.statusCode !== 200 && !foundError) {
        statusCode = result.statusCode;
      }
      if (result.headers) {
        loaderHeaders[id] = result.headers;
      }
    }
  });
  if (pendingError !== void 0 && pendingActionResult) {
    errors = { [pendingActionResult[0]]: pendingError };
    loaderData[pendingActionResult[0]] = void 0;
  }
  return {
    loaderData,
    errors,
    statusCode: statusCode || 200,
    loaderHeaders
  };
}
function processLoaderData(state, matches, results, pendingActionResult, revalidatingFetchers, fetcherResults) {
  let { loaderData, errors } = processRouteLoaderData(
    matches,
    results,
    pendingActionResult
  );
  revalidatingFetchers.forEach((rf) => {
    let { key, match, controller } = rf;
    let result = fetcherResults[key];
    invariant(result, "Did not find corresponding fetcher result");
    if (controller && controller.signal.aborted) {
      return;
    } else if (isErrorResult(result)) {
      let boundaryMatch = findNearestBoundary(state.matches, match?.route.id);
      if (!(errors && errors[boundaryMatch.route.id])) {
        errors = {
          ...errors,
          [boundaryMatch.route.id]: result.error
        };
      }
      state.fetchers.delete(key);
    } else if (isRedirectResult(result)) {
      invariant(false, "Unhandled fetcher revalidation redirect");
    } else {
      let doneFetcher = getDoneFetcher(result.data);
      state.fetchers.set(key, doneFetcher);
    }
  });
  return { loaderData, errors };
}
function mergeLoaderData(loaderData, newLoaderData, matches, errors) {
  let mergedLoaderData = Object.entries(newLoaderData).filter(([, v]) => v !== ResetLoaderDataSymbol).reduce((merged, [k, v]) => {
    merged[k] = v;
    return merged;
  }, {});
  for (let match of matches) {
    let id = match.route.id;
    if (!newLoaderData.hasOwnProperty(id) && loaderData.hasOwnProperty(id) && match.route.loader) {
      mergedLoaderData[id] = loaderData[id];
    }
    if (errors && errors.hasOwnProperty(id)) {
      break;
    }
  }
  return mergedLoaderData;
}
function getActionDataForCommit(pendingActionResult) {
  if (!pendingActionResult) {
    return {};
  }
  return isErrorResult(pendingActionResult[1]) ? {
    // Clear out prior actionData on errors
    actionData: {}
  } : {
    actionData: {
      [pendingActionResult[0]]: pendingActionResult[1].data
    }
  };
}
function findNearestBoundary(matches, routeId) {
  let eligibleMatches = routeId ? matches.slice(0, matches.findIndex((m) => m.route.id === routeId) + 1) : [...matches];
  return eligibleMatches.reverse().find((m) => m.route.hasErrorBoundary === true) || matches[0];
}
function getShortCircuitMatches(routes) {
  let route = routes.length === 1 ? routes[0] : routes.find((r) => r.index || !r.path || r.path === "/") || {
    id: `__shim-error-route__`
  };
  return {
    matches: [
      {
        params: {},
        pathname: "",
        pathnameBase: "",
        route
      }
    ],
    route
  };
}
function getInternalRouterError(status, {
  pathname,
  routeId,
  method,
  type,
  message
} = {}) {
  let statusText = "Unknown Server Error";
  let errorMessage = "Unknown @remix-run/router error";
  if (status === 400) {
    statusText = "Bad Request";
    if (method && pathname && routeId) {
      errorMessage = `You made a ${method} request to "${pathname}" but did not provide a \`loader\` for route "${routeId}", so there is no way to handle the request.`;
    } else if (type === "invalid-body") {
      errorMessage = "Unable to encode submission body";
    }
  } else if (status === 403) {
    statusText = "Forbidden";
    errorMessage = `Route "${routeId}" does not match URL "${pathname}"`;
  } else if (status === 404) {
    statusText = "Not Found";
    errorMessage = `No route matches URL "${pathname}"`;
  } else if (status === 405) {
    statusText = "Method Not Allowed";
    if (method && pathname && routeId) {
      errorMessage = `You made a ${method.toUpperCase()} request to "${pathname}" but did not provide an \`action\` for route "${routeId}", so there is no way to handle the request.`;
    } else if (method) {
      errorMessage = `Invalid request method "${method.toUpperCase()}"`;
    }
  }
  return new ErrorResponseImpl(
    status || 500,
    statusText,
    new Error(errorMessage),
    true
  );
}
function findRedirect(results) {
  let entries = Object.entries(results);
  for (let i = entries.length - 1; i >= 0; i--) {
    let [key, result] = entries[i];
    if (isRedirectResult(result)) {
      return { key, result };
    }
  }
}
function stripHashFromPath(path) {
  let parsedPath = typeof path === "string" ? parsePath(path) : path;
  return createPath({ ...parsedPath, hash: "" });
}
function isHashChangeOnly(a, b) {
  if (a.pathname !== b.pathname || a.search !== b.search) {
    return false;
  }
  if (a.hash === "") {
    return b.hash !== "";
  } else if (a.hash === b.hash) {
    return true;
  } else if (b.hash !== "") {
    return true;
  }
  return false;
}
function isRedirectDataStrategyResult(result) {
  return isResponse(result.result) && redirectStatusCodes.has(result.result.status);
}
function isErrorResult(result) {
  return result.type === "error";
}
function isRedirectResult(result) {
  return (result && result.type) === "redirect";
}
function isDataWithResponseInit(value) {
  return typeof value === "object" && value != null && "type" in value && "data" in value && "init" in value && value.type === "DataWithResponseInit";
}
function isResponse(value) {
  return value != null && typeof value.status === "number" && typeof value.statusText === "string" && typeof value.headers === "object" && typeof value.body !== "undefined";
}
function isValidMethod(method) {
  return validRequestMethods.has(method.toUpperCase());
}
function isMutationMethod(method) {
  return validMutationMethods.has(method.toUpperCase());
}
function hasNakedIndexQuery(search) {
  return new URLSearchParams(search).getAll("index").some((v) => v === "");
}
function getTargetMatch(matches, location) {
  let search = typeof location === "string" ? parsePath(location).search : location.search;
  if (matches[matches.length - 1].route.index && hasNakedIndexQuery(search || "")) {
    return matches[matches.length - 1];
  }
  let pathMatches = getPathContributingMatches(matches);
  return pathMatches[pathMatches.length - 1];
}
function getSubmissionFromNavigation(navigation) {
  let { formMethod, formAction, formEncType, text, formData, json } = navigation;
  if (!formMethod || !formAction || !formEncType) {
    return;
  }
  if (text != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: void 0,
      json: void 0,
      text
    };
  } else if (formData != null) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData,
      json: void 0,
      text: void 0
    };
  } else if (json !== void 0) {
    return {
      formMethod,
      formAction,
      formEncType,
      formData: void 0,
      json,
      text: void 0
    };
  }
}
function getLoadingNavigation(location, submission) {
  if (submission) {
    let navigation = {
      state: "loading",
      location,
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text
    };
    return navigation;
  } else {
    let navigation = {
      state: "loading",
      location,
      formMethod: void 0,
      formAction: void 0,
      formEncType: void 0,
      formData: void 0,
      json: void 0,
      text: void 0
    };
    return navigation;
  }
}
function getSubmittingNavigation(location, submission) {
  let navigation = {
    state: "submitting",
    location,
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text
  };
  return navigation;
}
function getLoadingFetcher(submission, data2) {
  if (submission) {
    let fetcher = {
      state: "loading",
      formMethod: submission.formMethod,
      formAction: submission.formAction,
      formEncType: submission.formEncType,
      formData: submission.formData,
      json: submission.json,
      text: submission.text,
      data: data2
    };
    return fetcher;
  } else {
    let fetcher = {
      state: "loading",
      formMethod: void 0,
      formAction: void 0,
      formEncType: void 0,
      formData: void 0,
      json: void 0,
      text: void 0,
      data: data2
    };
    return fetcher;
  }
}
function getSubmittingFetcher(submission, existingFetcher) {
  let fetcher = {
    state: "submitting",
    formMethod: submission.formMethod,
    formAction: submission.formAction,
    formEncType: submission.formEncType,
    formData: submission.formData,
    json: submission.json,
    text: submission.text,
    data: existingFetcher ? existingFetcher.data : void 0
  };
  return fetcher;
}
function getDoneFetcher(data2) {
  let fetcher = {
    state: "idle",
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
    data: data2
  };
  return fetcher;
}
function restoreAppliedTransitions(_window, transitions) {
  try {
    let sessionPositions = _window.sessionStorage.getItem(
      TRANSITIONS_STORAGE_KEY
    );
    if (sessionPositions) {
      let json = JSON.parse(sessionPositions);
      for (let [k, v] of Object.entries(json || {})) {
        if (v && Array.isArray(v)) {
          transitions.set(k, new Set(v || []));
        }
      }
    }
  } catch (e) {
  }
}
function persistAppliedTransitions(_window, transitions) {
  if (transitions.size > 0) {
    let json = {};
    for (let [k, v] of transitions) {
      json[k] = [...v];
    }
    try {
      _window.sessionStorage.setItem(
        TRANSITIONS_STORAGE_KEY,
        JSON.stringify(json)
      );
    } catch (error) {
      warning(
        false,
        `Failed to save applied view transitions in sessionStorage (${error}).`
      );
    }
  }
}
function createDeferred() {
  let resolve;
  let reject;
  let promise = new Promise((res, rej) => {
    resolve = async (val) => {
      res(val);
      try {
        await promise;
      } catch (e) {
      }
    };
    reject = async (error) => {
      rej(error);
      try {
        await promise;
      } catch (e) {
      }
    };
  });
  return {
    promise,
    //@ts-ignore
    resolve,
    //@ts-ignore
    reject
  };
}
var DataRouterContext = dashboard__loadShare__react__loadShare__.createContext(null);
DataRouterContext.displayName = "DataRouter";
var DataRouterStateContext = dashboard__loadShare__react__loadShare__.createContext(null);
DataRouterStateContext.displayName = "DataRouterState";
var ViewTransitionContext = dashboard__loadShare__react__loadShare__.createContext({
  isTransitioning: false
});
ViewTransitionContext.displayName = "ViewTransition";
var FetchersContext = dashboard__loadShare__react__loadShare__.createContext(
  /* @__PURE__ */ new Map()
);
FetchersContext.displayName = "Fetchers";
var AwaitContext = dashboard__loadShare__react__loadShare__.createContext(null);
AwaitContext.displayName = "Await";
var NavigationContext = dashboard__loadShare__react__loadShare__.createContext(
  null
);
NavigationContext.displayName = "Navigation";
var LocationContext = dashboard__loadShare__react__loadShare__.createContext(
  null
);
LocationContext.displayName = "Location";
var RouteContext = dashboard__loadShare__react__loadShare__.createContext({
  outlet: null,
  matches: [],
  isDataRoute: false
});
RouteContext.displayName = "Route";
var RouteErrorContext = dashboard__loadShare__react__loadShare__.createContext(null);
RouteErrorContext.displayName = "RouteError";
function useHref(to, { relative } = {}) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useHref() may be used only in the context of a <Router> component.`
  );
  let { basename, navigator: navigator2 } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
  let { hash, pathname, search } = useResolvedPath(to, { relative });
  let joinedPathname = pathname;
  if (basename !== "/") {
    joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
  }
  return navigator2.createHref({ pathname: joinedPathname, search, hash });
}
function useInRouterContext() {
  return dashboard__loadShare__react__loadShare__.useContext(LocationContext) != null;
}
function useLocation() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useLocation() may be used only in the context of a <Router> component.`
  );
  return dashboard__loadShare__react__loadShare__.useContext(LocationContext).location;
}
var navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
function useIsomorphicLayoutEffect(cb) {
  let isStatic = dashboard__loadShare__react__loadShare__.useContext(NavigationContext).static;
  if (!isStatic) {
    dashboard__loadShare__react__loadShare__.useLayoutEffect(cb);
  }
}
function useNavigate() {
  let { isDataRoute } = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useNavigate() may be used only in the context of a <Router> component.`
  );
  let dataRouterContext = dashboard__loadShare__react__loadShare__.useContext(DataRouterContext);
  let { basename, navigator: navigator2 } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
  let { matches } = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  let activeRef = dashboard__loadShare__react__loadShare__.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = dashboard__loadShare__react__loadShare__.useCallback(
    (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        navigator2.go(to);
        return;
      }
      let path = resolveTo(
        to,
        JSON.parse(routePathnamesJson),
        locationPathname,
        options.relative === "path"
      );
      if (dataRouterContext == null && basename !== "/") {
        path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
      }
      (!!options.replace ? navigator2.replace : navigator2.push)(
        path,
        options.state,
        options
      );
    },
    [
      basename,
      navigator2,
      routePathnamesJson,
      locationPathname,
      dataRouterContext
    ]
  );
  return navigate;
}
dashboard__loadShare__react__loadShare__.createContext(null);
function useResolvedPath(to, { relative } = {}) {
  let { matches } = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  let { pathname: locationPathname } = useLocation();
  let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
  return dashboard__loadShare__react__loadShare__.useMemo(
    () => resolveTo(
      to,
      JSON.parse(routePathnamesJson),
      locationPathname,
      relative === "path"
    ),
    [to, routePathnamesJson, locationPathname, relative]
  );
}
function useRoutesImpl(routes, locationArg, dataRouterState, future) {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );
  let { navigator: navigator2, static: isStatic } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
  let { matches: parentMatches } = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  let parentPathname = routeMatch ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;
  {
    let parentPath = parentRoute && parentRoute.path || "";
    warningOnce(
      parentPathname,
      !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`
    );
  }
  let locationFromContext = useLocation();
  let location;
  {
    location = locationFromContext;
  }
  let pathname = location.pathname || "/";
  let remainingPathname = pathname;
  if (parentPathnameBase !== "/") {
    let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
    let segments = pathname.replace(/^\//, "").split("/");
    remainingPathname = "/" + segments.slice(parentSegments.length).join("/");
  }
  let matches = !isStatic && dataRouterState && dataRouterState.matches && dataRouterState.matches.length > 0 ? dataRouterState.matches : matchRoutes(routes, { pathname: remainingPathname });
  {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );
    warning(
      matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`
    );
  }
  let renderedMatches = _renderMatches(
    matches && matches.map(
      (match) => Object.assign({}, match, {
        params: Object.assign({}, parentParams, match.params),
        pathname: joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes
          navigator2.encodeLocation ? navigator2.encodeLocation(match.pathname).pathname : match.pathname
        ]),
        pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([
          parentPathnameBase,
          // Re-encode pathnames that were decoded inside matchRoutes
          navigator2.encodeLocation ? navigator2.encodeLocation(match.pathnameBase).pathname : match.pathnameBase
        ])
      })
    ),
    parentMatches,
    dataRouterState,
    future
  );
  return renderedMatches;
}
function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };
  let devInfo = null;
  {
    console.error(
      "Error handled by React Router default ErrorBoundary:",
      error
    );
    devInfo = /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
var defaultErrorElement = /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(DefaultErrorComponent, null);
var RenderErrorBoundary = class extends dashboard__loadShare__react__loadShare__.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error
    };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation
      };
    }
    return {
      error: props.error !== void 0 ? props.error : state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error(
      "React Router caught the following error during render",
      error,
      errorInfo
    );
  }
  render() {
    return this.state.error !== void 0 ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      RouteErrorContext.Provider,
      {
        value: this.state.error,
        children: this.props.component
      }
    )) : this.props.children;
  }
};
function RenderedRoute({ routeContext, match, children }) {
  let dataRouterContext = dashboard__loadShare__react__loadShare__.useContext(DataRouterContext);
  if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterState = null, future = null) {
  if (matches == null) {
    if (!dataRouterState) {
      return null;
    }
    if (dataRouterState.errors) {
      matches = dataRouterState.matches;
    } else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) {
      matches = dataRouterState.matches;
    } else {
      return null;
    }
  }
  let renderedMatches = matches;
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id] !== void 0
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        errors
      ).join(",")}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }
  let renderFallback = false;
  let fallbackIndex = -1;
  if (dataRouterState) {
    for (let i = 0; i < renderedMatches.length; i++) {
      let match = renderedMatches[i];
      if (match.route.HydrateFallback || match.route.hydrateFallbackElement) {
        fallbackIndex = i;
      }
      if (match.route.id) {
        let { loaderData, errors: errors2 } = dataRouterState;
        let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
        if (match.route.lazy || needsToRunLoader) {
          renderFallback = true;
          if (fallbackIndex >= 0) {
            renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
          } else {
            renderedMatches = [renderedMatches[0]];
          }
          break;
        }
      }
    }
  }
  return renderedMatches.reduceRight((outlet, match, index) => {
    let error;
    let shouldRenderHydrateFallback = false;
    let errorElement = null;
    let hydrateFallbackElement = null;
    if (dataRouterState) {
      error = errors && match.route.id ? errors[match.route.id] : void 0;
      errorElement = match.route.errorElement || defaultErrorElement;
      if (renderFallback) {
        if (fallbackIndex < 0 && index === 0) {
          warningOnce(
            "route-fallback",
            false,
            "No `HydrateFallback` element provided to render during initial hydration"
          );
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = null;
        } else if (fallbackIndex === index) {
          shouldRenderHydrateFallback = true;
          hydrateFallbackElement = match.route.hydrateFallbackElement || null;
        }
      }
    }
    let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children;
      if (error) {
        children = errorElement;
      } else if (shouldRenderHydrateFallback) {
        children = hydrateFallbackElement;
      } else if (match.route.Component) {
        children = /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(match.route.Component, null);
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
        RenderedRoute,
        {
          match,
          routeContext: {
            outlet,
            matches: matches2,
            isDataRoute: dataRouterState != null
          },
          children
        }
      );
    };
    return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      RenderErrorBoundary,
      {
        location: dataRouterState.location,
        revalidation: dataRouterState.revalidation,
        component: errorElement,
        error,
        children: getChildren(),
        routeContext: { outlet: null, matches: matches2, isDataRoute: true }
      }
    ) : getChildren();
  }, null);
}
function getDataRouterConsoleError(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
  let ctx = dashboard__loadShare__react__loadShare__.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError(hookName));
  return ctx;
}
function useDataRouterState(hookName) {
  let state = dashboard__loadShare__react__loadShare__.useContext(DataRouterStateContext);
  invariant(state, getDataRouterConsoleError(hookName));
  return state;
}
function useRouteContext(hookName) {
  let route = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  invariant(route, getDataRouterConsoleError(hookName));
  return route;
}
function useCurrentRouteId(hookName) {
  let route = useRouteContext(hookName);
  let thisRoute = route.matches[route.matches.length - 1];
  invariant(
    thisRoute.route.id,
    `${hookName} can only be used on routes that contain a unique "id"`
  );
  return thisRoute.route.id;
}
function useRouteId() {
  return useCurrentRouteId(
    "useRouteId"
    /* UseRouteId */
  );
}
function useRouteError() {
  let error = dashboard__loadShare__react__loadShare__.useContext(RouteErrorContext);
  let state = useDataRouterState(
    "useRouteError"
    /* UseRouteError */
  );
  let routeId = useCurrentRouteId(
    "useRouteError"
    /* UseRouteError */
  );
  if (error !== void 0) {
    return error;
  }
  return state.errors?.[routeId];
}
function useNavigateStable() {
  let { router } = useDataRouterContext(
    "useNavigate"
    /* UseNavigateStable */
  );
  let id = useCurrentRouteId(
    "useNavigate"
    /* UseNavigateStable */
  );
  let activeRef = dashboard__loadShare__react__loadShare__.useRef(false);
  useIsomorphicLayoutEffect(() => {
    activeRef.current = true;
  });
  let navigate = dashboard__loadShare__react__loadShare__.useCallback(
    async (to, options = {}) => {
      warning(activeRef.current, navigateEffectWarning);
      if (!activeRef.current) return;
      if (typeof to === "number") {
        router.navigate(to);
      } else {
        await router.navigate(to, { fromRouteId: id, ...options });
      }
    },
    [router, id]
  );
  return navigate;
}
var alreadyWarned = {};
function warningOnce(key, cond, message) {
  if (!cond && !alreadyWarned[key]) {
    alreadyWarned[key] = true;
    warning(false, message);
  }
}
var alreadyWarned2 = {};
function warnOnce(condition, message) {
  if (!condition && !alreadyWarned2[message]) {
    alreadyWarned2[message] = true;
    console.warn(message);
  }
}
function mapRouteProperties(route) {
  let updates = {
    // Note: this check also occurs in createRoutesFromChildren so update
    // there if you change this -- please and thank you!
    hasErrorBoundary: route.hasErrorBoundary || route.ErrorBoundary != null || route.errorElement != null
  };
  if (route.Component) {
    {
      if (route.element) {
        warning(
          false,
          "You should not include both `Component` and `element` on your route - `Component` will be used."
        );
      }
    }
    Object.assign(updates, {
      element: dashboard__loadShare__react__loadShare__.createElement(route.Component),
      Component: void 0
    });
  }
  if (route.HydrateFallback) {
    {
      if (route.hydrateFallbackElement) {
        warning(
          false,
          "You should not include both `HydrateFallback` and `hydrateFallbackElement` on your route - `HydrateFallback` will be used."
        );
      }
    }
    Object.assign(updates, {
      hydrateFallbackElement: dashboard__loadShare__react__loadShare__.createElement(route.HydrateFallback),
      HydrateFallback: void 0
    });
  }
  if (route.ErrorBoundary) {
    {
      if (route.errorElement) {
        warning(
          false,
          "You should not include both `ErrorBoundary` and `errorElement` on your route - `ErrorBoundary` will be used."
        );
      }
    }
    Object.assign(updates, {
      errorElement: dashboard__loadShare__react__loadShare__.createElement(route.ErrorBoundary),
      ErrorBoundary: void 0
    });
  }
  return updates;
}
var Deferred = class {
  constructor() {
    this.status = "pending";
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        if (this.status === "pending") {
          this.status = "resolved";
          resolve(value);
        }
      };
      this.reject = (reason) => {
        if (this.status === "pending") {
          this.status = "rejected";
          reject(reason);
        }
      };
    });
  }
};
function RouterProvider({
  router,
  flushSync: reactDomFlushSyncImpl
}) {
  let [state, setStateImpl] = dashboard__loadShare__react__loadShare__.useState(router.state);
  let [pendingState, setPendingState] = dashboard__loadShare__react__loadShare__.useState();
  let [vtContext, setVtContext] = dashboard__loadShare__react__loadShare__.useState({
    isTransitioning: false
  });
  let [renderDfd, setRenderDfd] = dashboard__loadShare__react__loadShare__.useState();
  let [transition, setTransition] = dashboard__loadShare__react__loadShare__.useState();
  let [interruption, setInterruption] = dashboard__loadShare__react__loadShare__.useState();
  let fetcherData = dashboard__loadShare__react__loadShare__.useRef(/* @__PURE__ */ new Map());
  let setState = dashboard__loadShare__react__loadShare__.useCallback(
    (newState, { deletedFetchers, flushSync, viewTransitionOpts }) => {
      newState.fetchers.forEach((fetcher, key) => {
        if (fetcher.data !== void 0) {
          fetcherData.current.set(key, fetcher.data);
        }
      });
      deletedFetchers.forEach((key) => fetcherData.current.delete(key));
      warnOnce(
        flushSync === false || reactDomFlushSyncImpl != null,
        'You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from "react-router/dom"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.'
      );
      let isViewTransitionAvailable = router.window != null && router.window.document != null && typeof router.window.document.startViewTransition === "function";
      warnOnce(
        viewTransitionOpts == null || isViewTransitionAvailable,
        "You provided the `viewTransition` option to a router update, but you do not appear to be running in a DOM environment as `window.startViewTransition` is not available."
      );
      if (!viewTransitionOpts || !isViewTransitionAvailable) {
        if (reactDomFlushSyncImpl && flushSync) {
          reactDomFlushSyncImpl(() => setStateImpl(newState));
        } else {
          dashboard__loadShare__react__loadShare__.startTransition(() => setStateImpl(newState));
        }
        return;
      }
      if (reactDomFlushSyncImpl && flushSync) {
        reactDomFlushSyncImpl(() => {
          if (transition) {
            renderDfd && renderDfd.resolve();
            transition.skipTransition();
          }
          setVtContext({
            isTransitioning: true,
            flushSync: true,
            currentLocation: viewTransitionOpts.currentLocation,
            nextLocation: viewTransitionOpts.nextLocation
          });
        });
        let t = router.window.document.startViewTransition(() => {
          reactDomFlushSyncImpl(() => setStateImpl(newState));
        });
        t.finished.finally(() => {
          reactDomFlushSyncImpl(() => {
            setRenderDfd(void 0);
            setTransition(void 0);
            setPendingState(void 0);
            setVtContext({ isTransitioning: false });
          });
        });
        reactDomFlushSyncImpl(() => setTransition(t));
        return;
      }
      if (transition) {
        renderDfd && renderDfd.resolve();
        transition.skipTransition();
        setInterruption({
          state: newState,
          currentLocation: viewTransitionOpts.currentLocation,
          nextLocation: viewTransitionOpts.nextLocation
        });
      } else {
        setPendingState(newState);
        setVtContext({
          isTransitioning: true,
          flushSync: false,
          currentLocation: viewTransitionOpts.currentLocation,
          nextLocation: viewTransitionOpts.nextLocation
        });
      }
    },
    [router.window, reactDomFlushSyncImpl, transition, renderDfd]
  );
  dashboard__loadShare__react__loadShare__.useLayoutEffect(() => router.subscribe(setState), [router, setState]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (vtContext.isTransitioning && !vtContext.flushSync) {
      setRenderDfd(new Deferred());
    }
  }, [vtContext]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (renderDfd && pendingState && router.window) {
      let newState = pendingState;
      let renderPromise = renderDfd.promise;
      let transition2 = router.window.document.startViewTransition(async () => {
        dashboard__loadShare__react__loadShare__.startTransition(() => setStateImpl(newState));
        await renderPromise;
      });
      transition2.finished.finally(() => {
        setRenderDfd(void 0);
        setTransition(void 0);
        setPendingState(void 0);
        setVtContext({ isTransitioning: false });
      });
      setTransition(transition2);
    }
  }, [pendingState, renderDfd, router.window]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (renderDfd && pendingState && state.location.key === pendingState.location.key) {
      renderDfd.resolve();
    }
  }, [renderDfd, transition, state.location, pendingState]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!vtContext.isTransitioning && interruption) {
      setPendingState(interruption.state);
      setVtContext({
        isTransitioning: true,
        flushSync: false,
        currentLocation: interruption.currentLocation,
        nextLocation: interruption.nextLocation
      });
      setInterruption(void 0);
    }
  }, [vtContext.isTransitioning, interruption]);
  let navigator2 = dashboard__loadShare__react__loadShare__.useMemo(() => {
    return {
      createHref: router.createHref,
      encodeLocation: router.encodeLocation,
      go: (n) => router.navigate(n),
      push: (to, state2, opts) => router.navigate(to, {
        state: state2,
        preventScrollReset: opts?.preventScrollReset
      }),
      replace: (to, state2, opts) => router.navigate(to, {
        replace: true,
        state: state2,
        preventScrollReset: opts?.preventScrollReset
      })
    };
  }, [router]);
  let basename = router.basename || "/";
  let dataRouterContext = dashboard__loadShare__react__loadShare__.useMemo(
    () => ({
      router,
      navigator: navigator2,
      static: false,
      basename
    }),
    [router, navigator2, basename]
  );
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(DataRouterContext.Provider, { value: dataRouterContext }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(DataRouterStateContext.Provider, { value: state }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(FetchersContext.Provider, { value: fetcherData.current }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(ViewTransitionContext.Provider, { value: vtContext }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    Router,
    {
      basename,
      location: state.location,
      navigationType: state.historyAction,
      navigator: navigator2
    },
    /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      MemoizedDataRoutes,
      {
        routes: router.routes,
        future: router.future,
        state
      }
    )
  ))))), null);
}
var MemoizedDataRoutes = dashboard__loadShare__react__loadShare__.memo(DataRoutes);
function DataRoutes({
  routes,
  future,
  state
}) {
  return useRoutesImpl(routes, void 0, state, future);
}
function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = "POP",
  navigator: navigator2,
  static: staticProp = false
}) {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`
  );
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = dashboard__loadShare__react__loadShare__.useMemo(
    () => ({
      basename,
      navigator: navigator2,
      static: staticProp,
      future: {}
    }),
    [basename, navigator2, staticProp]
  );
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }
  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default"
  } = locationProp;
  let locationContext = dashboard__loadShare__react__loadShare__.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);
    if (trailingPathname == null) {
      return null;
    }
    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key
      },
      navigationType
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);
  warning(
    locationContext != null,
    `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`
  );
  if (locationContext == null) {
    return null;
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(LocationContext.Provider, { children, value: locationContext }));
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
  return object != null && typeof object.tagName === "string";
}
function isButtonElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
  return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
  return event.button === 0 && // Ignore everything but left clicks
  (!target || target === "_self") && // Let browser handle "target=_blank" etc.
  !isModifiedEvent(event);
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
  if (_formDataSupportsSubmitter === null) {
    try {
      new FormData(
        document.createElement("form"),
        // @ts-expect-error if FormData supports the submitter parameter, this will throw
        0
      );
      _formDataSupportsSubmitter = false;
    } catch (e) {
      _formDataSupportsSubmitter = true;
    }
  }
  return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
]);
function getFormEncType(encType) {
  if (encType != null && !supportedFormEncTypes.has(encType)) {
    warning(
      false,
      `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`
    );
    return null;
  }
  return encType;
}
function getFormSubmissionInfo(target, basename) {
  let method;
  let action;
  let encType;
  let formData;
  let body;
  if (isFormElement(target)) {
    let attr = target.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(target);
  } else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
    let form = target.form;
    if (form == null) {
      throw new Error(
        `Cannot submit a <button> or <input type="submit"> without a <form>`
      );
    }
    let attr = target.getAttribute("formaction") || form.getAttribute("action");
    action = attr ? stripBasename(attr, basename) : null;
    method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
    encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
    formData = new FormData(form, target);
    if (!isFormDataSubmitterSupported()) {
      let { name, type, value } = target;
      if (type === "image") {
        let prefix = name ? `${name}.` : "";
        formData.append(`${prefix}x`, "0");
        formData.append(`${prefix}y`, "0");
      } else if (name) {
        formData.append(name, value);
      }
    }
  } else if (isHtmlElement(target)) {
    throw new Error(
      `Cannot submit element that is not <form>, <button>, or <input type="submit|image">`
    );
  } else {
    method = defaultMethod;
    action = null;
    encType = defaultEncType;
    body = target;
  }
  if (formData && encType === "text/plain") {
    body = formData;
    formData = void 0;
  }
  return { action, method: method.toLowerCase(), encType, formData, body };
}
function invariant2(value, message) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      route.module
    );
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    console.error(
      `Error loading route module \`${route.module}\`, reloading page...`
    );
    console.error(error);
    if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && // @ts-expect-error
    void 0) ;
    window.location.reload();
    return new Promise(() => {
    });
  }
}
function getRouteCssDescriptors(route) {
  if (!route.css) return [];
  return route.css.map((href2) => ({ rel: "stylesheet", href: href2 }));
}
async function prefetchRouteCss(route) {
  if (!route.css) return;
  let descriptors = getRouteCssDescriptors(route);
  await Promise.all(descriptors.map(prefetchStyleLink));
}
async function prefetchStyleLinks(route, routeModule) {
  if (!route.css && !routeModule.links || !isPreloadSupported()) return;
  let descriptors = [];
  if (route.css) {
    descriptors.push(...getRouteCssDescriptors(route));
  }
  if (routeModule.links) {
    descriptors.push(...routeModule.links());
  }
  if (descriptors.length === 0) return;
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
  await Promise.all(styleLinks.map(prefetchStyleLink));
}
async function prefetchStyleLink(descriptor) {
  return new Promise((resolve) => {
    if (descriptor.media && !window.matchMedia(descriptor.media).matches || document.querySelector(
      `link[rel="stylesheet"][href="${descriptor.href}"]`
    )) {
      return resolve();
    }
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
  let links = await Promise.all(
    matches.map(async (match) => {
      let route = manifest.routes[match.route.id];
      if (route) {
        let mod = await loadRouteModule(route, routeModules);
        return mod.links ? mod.links() : [];
      }
      return [];
    })
  );
  return dedupeLinkDescriptors(
    links.flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map(
      (link) => link.rel === "stylesheet" ? { ...link, rel: "prefetch", as: "style" } : { ...link, rel: "prefetch" }
    )
  );
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let isNew = (match, index) => {
    if (!currentMatches[index]) return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname || // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"]
    );
  };
  if (mode === "assets") {
    return nextMatches.filter(
      (match, index) => isNew(match, index) || matchPathChanged(match, index)
    );
  }
  if (mode === "data") {
    return nextMatches.filter((match, index) => {
      let manifestRoute = manifest.routes[match.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return false;
      }
      if (isNew(match, index) || matchPathChanged(match, index)) {
        return true;
      }
      if (match.route.shouldRevalidate) {
        let routeChoice = match.route.shouldRevalidate({
          currentUrl: new URL(
            location.pathname + location.search + location.hash,
            window.origin
          ),
          currentParams: currentMatches[0]?.params || {},
          nextUrl: new URL(page, window.origin),
          nextParams: match.params,
          defaultShouldRevalidate: true
        });
        if (typeof routeChoice === "boolean") {
          return routeChoice;
        }
      }
      return true;
    });
  }
  return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
  return dedupeHrefs(
    matches.map((match) => {
      let route = manifest.routes[match.route.id];
      if (!route) return [];
      let hrefs = [route.module];
      if (route.clientActionModule) {
        hrefs = hrefs.concat(route.clientActionModule);
      }
      if (route.clientLoaderModule) {
        hrefs = hrefs.concat(route.clientLoaderModule);
      }
      if (includeHydrateFallback && route.hydrateFallbackModule) {
        hrefs = hrefs.concat(route.hydrateFallbackModule);
      }
      if (route.imports) {
        hrefs = hrefs.concat(route.imports);
      }
      return hrefs;
    }).flat(1)
  );
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
  new Set(preloads);
  return descriptors.reduce((deduped, descriptor) => {
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({ key, link: descriptor });
    }
    return deduped;
  }, []);
}
var _isPreloadSupported;
function isPreloadSupported() {
  if (_isPreloadSupported !== void 0) {
    return _isPreloadSupported;
  }
  let el = document.createElement("link");
  _isPreloadSupported = el.relList.supports("preload");
  el = null;
  return _isPreloadSupported;
}
function createHtml(html) {
  return { __html: html };
}
async function createRequestInit(request) {
  let init = { signal: request.signal };
  if (request.method !== "GET") {
    init.method = request.method;
    let contentType = request.headers.get("Content-Type");
    if (contentType && /\bapplication\/json\b/.test(contentType)) {
      init.headers = { "Content-Type": contentType };
      init.body = JSON.stringify(await request.json());
    } else if (contentType && /\btext\/plain\b/.test(contentType)) {
      init.headers = { "Content-Type": contentType };
      init.body = await request.text();
    } else if (contentType && /\bapplication\/x-www-form-urlencoded\b/.test(contentType)) {
      init.body = new URLSearchParams(await request.text());
    } else {
      init.body = await request.formData();
    }
  }
  return init;
}
var SingleFetchRedirectSymbol = Symbol("SingleFetchRedirect");
function handleMiddlewareError(error, routeId) {
  return { [routeId]: { type: "error", result: error } };
}
function getSingleFetchDataStrategy(manifest, routeModules, ssr, basename, getRouter) {
  return async (args) => {
    let { request, matches, fetcherKey } = args;
    if (request.method !== "GET") {
      return runMiddlewarePipeline(
        args,
        false,
        () => singleFetchActionStrategy(request, matches, basename),
        handleMiddlewareError
      );
    }
    if (!ssr) {
      let foundRevalidatingServerLoader = matches.some(
        (m) => m.shouldLoad && manifest.routes[m.route.id]?.hasLoader && !manifest.routes[m.route.id]?.hasClientLoader
      );
      if (!foundRevalidatingServerLoader) {
        return runMiddlewarePipeline(
          args,
          false,
          () => nonSsrStrategy(manifest, request, matches, basename),
          handleMiddlewareError
        );
      }
    }
    if (fetcherKey) {
      return runMiddlewarePipeline(
        args,
        false,
        () => singleFetchLoaderFetcherStrategy(request, matches, basename),
        handleMiddlewareError
      );
    }
    return runMiddlewarePipeline(
      args,
      false,
      () => singleFetchLoaderNavigationStrategy(
        manifest,
        routeModules,
        ssr,
        getRouter(),
        request,
        matches,
        basename
      ),
      handleMiddlewareError
    );
  };
}
async function singleFetchActionStrategy(request, matches, basename) {
  let actionMatch = matches.find((m) => m.shouldLoad);
  invariant2(actionMatch, "No action match found");
  let actionStatus = void 0;
  let result = await actionMatch.resolve(async (handler) => {
    let result2 = await handler(async () => {
      let url = singleFetchUrl(request.url, basename);
      let init = await createRequestInit(request);
      let { data: data2, status } = await fetchAndDecode(url, init);
      actionStatus = status;
      return unwrapSingleFetchResult(
        data2,
        actionMatch.route.id
      );
    });
    return result2;
  });
  if (isResponse(result.result) || isRouteErrorResponse(result.result)) {
    return { [actionMatch.route.id]: result };
  }
  return {
    [actionMatch.route.id]: {
      type: result.type,
      result: data(result.result, actionStatus)
    }
  };
}
async function nonSsrStrategy(manifest, request, matches, basename) {
  let matchesToLoad = matches.filter((m) => m.shouldLoad);
  let url = stripIndexParam(singleFetchUrl(request.url, basename));
  let init = await createRequestInit(request);
  let results = {};
  await Promise.all(
    matchesToLoad.map(
      (m) => m.resolve(async (handler) => {
        try {
          let result = manifest.routes[m.route.id]?.hasClientLoader ? await fetchSingleLoader(handler, url, init, m.route.id) : await handler();
          results[m.route.id] = { type: "data", result };
        } catch (e) {
          results[m.route.id] = { type: "error", result: e };
        }
      })
    )
  );
  return results;
}
async function singleFetchLoaderNavigationStrategy(manifest, routeModules, ssr, router, request, matches, basename) {
  let routesParams = /* @__PURE__ */ new Set();
  let foundOptOutRoute = false;
  let routeDfds = matches.map(() => createDeferred2());
  let routesLoadedPromise = Promise.all(routeDfds.map((d) => d.promise));
  let singleFetchDfd = createDeferred2();
  let url = stripIndexParam(singleFetchUrl(request.url, basename));
  let init = await createRequestInit(request);
  let results = {};
  let resolvePromise = Promise.all(
    matches.map(
      async (m, i) => m.resolve(async (handler) => {
        routeDfds[i].resolve();
        let manifestRoute = manifest.routes[m.route.id];
        if (!m.shouldLoad) {
          if (!router.state.initialized) {
            return;
          }
          if (m.route.id in router.state.loaderData && manifestRoute && m.route.shouldRevalidate) {
            if (manifestRoute.hasLoader) {
              foundOptOutRoute = true;
            }
            return;
          }
        }
        if (manifestRoute && manifestRoute.hasClientLoader) {
          if (manifestRoute.hasLoader) {
            foundOptOutRoute = true;
          }
          try {
            let result = await fetchSingleLoader(
              handler,
              url,
              init,
              m.route.id
            );
            results[m.route.id] = { type: "data", result };
          } catch (e) {
            results[m.route.id] = { type: "error", result: e };
          }
          return;
        }
        if (manifestRoute && manifestRoute.hasLoader) {
          routesParams.add(m.route.id);
        }
        try {
          let result = await handler(async () => {
            let data2 = await singleFetchDfd.promise;
            return unwrapSingleFetchResults(data2, m.route.id);
          });
          results[m.route.id] = {
            type: "data",
            result
          };
        } catch (e) {
          results[m.route.id] = {
            type: "error",
            result: e
          };
        }
      })
    )
  );
  await routesLoadedPromise;
  if ((!router.state.initialized || routesParams.size === 0) && !window.__reactRouterHdrActive) {
    singleFetchDfd.resolve({});
  } else {
    try {
      if (ssr && foundOptOutRoute && routesParams.size > 0) {
        url.searchParams.set(
          "_routes",
          matches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(",")
        );
      }
      let data2 = await fetchAndDecode(url, init);
      singleFetchDfd.resolve(data2.data);
    } catch (e) {
      singleFetchDfd.reject(e);
    }
  }
  await resolvePromise;
  return results;
}
async function singleFetchLoaderFetcherStrategy(request, matches, basename) {
  let fetcherMatch = matches.find((m) => m.shouldLoad);
  invariant2(fetcherMatch, "No fetcher match found");
  let result = await fetcherMatch.resolve(async (handler) => {
    let url = stripIndexParam(singleFetchUrl(request.url, basename));
    let init = await createRequestInit(request);
    return fetchSingleLoader(handler, url, init, fetcherMatch.route.id);
  });
  return { [fetcherMatch.route.id]: result };
}
function fetchSingleLoader(handler, url, init, routeId) {
  return handler(async () => {
    let singleLoaderUrl = new URL(url);
    singleLoaderUrl.searchParams.set("_routes", routeId);
    let { data: data2 } = await fetchAndDecode(singleLoaderUrl, init);
    return unwrapSingleFetchResults(data2, routeId);
  });
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
function singleFetchUrl(reqUrl, basename) {
  let url = typeof reqUrl === "string" ? new URL(
    reqUrl,
    // This can be called during the SSR flow via PrefetchPageLinksImpl so
    // don't assume window is available
    typeof window === "undefined" ? "server://singlefetch/" : window.location.origin
  ) : reqUrl;
  if (url.pathname === "/") {
    url.pathname = "_root.data";
  } else if (basename && stripBasename(url.pathname, basename) === "/") {
    url.pathname = `${basename.replace(/\/$/, "")}/_root.data`;
  } else {
    url.pathname = `${url.pathname.replace(/\/$/, "")}.data`;
  }
  return url;
}
async function fetchAndDecode(url, init) {
  let res = await fetch(url, init);
  if (res.status === 404 && !res.headers.has("X-Remix-Response")) {
    throw new ErrorResponseImpl(404, "Not Found", true);
  }
  const NO_BODY_STATUS_CODES2 = /* @__PURE__ */ new Set([100, 101, 204, 205]);
  if (NO_BODY_STATUS_CODES2.has(res.status)) {
    if (!init.method || init.method === "GET") {
      return { status: res.status, data: {} };
    } else {
      return { status: res.status, data: { data: void 0 } };
    }
  }
  invariant2(res.body, "No response body to decode");
  try {
    let decoded = await decodeViaTurboStream(res.body, window);
    return { status: res.status, data: decoded.value };
  } catch (e) {
    throw new Error("Unable to decode turbo-stream response");
  }
}
function decodeViaTurboStream(body, global2) {
  return decode(body, {
    plugins: [
      (type, ...rest) => {
        if (type === "SanitizedError") {
          let [name, message, stack] = rest;
          let Constructor = Error;
          if (name && name in global2 && typeof global2[name] === "function") {
            Constructor = global2[name];
          }
          let error = new Constructor(message);
          error.stack = stack;
          return { value: error };
        }
        if (type === "ErrorResponse") {
          let [data2, status, statusText] = rest;
          return {
            value: new ErrorResponseImpl(status, statusText, data2)
          };
        }
        if (type === "SingleFetchRedirect") {
          return { value: { [SingleFetchRedirectSymbol]: rest[0] } };
        }
        if (type === "SingleFetchClassInstance") {
          return { value: rest[0] };
        }
        if (type === "SingleFetchFallback") {
          return { value: void 0 };
        }
      }
    ]
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
    if (result.replace) {
      headers["X-Remix-Replace"] = "yes";
    }
    throw redirect(result.redirect, { status: result.status, headers });
  } else if ("data" in result) {
    return result.data;
  } else {
    throw new Error(`No response found for routeId "${routeId}"`);
  }
}
function createDeferred2() {
  let resolve;
  let reject;
  let promise = new Promise((res, rej) => {
    resolve = async (val) => {
      res(val);
      try {
        await promise;
      } catch (e) {
      }
    };
    reject = async (error) => {
      rej(error);
      try {
        await promise;
      } catch (e) {
      }
    };
  });
  return {
    promise,
    //@ts-ignore
    resolve,
    //@ts-ignore
    reject
  };
}
var RemixErrorBoundary = class extends dashboard__loadShare__react__loadShare__.Component {
  constructor(props) {
    super(props);
    this.state = { error: props.error || null, location: props.location };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  static getDerivedStateFromProps(props, state) {
    if (state.location !== props.location) {
      return { error: props.error || null, location: props.location };
    }
    return { error: props.error || state.error, location: state.location };
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
        RemixRootDefaultErrorBoundary,
        {
          error: this.state.error,
          isOutsideRemixApp: true
        }
      );
    } else {
      return this.props.children;
    }
  }
};
function RemixRootDefaultErrorBoundary({
  error,
  isOutsideRemixApp
}) {
  console.error(error);
  let heyDeveloper = /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "script",
    {
      dangerouslySetInnerHTML: {
        __html: `
        console.log(
          "💿 Hey developer 👋. You can provide a way better UX than this when your app throws errors. Check out https://remix.run/guides/errors for more information."
        );
      `
      }
    }
  );
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(BoundaryShell, { title: "Unhandled Thrown Response!" }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("h1", { style: { fontSize: "24px" } }, error.status, " ", error.statusText), heyDeveloper);
  }
  let errorInstance;
  if (error instanceof Error) {
    errorInstance = error;
  } else {
    let errorString = error == null ? "Unknown Error" : typeof error === "object" && "toString" in error ? error.toString() : JSON.stringify(error);
    errorInstance = new Error(errorString);
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    BoundaryShell,
    {
      title: "Application Error!",
      isOutsideRemixApp
    },
    /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("h1", { style: { fontSize: "24px" } }, "Application Error"),
    /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      "pre",
      {
        style: {
          padding: "2rem",
          background: "hsla(10, 50%, 50%, 0.1)",
          color: "red",
          overflow: "auto"
        }
      },
      errorInstance.stack
    ),
    heyDeveloper
  );
}
function BoundaryShell({
  title,
  renderScripts,
  isOutsideRemixApp,
  children
}) {
  let { routeModules } = useFrameworkContext();
  if (routeModules.root?.Layout && !isOutsideRemixApp) {
    return children;
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("html", { lang: "en" }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("head", null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("meta", { charSet: "utf-8" }), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "meta",
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1,viewport-fit=cover"
    }
  ), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("title", null, title)), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("body", null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("main", { style: { fontFamily: "system-ui, sans-serif", padding: "2rem" } }, children, renderScripts ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(Scripts, null) : null)));
}
function RemixRootDefaultHydrateFallback() {
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(BoundaryShell, { title: "Loading...", renderScripts: true }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "script",
    {
      dangerouslySetInnerHTML: {
        __html: `
              console.log(
                "💿 Hey developer 👋. You can provide a way better UX than this " +
                "when your app is loading JS modules and/or running \`clientLoader\` " +
                "functions. Check out https://remix.run/route/hydrate-fallback " +
                "for more information."
              );
            `
      }
    }
  ));
}
function groupRoutesByParentId(manifest) {
  let routes = {};
  Object.values(manifest).forEach((route) => {
    if (route) {
      let parentId = route.parentId || "";
      if (!routes[parentId]) {
        routes[parentId] = [];
      }
      routes[parentId].push(route);
    }
  });
  return routes;
}
function getRouteComponents(route, routeModule, isSpaMode) {
  let Component4 = getRouteModuleComponent(routeModule);
  let HydrateFallback = routeModule.HydrateFallback && (!isSpaMode || route.id === "root") ? routeModule.HydrateFallback : route.id === "root" ? RemixRootDefaultHydrateFallback : void 0;
  let ErrorBoundary = routeModule.ErrorBoundary ? routeModule.ErrorBoundary : route.id === "root" ? () => /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RemixRootDefaultErrorBoundary, { error: useRouteError() }) : void 0;
  if (route.id === "root" && routeModule.Layout) {
    return {
      ...Component4 ? {
        element: /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(routeModule.Layout, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(Component4, null))
      } : { Component: Component4 },
      ...ErrorBoundary ? {
        errorElement: /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(routeModule.Layout, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(ErrorBoundary, null))
      } : { ErrorBoundary },
      ...HydrateFallback ? {
        hydrateFallbackElement: /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(routeModule.Layout, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(HydrateFallback, null))
      } : { HydrateFallback }
    };
  }
  return { Component: Component4, ErrorBoundary, HydrateFallback };
}
function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation, manifest, routeModulesCache, initialState, ssr, isSpaMode) {
  return createClientRoutes(
    manifest,
    routeModulesCache,
    initialState,
    ssr,
    isSpaMode,
    "",
    groupRoutesByParentId(manifest),
    needsRevalidation
  );
}
function preventInvalidServerHandlerCall(type, route) {
  if (type === "loader" && !route.hasLoader || type === "action" && !route.hasAction) {
    let fn = type === "action" ? "serverAction()" : "serverLoader()";
    let msg = `You are trying to call ${fn} on a route that does not have a server ${type} (routeId: "${route.id}")`;
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
function createClientRoutes(manifest, routeModulesCache, initialState, ssr, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId(manifest), needsRevalidation) {
  return (routesByParentId[parentId] || []).map((route) => {
    let routeModule = routeModulesCache[route.id];
    function fetchServerHandler(singleFetch) {
      invariant2(
        typeof singleFetch === "function",
        "No single fetch function available for route handler"
      );
      return singleFetch();
    }
    function fetchServerLoader(singleFetch) {
      if (!route.hasLoader) return Promise.resolve(null);
      return fetchServerHandler(singleFetch);
    }
    function fetchServerAction(singleFetch) {
      if (!route.hasAction) {
        throw noActionDefinedError("action", route.id);
      }
      return fetchServerHandler(singleFetch);
    }
    function prefetchModule(modulePath) {
      import(
        /* @vite-ignore */
        /* webpackIgnore: true */
        modulePath
      );
    }
    function prefetchRouteModuleChunks(route2) {
      if (route2.clientActionModule) {
        prefetchModule(route2.clientActionModule);
      }
      if (route2.clientLoaderModule) {
        prefetchModule(route2.clientLoaderModule);
      }
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
      Object.assign(dataRoute, {
        ...dataRoute,
        ...getRouteComponents(route, routeModule, isSpaMode),
        unstable_middleware: routeModule.unstable_clientMiddleware,
        handle: routeModule.handle,
        shouldRevalidate: getShouldRevalidateFunction(
          routeModule,
          route,
          ssr,
          needsRevalidation
        )
      });
      let hasInitialData = initialState && initialState.loaderData && route.id in initialState.loaderData;
      let initialData = hasInitialData ? initialState?.loaderData?.[route.id] : void 0;
      let hasInitialError = initialState && initialState.errors && route.id in initialState.errors;
      let initialError = hasInitialError ? initialState?.errors?.[route.id] : void 0;
      let isHydrationRequest = needsRevalidation == null && (routeModule.clientLoader?.hydrate === true || !route.hasLoader);
      dataRoute.loader = async ({ request, params, context }, singleFetch) => {
        try {
          let result = await prefetchStylesAndCallHandler(async () => {
            invariant2(
              routeModule,
              "No `routeModule` available for critical-route loader"
            );
            if (!routeModule.clientLoader) {
              return fetchServerLoader(singleFetch);
            }
            return routeModule.clientLoader({
              request,
              params,
              context,
              async serverLoader() {
                preventInvalidServerHandlerCall("loader", route);
                if (isHydrationRequest) {
                  if (hasInitialData) {
                    return initialData;
                  }
                  if (hasInitialError) {
                    throw initialError;
                  }
                }
                return fetchServerLoader(singleFetch);
              }
            });
          });
          return result;
        } finally {
          isHydrationRequest = false;
        }
      };
      dataRoute.loader.hydrate = shouldHydrateRouteLoader(
        route,
        routeModule,
        isSpaMode
      );
      dataRoute.action = ({ request, params, context }, singleFetch) => {
        return prefetchStylesAndCallHandler(async () => {
          invariant2(
            routeModule,
            "No `routeModule` available for critical-route action"
          );
          if (!routeModule.clientAction) {
            if (isSpaMode) {
              throw noActionDefinedError("clientAction", route.id);
            }
            return fetchServerAction(singleFetch);
          }
          return routeModule.clientAction({
            request,
            params,
            context,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route);
              return fetchServerAction(singleFetch);
            }
          });
        });
      };
    } else {
      if (!route.hasClientLoader) {
        dataRoute.loader = (_, singleFetch) => prefetchStylesAndCallHandler(() => {
          return fetchServerLoader(singleFetch);
        });
      }
      if (!route.hasClientAction) {
        dataRoute.action = (_, singleFetch) => prefetchStylesAndCallHandler(() => {
          if (isSpaMode) {
            throw noActionDefinedError("clientAction", route.id);
          }
          return fetchServerAction(singleFetch);
        });
      }
      let lazyRoutePromise;
      async function getLazyRoute() {
        if (lazyRoutePromise) {
          return await lazyRoutePromise;
        }
        lazyRoutePromise = (async () => {
          if (route.clientLoaderModule || route.clientActionModule) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          let routeModulePromise = loadRouteModuleWithBlockingLinks(
            route,
            routeModulesCache
          );
          prefetchRouteModuleChunks(route);
          return await routeModulePromise;
        })();
        return await lazyRoutePromise;
      }
      dataRoute.lazy = {
        loader: route.hasClientLoader ? async () => {
          let { clientLoader } = route.clientLoaderModule ? await import(
            /* @vite-ignore */
            /* webpackIgnore: true */
            route.clientLoaderModule
          ) : await getLazyRoute();
          invariant2(clientLoader, "No `clientLoader` export found");
          return (args, singleFetch) => clientLoader({
            ...args,
            async serverLoader() {
              preventInvalidServerHandlerCall("loader", route);
              return fetchServerLoader(singleFetch);
            }
          });
        } : void 0,
        action: route.hasClientAction ? async () => {
          let clientActionPromise = route.clientActionModule ? import(
            /* @vite-ignore */
            /* webpackIgnore: true */
            route.clientActionModule
          ) : getLazyRoute();
          prefetchRouteModuleChunks(route);
          let { clientAction } = await clientActionPromise;
          invariant2(clientAction, "No `clientAction` export found");
          return (args, singleFetch) => clientAction({
            ...args,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route);
              return fetchServerAction(singleFetch);
            }
          });
        } : void 0,
        unstable_middleware: route.hasClientMiddleware ? async () => {
          let { unstable_clientMiddleware } = route.clientMiddlewareModule ? await import(
            /* @vite-ignore */
            /* webpackIgnore: true */
            route.clientMiddlewareModule
          ) : await getLazyRoute();
          invariant2(
            unstable_clientMiddleware,
            "No `unstable_clientMiddleware` export found"
          );
          return unstable_clientMiddleware;
        } : void 0,
        shouldRevalidate: async () => {
          let lazyRoute = await getLazyRoute();
          return getShouldRevalidateFunction(
            lazyRoute,
            route,
            ssr,
            needsRevalidation
          );
        },
        handle: async () => (await getLazyRoute()).handle,
        // No need to wrap these in layout since the root route is never
        // loaded via route.lazy()
        Component: async () => (await getLazyRoute()).Component,
        ErrorBoundary: route.hasErrorBoundary ? async () => (await getLazyRoute()).ErrorBoundary : void 0
      };
    }
    let children = createClientRoutes(
      manifest,
      routeModulesCache,
      initialState,
      ssr,
      isSpaMode,
      route.id,
      routesByParentId,
      needsRevalidation
    );
    if (children.length > 0) dataRoute.children = children;
    return dataRoute;
  });
}
function getShouldRevalidateFunction(route, manifestRoute, ssr, needsRevalidation) {
  if (needsRevalidation) {
    return wrapShouldRevalidateForHdr(
      manifestRoute.id,
      route.shouldRevalidate,
      needsRevalidation
    );
  }
  if (!ssr && manifestRoute.hasLoader && !manifestRoute.hasClientLoader) {
    if (route.shouldRevalidate) {
      let fn = route.shouldRevalidate;
      return (opts) => fn({ ...opts, defaultShouldRevalidate: false });
    } else {
      return () => false;
    }
  }
  if (ssr && route.shouldRevalidate) {
    let fn = route.shouldRevalidate;
    return (opts) => fn({ ...opts, defaultShouldRevalidate: true });
  }
  return route.shouldRevalidate;
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
  let routeModulePromise = loadRouteModule(route, routeModules);
  let prefetchRouteCssPromise = prefetchRouteCss(route);
  let routeModule = await routeModulePromise;
  await Promise.all([
    prefetchRouteCssPromise,
    prefetchStyleLinks(route, routeModule)
  ]);
  return {
    Component: getRouteModuleComponent(routeModule),
    ErrorBoundary: routeModule.ErrorBoundary,
    unstable_clientMiddleware: routeModule.unstable_clientMiddleware,
    clientAction: routeModule.clientAction,
    clientLoader: routeModule.clientLoader,
    handle: routeModule.handle,
    links: routeModule.links,
    meta: routeModule.meta,
    shouldRevalidate: routeModule.shouldRevalidate
  };
}
function getRouteModuleComponent(routeModule) {
  if (routeModule.default == null) return void 0;
  let isEmptyObject = typeof routeModule.default === "object" && Object.keys(routeModule.default).length === 0;
  if (!isEmptyObject) {
    return routeModule.default;
  }
}
function shouldHydrateRouteLoader(route, routeModule, isSpaMode) {
  return isSpaMode && route.id !== "root" || routeModule.clientLoader != null && (routeModule.clientLoader.hydrate === true || route.hasLoader !== true);
}
var nextPaths = /* @__PURE__ */ new Set();
var discoveredPathsMaxSize = 1e3;
var discoveredPaths = /* @__PURE__ */ new Set();
var URL_LIMIT = 7680;
function isFogOfWarEnabled(ssr) {
  return ssr === true;
}
function getPartialManifest({ sri, ...manifest }, router) {
  let routeIds = new Set(router.state.matches.map((m) => m.route.id));
  let segments = router.state.location.pathname.split("/").filter(Boolean);
  let paths = ["/"];
  segments.pop();
  while (segments.length > 0) {
    paths.push(`/${segments.join("/")}`);
    segments.pop();
  }
  paths.forEach((path) => {
    let matches = matchRoutes(router.routes, path, router.basename);
    if (matches) {
      matches.forEach((m) => routeIds.add(m.route.id));
    }
  });
  let initialRoutes = [...routeIds].reduce(
    (acc, id) => Object.assign(acc, { [id]: manifest.routes[id] }),
    {}
  );
  return {
    ...manifest,
    routes: initialRoutes,
    sri: sri ? true : void 0
  };
}
function getPatchRoutesOnNavigationFunction(manifest, routeModules, ssr, isSpaMode, basename) {
  if (!isFogOfWarEnabled(ssr)) {
    return void 0;
  }
  return async ({ path, patch, signal, fetcherKey }) => {
    if (discoveredPaths.has(path)) {
      return;
    }
    await fetchAndApplyManifestPatches(
      [path],
      fetcherKey ? window.location.href : path,
      manifest,
      routeModules,
      ssr,
      isSpaMode,
      basename,
      patch,
      signal
    );
  };
}
function useFogOFWarDiscovery(router, manifest, routeModules, ssr, isSpaMode) {
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (!isFogOfWarEnabled(ssr) || navigator.connection?.saveData === true) {
      return;
    }
    function registerElement(el) {
      let path = el.tagName === "FORM" ? el.getAttribute("action") : el.getAttribute("href");
      if (!path) {
        return;
      }
      let pathname = el.tagName === "A" ? el.pathname : new URL(path, window.location.origin).pathname;
      if (!discoveredPaths.has(pathname)) {
        nextPaths.add(pathname);
      }
    }
    async function fetchPatches() {
      document.querySelectorAll("a[data-discover], form[data-discover]").forEach(registerElement);
      let lazyPaths = Array.from(nextPaths.keys()).filter((path) => {
        if (discoveredPaths.has(path)) {
          nextPaths.delete(path);
          return false;
        }
        return true;
      });
      if (lazyPaths.length === 0) {
        return;
      }
      try {
        await fetchAndApplyManifestPatches(
          lazyPaths,
          null,
          manifest,
          routeModules,
          ssr,
          isSpaMode,
          router.basename,
          router.patchRoutes
        );
      } catch (e) {
        console.error("Failed to fetch manifest patches", e);
      }
    }
    let debouncedFetchPatches = debounce(fetchPatches, 100);
    fetchPatches();
    let observer = new MutationObserver(() => debouncedFetchPatches());
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-discover", "href", "action"]
    });
    return () => observer.disconnect();
  }, [ssr, isSpaMode, manifest, routeModules, router]);
}
var MANIFEST_VERSION_STORAGE_KEY = "react-router-manifest-version";
async function fetchAndApplyManifestPatches(paths, errorReloadPath, manifest, routeModules, ssr, isSpaMode, basename, patchRoutes, signal) {
  let manifestPath = `${basename != null ? basename : "/"}/__manifest`.replace(
    /\/+/g,
    "/"
  );
  let url = new URL(manifestPath, window.location.origin);
  paths.sort().forEach((path) => url.searchParams.append("p", path));
  url.searchParams.set("version", manifest.version);
  if (url.toString().length > URL_LIMIT) {
    nextPaths.clear();
    return;
  }
  let serverPatches;
  try {
    let res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    } else if (res.status === 204 && res.headers.has("X-Remix-Reload-Document")) {
      if (!errorReloadPath) {
        console.warn(
          "Detected a manifest version mismatch during eager route discovery. The next navigation/fetch to an undiscovered route will result in a new document navigation to sync up with the latest manifest."
        );
        return;
      }
      if (sessionStorage.getItem(MANIFEST_VERSION_STORAGE_KEY) === manifest.version) {
        console.error(
          "Unable to discover routes due to manifest version mismatch."
        );
        return;
      }
      sessionStorage.setItem(MANIFEST_VERSION_STORAGE_KEY, manifest.version);
      window.location.href = errorReloadPath;
      throw new Error("Detected manifest version mismatch, reloading...");
    } else if (res.status >= 400) {
      throw new Error(await res.text());
    }
    sessionStorage.removeItem(MANIFEST_VERSION_STORAGE_KEY);
    serverPatches = await res.json();
  } catch (e) {
    if (signal?.aborted) return;
    throw e;
  }
  let knownRoutes = new Set(Object.keys(manifest.routes));
  let patches = Object.values(serverPatches).reduce((acc, route) => {
    if (route && !knownRoutes.has(route.id)) {
      acc[route.id] = route;
    }
    return acc;
  }, {});
  Object.assign(manifest.routes, patches);
  paths.forEach((p) => addToFifoQueue(p, discoveredPaths));
  let parentIds = /* @__PURE__ */ new Set();
  Object.values(patches).forEach((patch) => {
    if (patch && (!patch.parentId || !patches[patch.parentId])) {
      parentIds.add(patch.parentId);
    }
  });
  parentIds.forEach(
    (parentId) => patchRoutes(
      parentId || null,
      createClientRoutes(patches, routeModules, null, ssr, isSpaMode, parentId)
    )
  );
}
function addToFifoQueue(path, queue) {
  if (queue.size >= discoveredPathsMaxSize) {
    let first = queue.values().next().value;
    queue.delete(first);
  }
  queue.add(path);
}
function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}
function useDataRouterContext2() {
  let context = dashboard__loadShare__react__loadShare__.useContext(DataRouterContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}
function useDataRouterStateContext() {
  let context = dashboard__loadShare__react__loadShare__.useContext(DataRouterStateContext);
  invariant2(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}
var FrameworkContext$1 = dashboard__loadShare__react__loadShare__.createContext(void 0);
FrameworkContext$1.displayName = "FrameworkContext";
function useFrameworkContext() {
  let context = dashboard__loadShare__react__loadShare__.useContext(FrameworkContext$1);
  invariant2(
    context,
    "You must render this element inside a <HydratedRouter> element"
  );
  return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
  let frameworkContext = dashboard__loadShare__react__loadShare__.useContext(FrameworkContext$1);
  let [maybePrefetch, setMaybePrefetch] = dashboard__loadShare__react__loadShare__.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = dashboard__loadShare__react__loadShare__.useState(false);
  let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
  let ref = dashboard__loadShare__react__loadShare__.useRef(null);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = (entries) => {
        entries.forEach((entry) => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, { threshold: 0.5 });
      if (ref.current) observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  let setIntent = () => {
    setMaybePrefetch(true);
  };
  let cancelIntent = () => {
    setMaybePrefetch(false);
    setShouldPrefetch(false);
  };
  if (!frameworkContext) {
    return [false, ref, {}];
  }
  if (prefetch !== "intent") {
    return [shouldPrefetch, ref, {}];
  }
  return [
    shouldPrefetch,
    ref,
    {
      onFocus: composeEventHandlers(onFocus, setIntent),
      onBlur: composeEventHandlers(onBlur, cancelIntent),
      onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
      onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
      onTouchStart: composeEventHandlers(onTouchStart, setIntent)
    }
  ];
}
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
  return matches;
}
function PrefetchPageLinks({
  page,
  ...dataLinkProps
}) {
  let { router } = useDataRouterContext2();
  let matches = dashboard__loadShare__react__loadShare__.useMemo(
    () => matchRoutes(router.routes, page, router.basename),
    [router.routes, page, router.basename]
  );
  if (!matches) {
    return null;
  }
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(PrefetchPageLinksImpl, { page, matches, ...dataLinkProps });
}
function useKeyedPrefetchLinks(matches) {
  let { manifest, routeModules } = useFrameworkContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = dashboard__loadShare__react__loadShare__.useState([]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then(
      (links) => {
        if (!interrupted) {
          setKeyedPrefetchLinks(links);
        }
      }
    );
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
  let { manifest, routeModules } = useFrameworkContext();
  let { basename } = useDataRouterContext2();
  let { loaderData, matches } = useDataRouterStateContext();
  let newMatchesForData = dashboard__loadShare__react__loadShare__.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "data"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let newMatchesForAssets = dashboard__loadShare__react__loadShare__.useMemo(
    () => getNewMatchesForLinks(
      page,
      nextMatches,
      matches,
      manifest,
      location,
      "assets"
    ),
    [page, nextMatches, matches, manifest, location]
  );
  let dataHrefs = dashboard__loadShare__react__loadShare__.useMemo(() => {
    if (page === location.pathname + location.search + location.hash) {
      return [];
    }
    let routesParams = /* @__PURE__ */ new Set();
    let foundOptOutRoute = false;
    nextMatches.forEach((m) => {
      let manifestRoute = manifest.routes[m.route.id];
      if (!manifestRoute || !manifestRoute.hasLoader) {
        return;
      }
      if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) {
        foundOptOutRoute = true;
      } else if (manifestRoute.hasClientLoader) {
        foundOptOutRoute = true;
      } else {
        routesParams.add(m.route.id);
      }
    });
    if (routesParams.size === 0) {
      return [];
    }
    let url = singleFetchUrl(page, basename);
    if (foundOptOutRoute && routesParams.size > 0) {
      url.searchParams.set(
        "_routes",
        nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(",")
      );
    }
    return [url.pathname + url.search];
  }, [
    basename,
    loaderData,
    location,
    manifest,
    newMatchesForData,
    nextMatches,
    page,
    routeModules
  ]);
  let moduleHrefs = dashboard__loadShare__react__loadShare__.useMemo(
    () => getModuleLinkHrefs(newMatchesForAssets, manifest),
    [newMatchesForAssets, manifest]
  );
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, dataHrefs.map((href2) => /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("link", { key: href2, rel: "prefetch", as: "fetch", href: href2, ...linkProps })), moduleHrefs.map((href2) => /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("link", { key: href2, rel: "modulepreload", href: href2, ...linkProps })), keyedPrefetchLinks.map(({ key, link }) => (
    // these don't spread `linkProps` because they are full link descriptors
    // already with their own props
    /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement("link", { key, ...link })
  )));
}
var isHydrated = false;
function Scripts(props) {
  let { manifest, serverHandoffString, isSpaMode, ssr, renderMeta } = useFrameworkContext();
  let { router, static: isStatic, staticContext } = useDataRouterContext2();
  let { matches: routerMatches } = useDataRouterStateContext();
  let enableFogOfWar = isFogOfWarEnabled(ssr);
  if (renderMeta) {
    renderMeta.didRenderScripts = true;
  }
  let matches = getActiveMatches(routerMatches, null, isSpaMode);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    isHydrated = true;
  }, []);
  let initialScripts = dashboard__loadShare__react__loadShare__.useMemo(() => {
    let streamScript = "window.__reactRouterContext.stream = new ReadableStream({start(controller){window.__reactRouterContext.streamController = controller;}}).pipeThrough(new TextEncoderStream());";
    let contextScript = staticContext ? `window.__reactRouterContext = ${serverHandoffString};${streamScript}` : " ";
    let routeModulesScript = !isStatic ? " " : `${manifest.hmr?.runtime ? `import ${JSON.stringify(manifest.hmr.runtime)};` : ""}${!enableFogOfWar ? `import ${JSON.stringify(manifest.url)}` : ""};
${matches.map((match, routeIndex) => {
      let routeVarName = `route${routeIndex}`;
      let manifestEntry = manifest.routes[match.route.id];
      invariant2(manifestEntry, `Route ${match.route.id} not found in manifest`);
      let {
        clientActionModule,
        clientLoaderModule,
        clientMiddlewareModule,
        hydrateFallbackModule,
        module
      } = manifestEntry;
      let chunks = [
        ...clientActionModule ? [
          {
            module: clientActionModule,
            varName: `${routeVarName}_clientAction`
          }
        ] : [],
        ...clientLoaderModule ? [
          {
            module: clientLoaderModule,
            varName: `${routeVarName}_clientLoader`
          }
        ] : [],
        ...clientMiddlewareModule ? [
          {
            module: clientMiddlewareModule,
            varName: `${routeVarName}_clientMiddleware`
          }
        ] : [],
        ...hydrateFallbackModule ? [
          {
            module: hydrateFallbackModule,
            varName: `${routeVarName}_HydrateFallback`
          }
        ] : [],
        { module, varName: `${routeVarName}_main` }
      ];
      if (chunks.length === 1) {
        return `import * as ${routeVarName} from ${JSON.stringify(module)};`;
      }
      let chunkImportsSnippet = chunks.map((chunk) => `import * as ${chunk.varName} from "${chunk.module}";`).join("\n");
      let mergedChunksSnippet = `const ${routeVarName} = {${chunks.map((chunk) => `...${chunk.varName}`).join(",")}};`;
      return [chunkImportsSnippet, mergedChunksSnippet].join("\n");
    }).join("\n")}
  ${enableFogOfWar ? (
      // Inline a minimal manifest with the SSR matches
      `window.__reactRouterManifest = ${JSON.stringify(
        getPartialManifest(manifest, router),
        null,
        2
      )};`
    ) : ""}
  window.__reactRouterRouteModules = {${matches.map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`).join(",")}};

import(${JSON.stringify(manifest.entry.module)});`;
    return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      "script",
      {
        ...props,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: createHtml(contextScript),
        type: void 0
      }
    ), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      "script",
      {
        ...props,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: createHtml(routeModulesScript),
        type: "module",
        async: true
      }
    ));
  }, []);
  let preloads = isHydrated ? [] : dedupe(
    manifest.entry.imports.concat(
      getModuleLinkHrefs(matches, manifest, {
        includeHydrateFallback: true
      })
    )
  );
  let sri = typeof manifest.sri === "object" ? manifest.sri : {};
  return isHydrated ? null : /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, typeof manifest.sri === "object" ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "script",
    {
      "rr-importmap": "",
      type: "importmap",
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: JSON.stringify({
          integrity: sri
        })
      }
    }
  ) : null, !enableFogOfWar ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "link",
    {
      rel: "modulepreload",
      href: manifest.url,
      crossOrigin: props.crossOrigin,
      integrity: sri[manifest.url],
      suppressHydrationWarning: true
    }
  ) : null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "link",
    {
      rel: "modulepreload",
      href: manifest.entry.module,
      crossOrigin: props.crossOrigin,
      integrity: sri[manifest.entry.module],
      suppressHydrationWarning: true
    }
  ), preloads.map((path) => /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
    "link",
    {
      key: path,
      rel: "modulepreload",
      href: path,
      crossOrigin: props.crossOrigin,
      integrity: sri[path],
      suppressHydrationWarning: true
    }
  )), initialScripts);
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
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
try {
  if (isBrowser) {
    window.__reactRouterVersion = "7.5.0";
  }
} catch (e) {
}
var ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = dashboard__loadShare__react__loadShare__.forwardRef(
  function LinkWithRef({
    onClick,
    discover = "render",
    prefetch = "none",
    relative,
    reloadDocument,
    replace: replace2,
    state,
    target,
    to,
    preventScrollReset,
    viewTransition,
    ...rest
  }, forwardedRef) {
    let { basename } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
    let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX2.test(to);
    let absoluteHref;
    let isExternal = false;
    if (typeof to === "string" && isAbsolute) {
      absoluteHref = to;
      if (isBrowser) {
        try {
          let currentUrl = new URL(window.location.href);
          let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
          let path = stripBasename(targetUrl.pathname, basename);
          if (targetUrl.origin === currentUrl.origin && path != null) {
            to = path + targetUrl.search + targetUrl.hash;
          } else {
            isExternal = true;
          }
        } catch (e) {
          warning(
            false,
            `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`
          );
        }
      }
    }
    let href2 = useHref(to, { relative });
    let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(
      prefetch,
      rest
    );
    let internalOnClick = useLinkClickHandler(to, {
      replace: replace2,
      state,
      target,
      preventScrollReset,
      relative,
      viewTransition
    });
    function handleClick(event) {
      if (onClick) onClick(event);
      if (!event.defaultPrevented) {
        internalOnClick(event);
      }
    }
    let link = (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
        "a",
        {
          ...rest,
          ...prefetchHandlers,
          href: absoluteHref || href2,
          onClick: isExternal || reloadDocument ? onClick : handleClick,
          ref: mergeRefs(forwardedRef, prefetchRef),
          target,
          "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
        }
      )
    );
    return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, link, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(PrefetchPageLinks, { page: href2 })) : link;
  }
);
Link.displayName = "Link";
var NavLink = dashboard__loadShare__react__loadShare__.forwardRef(
  function NavLinkWithRef({
    "aria-current": ariaCurrentProp = "page",
    caseSensitive = false,
    className: classNameProp = "",
    end = false,
    style: styleProp,
    to,
    viewTransition,
    children,
    ...rest
  }, ref) {
    let path = useResolvedPath(to, { relative: rest.relative });
    let location = useLocation();
    let routerState = dashboard__loadShare__react__loadShare__.useContext(DataRouterStateContext);
    let { navigator: navigator2, basename } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
    let isTransitioning = routerState != null && // Conditional usage is OK here because the usage of a data router is static
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useViewTransitionState(path) && viewTransition === true;
    let toPathname = navigator2.encodeLocation ? navigator2.encodeLocation(path).pathname : path.pathname;
    let locationPathname = location.pathname;
    let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
    if (!caseSensitive) {
      locationPathname = locationPathname.toLowerCase();
      nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
      toPathname = toPathname.toLowerCase();
    }
    if (nextLocationPathname && basename) {
      nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
    }
    const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
    let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
    let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
    let renderProps = {
      isActive,
      isPending,
      isTransitioning
    };
    let ariaCurrent = isActive ? ariaCurrentProp : void 0;
    let className;
    if (typeof classNameProp === "function") {
      className = classNameProp(renderProps);
    } else {
      className = [
        classNameProp,
        isActive ? "active" : null,
        isPending ? "pending" : null,
        isTransitioning ? "transitioning" : null
      ].filter(Boolean).join(" ");
    }
    let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
    return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      Link,
      {
        ...rest,
        "aria-current": ariaCurrent,
        className,
        ref,
        style,
        to,
        viewTransition
      },
      typeof children === "function" ? children(renderProps) : children
    );
  }
);
NavLink.displayName = "NavLink";
var Form = dashboard__loadShare__react__loadShare__.forwardRef(
  ({
    discover = "render",
    fetcherKey,
    navigate,
    reloadDocument,
    replace: replace2,
    state,
    method = defaultMethod,
    action,
    onSubmit,
    relative,
    preventScrollReset,
    viewTransition,
    ...props
  }, forwardedRef) => {
    let submit = useSubmit();
    let formAction = useFormAction(action, { relative });
    let formMethod = method.toLowerCase() === "get" ? "get" : "post";
    let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX2.test(action);
    let submitHandler = (event) => {
      onSubmit && onSubmit(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      let submitter = event.nativeEvent.submitter;
      let submitMethod = submitter?.getAttribute("formmethod") || method;
      submit(submitter || event.currentTarget, {
        fetcherKey,
        method: submitMethod,
        navigate,
        replace: replace2,
        state,
        relative,
        preventScrollReset,
        viewTransition
      });
    };
    return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      "form",
      {
        ref: forwardedRef,
        method: formMethod,
        action: formAction,
        onSubmit: reloadDocument ? onSubmit : submitHandler,
        ...props,
        "data-discover": !isAbsolute && discover === "render" ? "true" : void 0
      }
    );
  }
);
Form.displayName = "Form";
function getDataRouterConsoleError2(hookName) {
  return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
  let ctx = dashboard__loadShare__react__loadShare__.useContext(DataRouterContext);
  invariant(ctx, getDataRouterConsoleError2(hookName));
  return ctx;
}
function useLinkClickHandler(to, {
  target,
  replace: replaceProp,
  state,
  preventScrollReset,
  relative,
  viewTransition
} = {}) {
  let navigate = useNavigate();
  let location = useLocation();
  let path = useResolvedPath(to, { relative });
  return dashboard__loadShare__react__loadShare__.useCallback(
    (event) => {
      if (shouldProcessLinkClick(event, target)) {
        event.preventDefault();
        let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
        navigate(to, {
          replace: replace2,
          state,
          preventScrollReset,
          relative,
          viewTransition
        });
      }
    },
    [
      location,
      navigate,
      path,
      replaceProp,
      state,
      target,
      to,
      preventScrollReset,
      relative,
      viewTransition
    ]
  );
}
var fetcherId = 0;
var getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
function useSubmit() {
  let { router } = useDataRouterContext3(
    "useSubmit"
    /* UseSubmit */
  );
  let { basename } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
  let currentRouteId = useRouteId();
  return dashboard__loadShare__react__loadShare__.useCallback(
    async (target, options = {}) => {
      let { action, method, encType, formData, body } = getFormSubmissionInfo(
        target,
        basename
      );
      if (options.navigate === false) {
        let key = options.fetcherKey || getUniqueFetcherId();
        await router.fetch(key, currentRouteId, options.action || action, {
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          flushSync: options.flushSync
        });
      } else {
        await router.navigate(options.action || action, {
          preventScrollReset: options.preventScrollReset,
          formData,
          body,
          formMethod: options.method || method,
          formEncType: options.encType || encType,
          replace: options.replace,
          state: options.state,
          fromRouteId: currentRouteId,
          flushSync: options.flushSync,
          viewTransition: options.viewTransition
        });
      }
    },
    [router, basename, currentRouteId]
  );
}
function useFormAction(action, { relative } = {}) {
  let { basename } = dashboard__loadShare__react__loadShare__.useContext(NavigationContext);
  let routeContext = dashboard__loadShare__react__loadShare__.useContext(RouteContext);
  invariant(routeContext, "useFormAction must be used inside a RouteContext");
  let [match] = routeContext.matches.slice(-1);
  let path = { ...useResolvedPath(action ? action : ".", { relative }) };
  let location = useLocation();
  if (action == null) {
    path.search = location.search;
    let params = new URLSearchParams(path.search);
    let indexValues = params.getAll("index");
    let hasNakedIndexParam = indexValues.some((v) => v === "");
    if (hasNakedIndexParam) {
      params.delete("index");
      indexValues.filter((v) => v).forEach((v) => params.append("index", v));
      let qs = params.toString();
      path.search = qs ? `?${qs}` : "";
    }
  }
  if ((!action || action === ".") && match.route.index) {
    path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
  }
  if (basename !== "/") {
    path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }
  return createPath(path);
}
function useViewTransitionState(to, opts = {}) {
  let vtContext = dashboard__loadShare__react__loadShare__.useContext(ViewTransitionContext);
  invariant(
    vtContext != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?"
  );
  let { basename } = useDataRouterContext3(
    "useViewTransitionState"
    /* useViewTransitionState */
  );
  let path = useResolvedPath(to, { relative: opts.relative });
  if (!vtContext.isTransitioning) {
    return false;
  }
  let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
  let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
  return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
new TextEncoder();
function deserializeErrors2(errors) {
  if (!errors) return null;
  let entries = Object.entries(errors);
  let serialized = {};
  for (let [key, val] of entries) {
    if (val && val.__type === "RouteErrorResponse") {
      serialized[key] = new ErrorResponseImpl(
        val.status,
        val.statusText,
        val.data,
        val.internal === true
      );
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
 * react-router v7.5.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
function RouterProvider2(props) {
  return /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RouterProvider, { flushSync: dashboard__loadShare__react_mf_2_dom__loadShare__.flushSync, ...props });
}
var ssrInfo = null;
var router = null;
function initSsrInfo() {
  if (!ssrInfo && window.__reactRouterContext && window.__reactRouterManifest && window.__reactRouterRouteModules) {
    if (window.__reactRouterManifest.sri === true) {
      const importMap = document.querySelector("script[rr-importmap]");
      if (importMap?.textContent) {
        try {
          window.__reactRouterManifest.sri = JSON.parse(
            importMap.textContent
          ).integrity;
        } catch (err) {
          console.error("Failed to parse import map", err);
        }
      }
    }
    ssrInfo = {
      context: window.__reactRouterContext,
      manifest: window.__reactRouterManifest,
      routeModules: window.__reactRouterRouteModules,
      stateDecodingPromise: void 0,
      router: void 0,
      routerInitialized: false
    };
  }
}
function createHydratedRouter({
  unstable_getContext
}) {
  initSsrInfo();
  if (!ssrInfo) {
    throw new Error(
      "You must be using the SSR features of React Router in order to skip passing a `router` prop to `<RouterProvider>`"
    );
  }
  let localSsrInfo = ssrInfo;
  if (!ssrInfo.stateDecodingPromise) {
    let stream = ssrInfo.context.stream;
    invariant(stream, "No stream found for single fetch decoding");
    ssrInfo.context.stream = void 0;
    ssrInfo.stateDecodingPromise = decodeViaTurboStream(stream, window).then((value) => {
      ssrInfo.context.state = value.value;
      localSsrInfo.stateDecodingPromise.value = true;
    }).catch((e) => {
      localSsrInfo.stateDecodingPromise.error = e;
    });
  }
  if (ssrInfo.stateDecodingPromise.error) {
    throw ssrInfo.stateDecodingPromise.error;
  }
  if (!ssrInfo.stateDecodingPromise.value) {
    throw ssrInfo.stateDecodingPromise;
  }
  let routes = createClientRoutes(
    ssrInfo.manifest.routes,
    ssrInfo.routeModules,
    ssrInfo.context.state,
    ssrInfo.context.ssr,
    ssrInfo.context.isSpaMode
  );
  let hydrationData = void 0;
  let loaderData = ssrInfo.context.state.loaderData;
  if (ssrInfo.context.isSpaMode) {
    if (ssrInfo.manifest.routes.root?.hasLoader && loaderData && "root" in loaderData) {
      hydrationData = {
        loaderData: {
          root: loaderData.root
        }
      };
    }
  } else {
    hydrationData = {
      ...ssrInfo.context.state,
      loaderData: { ...loaderData }
    };
    let initialMatches = matchRoutes(
      routes,
      window.location,
      window.__reactRouterContext?.basename
    );
    if (initialMatches) {
      for (let match of initialMatches) {
        let routeId = match.route.id;
        let route = ssrInfo.routeModules[routeId];
        let manifestRoute = ssrInfo.manifest.routes[routeId];
        if (route && manifestRoute && shouldHydrateRouteLoader(
          manifestRoute,
          route,
          ssrInfo.context.isSpaMode
        ) && (route.HydrateFallback || !manifestRoute.hasLoader)) {
          delete hydrationData.loaderData[routeId];
        } else if (manifestRoute && !manifestRoute.hasLoader) {
          hydrationData.loaderData[routeId] = null;
        }
      }
    }
    if (hydrationData && hydrationData.errors) {
      hydrationData.errors = deserializeErrors2(hydrationData.errors);
    }
  }
  let router2 = createRouter({
    routes,
    history: createBrowserHistory(),
    basename: ssrInfo.context.basename,
    unstable_getContext,
    hydrationData,
    mapRouteProperties,
    future: {
      unstable_middleware: ssrInfo.context.future.unstable_middleware
    },
    dataStrategy: getSingleFetchDataStrategy(
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.basename,
      () => router2
    ),
    patchRoutesOnNavigation: getPatchRoutesOnNavigationFunction(
      ssrInfo.manifest,
      ssrInfo.routeModules,
      ssrInfo.context.ssr,
      ssrInfo.context.isSpaMode,
      ssrInfo.context.basename
    )
  });
  ssrInfo.router = router2;
  if (router2.state.initialized) {
    ssrInfo.routerInitialized = true;
    router2.initialize();
  }
  router2.createRoutesForHMR = /* spacer so ts-ignore does not affect the right hand of the assignment */
  createClientRoutesWithHMRRevalidationOptOut;
  window.__reactRouterDataRouter = router2;
  return router2;
}
function HydratedRouter(props) {
  if (!router) {
    router = createHydratedRouter({
      unstable_getContext: props.unstable_getContext
    });
  }
  let [criticalCss, setCriticalCss] = dashboard__loadShare__react__loadShare__.useState(
    ssrInfo?.context.criticalCss 
  );
  {
    if (ssrInfo) {
      window.__reactRouterClearCriticalCss = () => setCriticalCss(void 0);
    }
  }
  let [location, setLocation] = dashboard__loadShare__react__loadShare__.useState(router.state.location);
  dashboard__loadShare__react__loadShare__.useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router && !ssrInfo.routerInitialized) {
      ssrInfo.routerInitialized = true;
      ssrInfo.router.initialize();
    }
  }, []);
  dashboard__loadShare__react__loadShare__.useLayoutEffect(() => {
    if (ssrInfo && ssrInfo.router) {
      return ssrInfo.router.subscribe((newState) => {
        if (newState.location !== location) {
          setLocation(newState.location);
        }
      });
    }
  }, [location]);
  invariant(ssrInfo, "ssrInfo unavailable for HydratedRouter");
  useFogOFWarDiscovery(
    router,
    ssrInfo.manifest,
    ssrInfo.routeModules,
    ssrInfo.context.ssr,
    ssrInfo.context.isSpaMode
  );
  return (
    // This fragment is important to ensure we match the <ServerRouter> JSX
    // structure so that useId values hydrate correctly
    /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(
      FrameworkContext$1.Provider,
      {
        value: {
          manifest: ssrInfo.manifest,
          routeModules: ssrInfo.routeModules,
          future: ssrInfo.context.future,
          criticalCss,
          ssr: ssrInfo.context.ssr,
          isSpaMode: ssrInfo.context.isSpaMode
        }
      },
      /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RemixErrorBoundary, { location }, /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(RouterProvider2, { router }))
    ), /* @__PURE__ */ dashboard__loadShare__react__loadShare__.createElement(dashboard__loadShare__react__loadShare__.Fragment, null))
  );
}

/**
 * react-router-dom v7.5.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */

const ReactRouterDOM = /*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  HydratedRouter,
  RouterProvider: RouterProvider2
}, [dashboard__loadShare__react_mf_2_router__loadShare__]);

function e() {
  const t = new PopStateEvent("popstate", { state: window.history.state });
  window.dispatchEvent(t);
}
const RemoteAppWrapper = dashboard__loadShare__react__loadShare__.forwardRef(function(props, ref) {
  const {
    moduleName,
    memoryRoute,
    basename,
    providerInfo,
    className,
    style,
    fallback,
    ...resProps
  } = props;
  const instance = federationRuntime.instance;
  const rootRef = ref && "current" in ref ? ref : dashboard__loadShare__react__loadShare__.useRef(null);
  const renderDom = dashboard__loadShare__react__loadShare__.useRef(null);
  const providerInfoRef = dashboard__loadShare__react__loadShare__.useRef(null);
  const [initialized, setInitialized] = dashboard__loadShare__react__loadShare__.useState(false);
  LoggerInstance.debug(`RemoteAppWrapper instance from props >>>`, instance);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (initialized) return;
    const providerReturn = providerInfo();
    providerInfoRef.current = providerReturn;
    setInitialized(true);
    return () => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if ((_a = providerInfoRef.current) == null ? void 0 : _a.destroy) {
        LoggerInstance.debug(
          `createRemoteComponent LazyComponent destroy >>>`,
          { moduleName, basename, dom: renderDom.current }
        );
        (_d = (_c = (_b = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _b.lifecycle) == null ? void 0 : _c.beforeBridgeDestroy) == null ? void 0 : _d.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps
        });
        (_e = providerInfoRef.current) == null ? void 0 : _e.destroy({
          moduleName,
          dom: renderDom.current
        });
        (_h = (_g = (_f = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _f.lifecycle) == null ? void 0 : _g.afterBridgeDestroy) == null ? void 0 : _h.emit({
          moduleName,
          dom: renderDom.current,
          basename,
          memoryRoute,
          fallback,
          ...resProps
        });
      }
    };
  }, [moduleName]);
  dashboard__loadShare__react__loadShare__.useEffect(() => {
    var _a, _b, _c, _d, _e, _f;
    if (!initialized || !providerInfoRef.current) return;
    let renderProps = {
      moduleName,
      dom: rootRef.current,
      basename,
      memoryRoute,
      fallback,
      ...resProps
    };
    renderDom.current = rootRef.current;
    const beforeBridgeRenderRes = ((_c = (_b = (_a = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _a.lifecycle) == null ? void 0 : _b.beforeBridgeRender) == null ? void 0 : _c.emit(renderProps)) || {};
    renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
    providerInfoRef.current.render(renderProps);
    (_f = (_e = (_d = instance == null ? void 0 : instance.bridgeHook) == null ? void 0 : _d.lifecycle) == null ? void 0 : _e.afterBridgeRender) == null ? void 0 : _f.emit(renderProps);
  }, [initialized, ...Object.values(props)]);
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ""}`;
  return /* @__PURE__ */ React3.createElement("div", { className: rootComponentClassName, style, ref: rootRef });
});
function withRouterData(WrappedComponent) {
  const Component = dashboard__loadShare__react__loadShare__.forwardRef(function(props, ref) {
    var _a;
    if (props == null ? void 0 : props.basename) {
      return /* @__PURE__ */ React3.createElement(WrappedComponent, { ...props, basename: props.basename, ref });
    }
    let enableDispathPopstate = false;
    let routerContextVal;
    try {
      dashboard__loadShare__react_mf_2_router__loadShare__.useLocation();
      enableDispathPopstate = true;
    } catch {
      enableDispathPopstate = false;
    }
    let basename = "/";
    if (!props.basename && enableDispathPopstate) {
      const ReactRouterDOMAny = ReactRouterDOM;
      const useRouteMatch = ReactRouterDOMAny["useRouteMatch"];
      const useHistory = ReactRouterDOMAny["useHistory"];
      const useHref = ReactRouterDOMAny["useHref"];
      const UNSAFE_RouteContext = ReactRouterDOMAny["UNSAFE_RouteContext"];
      if (UNSAFE_RouteContext) {
        if (useHref) {
          basename = useHref == null ? void 0 : useHref("/");
        }
        routerContextVal = dashboard__loadShare__react__loadShare__.useContext(UNSAFE_RouteContext);
        if (routerContextVal && routerContextVal.matches && routerContextVal.matches.length > 0) {
          const matchIndex = routerContextVal.matches.length - 1;
          const pathnameBase = routerContextVal.matches[matchIndex].pathnameBase;
          basename = pathJoin(basename, pathnameBase || "/");
        }
      } else {
        const match = useRouteMatch == null ? void 0 : useRouteMatch();
        if (useHistory) {
          const history = useHistory == null ? void 0 : useHistory();
          basename = (_a = history == null ? void 0 : history.createHref) == null ? void 0 : _a.call(history, { pathname: "/" });
        }
        if (match) {
          basename = pathJoin(basename, (match == null ? void 0 : match.path) || "/");
        }
      }
    }
    LoggerInstance.debug(`createRemoteComponent withRouterData >>>`, {
      ...props,
      basename,
      routerContextVal,
      enableDispathPopstate
    });
    if (enableDispathPopstate) {
      const location = dashboard__loadShare__react_mf_2_router__loadShare__.useLocation();
      const [pathname, setPathname] = dashboard__loadShare__react__loadShare__.useState(location.pathname);
      dashboard__loadShare__react__loadShare__.useEffect(() => {
        if (pathname !== "" && pathname !== location.pathname) {
          LoggerInstance.debug(
            `createRemoteComponent dispatchPopstateEnv >>>`,
            {
              name: props.name,
              pathname: location.pathname
            }
          );
          e();
        }
        setPathname(location.pathname);
      }, [location]);
    }
    return /* @__PURE__ */ React3.createElement(WrappedComponent, { ...props, basename, ref });
  });
  return dashboard__loadShare__react__loadShare__.forwardRef(function(props, ref) {
    return /* @__PURE__ */ React3.createElement(Component, { ...props, ref });
  });
}
const RemoteApp = withRouterData(RemoteAppWrapper);
function createLazyRemoteComponent(info) {
  const exportName = (info == null ? void 0 : info.export) || "default";
  return React3.lazy(async () => {
    LoggerInstance.debug(`createRemoteComponent LazyComponent create >>>`, {
      lazyComponent: info.loader,
      exportName
    });
    try {
      const m = await info.loader();
      const moduleName = m && m[Symbol.for("mf_module_id")];
      LoggerInstance.debug(
        `createRemoteComponent LazyComponent loadRemote info >>>`,
        { name: moduleName, module: m, exportName }
      );
      const exportFn = m[exportName];
      if (exportName in m && typeof exportFn === "function") {
        const RemoteAppComponent = dashboard__loadShare__react__loadShare__.forwardRef((props, ref) => {
          return /* @__PURE__ */ React3.createElement(
            RemoteApp,
            {
              moduleName,
              providerInfo: exportFn,
              exportName: info.export || "default",
              fallback: info.fallback,
              ref,
              ...props
            }
          );
        });
        return {
          default: RemoteAppComponent
        };
      } else {
        LoggerInstance.debug(
          `createRemoteComponent LazyComponent module not found >>>`,
          { name: moduleName, module: m, exportName }
        );
        throw Error(
          `Make sure that ${moduleName} has the correct export when export is ${String(
            exportName
          )}`
        );
      }
    } catch (error) {
      throw error;
    }
  });
}
function createRemoteComponent(info) {
  const LazyComponent = createLazyRemoteComponent(info);
  return dashboard__loadShare__react__loadShare__.forwardRef((props, ref) => {
    return /* @__PURE__ */ React3.createElement(
      ErrorBoundary$1,
      {
        FallbackComponent: info.fallback
      },
      /* @__PURE__ */ React3.createElement(React3.Suspense, { fallback: info.loading }, /* @__PURE__ */ React3.createElement(LazyComponent, { ...props, ref }))
    );
  });
}

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
	_createRemoteComponent = (...args) => createRemoteComponent.apply(null, args);
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
				error: new Error(`Failed to load plugin: ${pluginId}`),
				id: pluginId
			});
			else {
				if (!validatePlugin(plugin)) {
					errors.push({
						category: ERROR_CATEGORIES.PLUGIN,
						error: new Error(`Plugin ${plugin.id} does not comply with Plugin interface`),
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
					error: new Error(`Feature ${feature.id} does not comply with FrameworkFeature interface`),
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
		const feature = await this.#plugins.loadFeature(id);
		return feature;
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
		const caps = await Promise.all(ids.map((id) => this.get(id)));
		const filteredCaps = caps.filter(Boolean);
		const pluginOrder = this.#framework.getPluginManager().getInitializationOrder();
		const pluginOrderMap = new Map(pluginOrder.map((id, index) => [id, index]));
		const originalIndices = new Map(filteredCaps.map((cap, idx) => [cap.id, idx]));
		return filteredCaps.sort((a, b) => {
			const aPlugin = this.#capabilityToPlugin.get(a.id) || "";
			const bPlugin = this.#capabilityToPlugin.get(b.id) || "";
			const aIndex = pluginOrderMap.get(aPlugin) ?? pluginOrder.length;
			const bIndex = pluginOrderMap.get(bPlugin) ?? pluginOrder.length;
			const diff = aIndex - bIndex;
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
		const sortedIds = graph.topologicalSort();
		return sortedIds.map((id) => this.#capabilities.get(id)).filter((cap) => !!cap);
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
registerBridgedContext(FrameworkContext);
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
			if (result.errors) throw Object.assign(new Error("Framework initialization failed"), { errors: result.errors });
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
			const error = err instanceof Error ? err : new Error("Failed to initialize framework");
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
	const fetchCapability = dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getCapability(id);
	}, [framework, id]);
	return useFrameworkData(fetchCapability);
}
function useFeature(id) {
	const { framework } = useFramework();
	const fetchFeature = dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getFeature(id);
	}, [framework, id]);
	return useFrameworkData(fetchFeature);
}
function useCapabilitiesByType(typeId) {
	const { framework } = useFramework();
	const fetchByType = dashboard__loadShare__react__loadShare__.useCallback(() => {
		if (!framework) throw new Error("Framework not initialized");
		return framework.getCapabilitiesByType(typeId);
	}, [framework, typeId]);
	return useFrameworkData(fetchByType);
}

//#region src/hooks/useWidgetArea.ts
function useWidgetArea(id) {
	const { framework } = useFramework();
	const area = framework.getWidgetArea(id);
	const widgets = framework.getWidgetsForArea(id);
	const filteredWidgets = widgets.filter((widget) => {
		if (widget.visibilityHook) return widget.visibilityHook();
		return true;
	});
	const sortedWidgets = sortWidgets(filteredWidgets);
	const isVisible = filteredWidgets.length > 0;
	return {
		area,
		isVisible,
		widgets: sortedWidgets
	};
}

//#region src/components/FlexWidgetArea.tsx
function FlexWidgetArea({ className, id, tag = "div" }) {
	const { isVisible, widgets } = useWidgetArea(id);
	if (!isVisible) return null;
	const ContainerTag = tag;
	return /* @__PURE__ */ jsxRuntimeExports.jsx(ContainerTag, {
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
	const resolved = rowHeight ?? DEFAULT_WIDGET_AREA_DEFINITION.rowHeight;
	if (resolved === "auto") return "auto-rows-auto";
	return "";
}
function getGridGap(gap = DEFAULT_WIDGET_AREA_DEFINITION.gap) {
	const resolved = gap ?? DEFAULT_WIDGET_AREA_DEFINITION.gap;
	return GRID_GAP_CLASSES[resolved] || "";
}
function getGridRowSpanClass(height) {
	const key = `span_${height}`;
	return GRID_ROW_SPAN_CLASSES[key] || "";
}
function getGridStyles(area) {
	const gapClass = getGridGap(area.grid.gap);
	const gapStyle = gapClass ? void 0 : area.grid.gap ? `${area.grid.gap}px` : void 0;
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
	if (column !== void 0 && span !== void 0) {
		const key = `start_${column}_span_${span}`;
		return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key] || "";
	} else if (column !== void 0) {
		const key = `start_${column}_span_1`;
		return RESPONSIVE_GRID_COLUMN_SPAN_CLASSES[key] || "";
	} else {
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
	const gridGapClass = getGridGap(area.grid.gap);
	return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
		className: dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.cn("grid", gridGapClass || "gap-5", getResponsiveGridTemplateColumnsClass(area.grid.columns), gridAutoRowsClass),
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
		return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, {
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
			return void 0;
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
		const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : domain;
		return `${cleanProto}.${rootDomain}`;
	}
	return `${cleanProto}.${domain}`;
}

//#region src/util/getSdk.ts
async function getSdk(framework) {
	const sdkCaps = await framework.getCapabilitiesByType("core:sdk");
	if (!sdkCaps?.length) throw new Error("SDK not found");
	const sdk = sdkCaps.pop();
	return sdk.getSdk();
}

//#region src/util/refineConfig.ts
function ensureResource(resources = [], resourceName, meta = {}) {
	const hasResource = resources.some((r) => r.name === resourceName);
	return hasResource ? resources : [...resources, {
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

export { Builder, ErrorDisplay, FlexWidgetArea, Framework, FrameworkProvider, GridWidgetArea, HostContextBridge, MockFrameworkProvider, PluginManager, RemoteContextConsumer, RouteErrorBoundary, RouteErrorBoundaryFallback, RouteLoading, __test_clearCache, cleanProtocolString, cleanTrailingSlashes, createBridgeComponent, createNamespacedId, createRemoteComponentLoader, defaultRemoteOptions, ensureResource, env, fetchPortalMeta, getAccountSubdomain, getApiBaseUrl, getCurrentLocation, getDefaultRefineOptions, getPluginMeta, getPortalPluginManifests, getProtocolDomain, getSdk, isNamespacedId, mergeRefineConfig, normalizeDataProvider, normalizeId, parseNamespacedId, registerBridgedContext, resetCurrentLocation, setCurrentLocation, useCapabilitiesByType, useCapability, useFeature, useFramework, useFrameworkLoading, validateCapability, validateCapabilityDetailed, validateFeature, validateFeatureDetailed, validateNamespacedId, validatePlugin, validatePluginDetailed };
