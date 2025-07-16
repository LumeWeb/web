import { a as admin__loadShare__react_mf_2_dom__loadShare__ } from "./admin__loadShare__react_mf_2_dom__loadShare__-BCMi2lGq.js";
var createRoot;
var m = admin__loadShare__react_mf_2_dom__loadShare__;
{
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}
var define_process_env_default = {};
function parseWithDictionary(dictionary, value) {
  const result = {};
  const issues = [];
  for (const key in dictionary) {
    const schema = dictionary[key];
    const prop = value[key];
    const propResult = schema["~standard"].validate(prop);
    if (propResult instanceof Promise) {
      throw new Error(`Validation must be synchronous, but ${key} returned a Promise.`);
    }
    if (propResult.issues) {
      issues.push(...propResult.issues.map((issue) => ({
        ...issue,
        path: [
          key,
          ...issue.path ?? []
        ]
      })));
      continue;
    }
    result[key] = propResult.value;
  }
  if (issues.length) {
    return {
      issues
    };
  }
  return {
    value: result
  };
}
function createEnv(opts) {
  const runtimeEnv = opts.runtimeEnvStrict ?? opts.runtimeEnv ?? define_process_env_default;
  const emptyStringAsUndefined = opts.emptyStringAsUndefined ?? false;
  if (emptyStringAsUndefined) {
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (value === "") {
        delete runtimeEnv[key];
      }
    }
  }
  const skip = !!opts.skipValidation;
  if (skip) return runtimeEnv;
  const _client = typeof opts.client === "object" ? opts.client : {};
  const _server = typeof opts.server === "object" ? opts.server : {};
  const _shared = typeof opts.shared === "object" ? opts.shared : {};
  const isServer = opts.isServer ?? (typeof window === "undefined" || "Deno" in window);
  const finalSchema = isServer ? {
    ..._server,
    ..._shared,
    ..._client
  } : {
    ..._client,
    ..._shared
  };
  const parsed = parseWithDictionary(finalSchema, runtimeEnv);
  const onValidationError = opts.onValidationError ?? ((issues) => {
    console.error("❌ Invalid environment variables:", issues);
    throw new Error("Invalid environment variables");
  });
  const onInvalidAccess = opts.onInvalidAccess ?? (() => {
    throw new Error("❌ Attempted to access a server-side environment variable on the client");
  });
  if (parsed.issues) {
    return onValidationError(parsed.issues);
  }
  const isServerAccess = (prop) => {
    if (!opts.clientPrefix) return true;
    return !prop.startsWith(opts.clientPrefix) && !(prop in _shared);
  };
  const isValidServerAccess = (prop) => {
    return isServer || !isServerAccess(prop);
  };
  const ignoreProp = (prop) => {
    return prop === "__esModule" || prop === "$$typeof";
  };
  const extendedObj = (opts.extends ?? []).reduce((acc, curr) => {
    return Object.assign(acc, curr);
  }, {});
  const fullObj = Object.assign(parsed.value, extendedObj);
  const env = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return void 0;
      if (ignoreProp(prop)) return void 0;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    }
  });
  return env;
}
export {
  createRoot as a,
  createEnv as c
};
