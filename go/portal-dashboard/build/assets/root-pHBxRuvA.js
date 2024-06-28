import { u as useLocation, d as useMatches, r as reactExports, e as useNavigate, f as useParams, R as React, j as jsxRuntimeExports, O as Outlet } from "./index-D_nKaDFf.js";
import { G, i as it, a as Go, B as Buffer, Q as QueryClient, b as QueryClientProvider, j as ju } from "./index-CdKFiKW0.js";
import { f as useRemixContext, _ as _extends, L as Link, M as Meta, h as Links, S as Scripts } from "./components-BjLx0zCB.js";
import { S as SdkContextProvider, u as useSdk } from "./sdk-context-umh223ZI.js";
import { T as ToastProvider, a as Toast, b as ToastTitle, c as ToastDescription, d as ToastClose, e as ToastViewport, f as ToastAction } from "./toast-BRtHcHLh.js";
import { c as customInstance, P as PROTOCOL_S5, a as createProtocol, S as S5, M as Multihash, C as CID, b as CID_TYPES, U as Unpacker, m as metadataMagicByte, d as METADATA_TYPES, e as PinningProcess } from "./pinning-DQLv895D.js";
import { z } from "./index-D6hcoGBN.js";
import { u as useScrollRestoration } from "./index-reyVn01_.js";
import "./index-DTpHO9Dm.js";
import "./utils-Cugm_gHJ.js";
import "./index-CnnG_NQj.js";
/**
 * @remix-run/react v2.10.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
let STORAGE_KEY = "positions";
function ScrollRestoration({
  getKey,
  ...props
}) {
  let {
    isSpaMode
  } = useRemixContext();
  let location = useLocation();
  let matches = useMatches();
  useScrollRestoration({
    getKey,
    storageKey: STORAGE_KEY
  });
  let key = reactExports.useMemo(
    () => {
      if (!getKey) return null;
      let userKey = getKey(location, matches);
      return userKey !== location.key ? userKey : null;
    },
    // Nah, we only need this the first time for the SSR render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  if (isSpaMode) {
    return null;
  }
  let restoreScroll = ((STORAGE_KEY2, restoreKey) => {
    if (!window.history.state || !window.history.state.key) {
      let key2 = Math.random().toString(32).slice(2);
      window.history.replaceState({
        key: key2
      }, "");
    }
    try {
      let positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY2) || "{}");
      let storedY = positions[restoreKey || window.history.state.key];
      if (typeof storedY === "number") {
        window.scrollTo(0, storedY);
      }
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(STORAGE_KEY2);
    }
  }).toString();
  return /* @__PURE__ */ reactExports.createElement("script", _extends({}, props, {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(${restoreScroll})(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(key)})`
    }
  }));
}
const stylesheet = "/assets/tailwind-MW1L7a8h.css";
var g = (e, r) => {
  let t = {}, a = r.replace(/^\/|\/$/g, ""), n = e.replace(/^\/|\/$/g, ""), o = a.split("/"), u = n.split("/");
  return o.forEach((i, s) => {
    var p;
    i.startsWith(":") && ((p = u[s]) == null ? void 0 : p.length) > 0 && (t[i.replace(":", "")] = u[s]);
  }), t;
};
var h = (e) => {
  if (typeof e > "u") return e;
  let r = Number(e);
  return `${r}` === e ? r : e;
};
var x = { addQueryPrefix: true, skipNulls: true, arrayFormat: "indices", encode: false, encodeValuesOnly: true }, E = { go: () => {
  let { search: e, hash: r } = useLocation(), t = useNavigate();
  return reactExports.useCallback(({ to: n, type: o, query: u, hash: i, options: { keepQuery: s, keepHash: p } = {} }) => {
    let c = { ...s && e && G.parse(e, { ignoreQueryPrefix: true }), ...u };
    c.to && (c.to = encodeURIComponent(`${c.to}`));
    let f = Object.keys(c).length > 0, l = `#${(i || p && r || "").replace(/^#/, "")}`, T = l.length > 1, C = `${n || ""}${f ? G.stringify(c, x) : ""}${T ? l : ""}`;
    return o === "path" ? C : t(C, { replace: o === "replace" });
  }, [r, e, t]);
}, back: () => {
  let e = useNavigate();
  return () => {
    e(-1);
  };
}, parse: () => {
  let e = useParams(), { pathname: r, search: t } = useLocation(), { resources: a } = reactExports.useContext(it), { resource: n, action: o, matchedRoute: u } = React.useMemo(() => Go(r, a), [a, r]), i = u && r ? g(r, u) : {}, s = i.id;
  return reactExports.useCallback(() => {
    let c = G.parse(t, { ignoreQueryPrefix: true }), f = { ...i, ...e, ...c };
    return { ...n && { resource: n }, ...o && { action: o }, ...s && { id: decodeURIComponent(s) }, ...(e == null ? void 0 : e.id) && { id: decodeURIComponent(e.id) }, pathname: r, params: { ...f, current: h(f.current), pageSize: h(f.pageSize), to: f.to ? decodeURIComponent(f.to) : void 0 } };
  }, [r, t, e, n, o, i, s]);
}, Link: React.forwardRef(function(r, t) {
  return React.createElement(Link, { ...r, ref: t });
}) };
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = reactExports.useState(memoryState);
  reactExports.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const notificationProvider = () => {
  return {
    open: ({
      key,
      message,
      description,
      undoableTimeout,
      cancelMutation,
      action,
      type
    }) => {
      toast({
        variant: type,
        key,
        title: message,
        description,
        duration: undoableTimeout,
        action,
        cancelMutation
      });
    },
    close: () => {
    }
  };
};
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ToastProvider, { children: [
    toasts.map(
      ({ id, title, description, action, cancelMutation, ...props }) => {
        const undoButton = cancelMutation ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToastAction, { altText: "Undo", onClick: cancelMutation, children: "Undo" }) : void 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Toast, { ...props, variant: "default", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1", children: [
            title && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastTitle, { children: title }),
            description && /* @__PURE__ */ jsxRuntimeExports.jsx(ToastDescription, { children: description })
          ] }),
          action,
          undoButton,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ToastClose, {})
        ] }, id);
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToastViewport, {})
  ] });
}
const postApiAuthLogin = (loginRequest, options) => {
  return customInstance(
    {
      url: `/api/auth/login`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: loginRequest
    },
    options
  );
};
const postApiAuthLogout = (options) => {
  return customInstance(
    {
      url: `/api/auth/logout`,
      method: "POST"
    },
    options
  );
};
const postApiAuthRegister = (registerRequest, options) => {
  return customInstance(
    {
      url: `/api/auth/register`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: registerRequest
    },
    options
  );
};
const postApiAccountVerifyEmail = (verifyEmailRequest, options) => {
  return customInstance(
    {
      url: `/api/account/verify-email`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: verifyEmailRequest
    },
    options
  );
};
const postApiAccountVerifyEmailResend = (options) => {
  return customInstance(
    {
      url: `/api/account/verify-email/resend`,
      method: "POST"
    },
    options
  );
};
const getApiAuthOtpGenerate = (options) => {
  return customInstance(
    {
      url: `/api/auth/otp/generate`,
      method: "GET"
    },
    options
  );
};
const postApiAccountOtpVerify = (oTPVerifyRequest, options) => {
  return customInstance(
    {
      url: `/api/account/otp/verify`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: oTPVerifyRequest
    },
    options
  );
};
const postApiAccountOtpValidate = (oTPValidateRequest, options) => {
  return customInstance(
    {
      url: `/api/account/otp/validate`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: oTPValidateRequest
    },
    options
  );
};
const postApiAuthOtpDisable = (oTPDisableRequest, options) => {
  return customInstance(
    {
      url: `/api/auth/otp/disable`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: oTPDisableRequest
    },
    options
  );
};
const postApiAccountPasswordResetRequest = (passwordResetRequest, options) => {
  return customInstance(
    {
      url: `/api/account/password-reset/request`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: passwordResetRequest
    },
    options
  );
};
const postApiAccountPasswordResetConfirm = (passwordResetVerifyRequest, options) => {
  return customInstance(
    {
      url: `/api/account/password-reset/confirm`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: passwordResetVerifyRequest
    },
    options
  );
};
const postApiAuthPing = (options) => {
  return customInstance(
    {
      url: `/api/auth/ping`,
      method: "POST"
    },
    options
  );
};
const getApiAccount = (options) => {
  return customInstance(
    {
      url: `/api/account`,
      method: "GET"
    },
    options
  );
};
const postApiAccountUpdateEmail = (updateEmailRequest, options) => {
  return customInstance(
    {
      url: `/api/account/update-email`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: updateEmailRequest
    },
    options
  );
};
const postApiAccountUpdatePassword = (updatePasswordRequest, options) => {
  return customInstance(
    {
      url: `/api/account/update-password`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: updatePasswordRequest
    },
    options
  );
};
const getApiUploadLimit = (options) => {
  return customInstance(
    {
      url: `/api/upload-limit`,
      method: "GET"
    },
    options
  );
};
class AccountError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AccountError";
    this.statusCode = statusCode;
  }
}
class AccountApi {
  constructor(apiUrl) {
    let apiUrlParsed = new URL(apiUrl);
    apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
    this.apiUrl = apiUrlParsed.toString();
  }
  set jwtToken(value) {
    this._jwtToken = value;
  }
  get jwtToken() {
    return this._jwtToken;
  }
  static create(apiUrl) {
    return new AccountApi(apiUrl);
  }
  async login(loginRequest) {
    var _a, _b;
    let ret = false;
    try {
      ret = await postApiAuthLogin(loginRequest, { baseURL: this.apiUrl });
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    ret = this.checkSuccessVal(ret);
    if (ret) {
      this._jwtToken = ret.token;
      return true;
    }
    return false;
  }
  async register(registerRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAuthRegister(registerRequest, {
        baseURL: this.apiUrl
      });
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async verifyEmail(verifyEmailRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountVerifyEmail(
        verifyEmailRequest,
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async requestEmailVerification() {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountVerifyEmailResend(this.buildOptions());
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async generateOtp() {
    var _a, _b;
    let ret;
    try {
      ret = await getApiAuthOtpGenerate(this.buildOptions());
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessVal(ret);
  }
  async verifyOtp(otpVerifyRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountOtpVerify(
        otpVerifyRequest,
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async validateOtp(otpValidateRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountOtpValidate(
        otpValidateRequest,
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async disableOtp(otpDisableRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAuthOtpDisable(otpDisableRequest, this.buildOptions());
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async requestPasswordReset(passwordResetRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountPasswordResetRequest(
        passwordResetRequest,
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async confirmPasswordReset(passwordResetVerifyRequest) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountPasswordResetConfirm(
        passwordResetVerifyRequest,
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async ping() {
    let ret;
    try {
      ret = await postApiAuthPing(this.buildOptions());
    } catch (e) {
      return false;
    }
    const success = this.checkSuccessVal(ret) && ret.data.ping == "pong";
    if (success) {
      this._jwtToken = ret.data.token;
    }
    return success;
  }
  async info() {
    let ret;
    try {
      ret = await getApiAccount(this.buildOptions());
    } catch (e) {
      return false;
    }
    return this.checkSuccessVal(ret);
  }
  async logout() {
    try {
      await postApiAuthLogout(this.buildOptions());
    } catch (e) {
      return false;
    }
    this._jwtToken = void 0;
    return true;
  }
  async uploadLimit() {
    let ret;
    try {
      ret = await getApiUploadLimit(this.buildOptions());
    } catch (e) {
      return 0;
    }
    return this.checkSuccessVal(ret) ? ret.data.limit : 0;
  }
  async updateEmail(email, password) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountUpdateEmail(
        { email, password },
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  async updatePassword(currentPassword, newPassword) {
    var _a, _b;
    let ret;
    try {
      ret = await postApiAccountUpdatePassword(
        { current_password: currentPassword, new_password: newPassword },
        this.buildOptions()
      );
    } catch (e) {
      return new AccountError(
        (_a = e.response) == null ? void 0 : _a.data,
        (_b = e.response) == null ? void 0 : _b.status
      );
    }
    return this.checkSuccessBool(ret);
  }
  checkSuccessBool(ret) {
    return ret.status === 200;
  }
  checkSuccessVal(ret) {
    if (ret.status === 200) {
      return ret.data;
    }
    return false;
  }
  buildOptions() {
    const headers = {};
    if (this.jwtToken) {
      headers.Authorization = `Bearer ${this.jwtToken}`;
    }
    return {
      baseURL: this.apiUrl,
      headers
    };
  }
}
class Registry {
  constructor(sdk) {
    this.store = /* @__PURE__ */ new Map();
    this.sdk = sdk;
  }
  register(name, value) {
    this.store.set(name, value);
  }
  get(name) {
    return this.store.get(name);
  }
  [Symbol.iterator]() {
    return this.store[Symbol.iterator]();
  }
  getApiDomain() {
    if (!this._apiDomain) {
      const urlObject = new URL(this.sdk.apiUrl);
      this._apiDomain = urlObject.hostname;
    }
    return this._apiDomain;
  }
}
function registerDefaults(registry) {
  registry.register(
    PROTOCOL_S5,
    createProtocol(S5, registry.getApiDomain())
  );
}
class Sdk {
  constructor(apiUrl) {
    this._apiUrl = apiUrl;
  }
  get apiUrl() {
    return this._apiUrl;
  }
  set apiUrl(value) {
    this._apiUrl = value;
  }
  static create(apiUrl) {
    return new Sdk(apiUrl);
  }
  account() {
    if (!this.accountApi) {
      this.accountApi = AccountApi.create(this._apiUrl);
    }
    return this.accountApi;
  }
  protocols() {
    if (!this.registry) {
      this.registry = new Registry(this);
      registerDefaults(this.registry);
    }
    return this.registry;
  }
  setAuthToken(token) {
    this.account().jwtToken = token;
    for (const [, protocol] of this.protocols()) {
      protocol.setAuthToken(token);
    }
  }
}
async function getIsManifest(s5, hash) {
  let type;
  try {
    const abort = new AbortController();
    const resp = s5.downloadData(hash, {
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.loaded >= 10) {
          abort.abort();
        }
      },
      httpConfig: {
        signal: abort.signal
      }
    });
    const data = await resp;
    const unpacker = Unpacker.fromPacked(Buffer.from(data));
    try {
      const magic = unpacker.unpackInt();
      if (magic !== metadataMagicByte) {
        return false;
      }
      type = unpacker.unpackInt();
      if (!type || !Object.values(METADATA_TYPES).includes(type)) {
        return false;
      }
    } catch (e) {
      return false;
    }
  } catch (e) {
    return false;
  }
  switch (type) {
    case METADATA_TYPES.DIRECTORY:
      return CID_TYPES.DIRECTORY;
    case METADATA_TYPES.WEBAPP:
      return CID_TYPES.METADATA_WEBAPP;
    case METADATA_TYPES.MEDIA:
      return CID_TYPES.METADATA_MEDIA;
    case METADATA_TYPES.USER_IDENTITY:
      return CID_TYPES.USER_IDENTITY;
  }
  return 0;
}
const fileProvider = {
  sdk: void 0,
  async getList() {
    var _a;
    const items = [];
    try {
      const s5 = (_a = fileProvider.sdk) == null ? void 0 : _a.protocols().get(PROTOCOL_S5).getSdk();
      const pinList = await s5.accountPins();
      for (const pin of pinList.pins) {
        const manifest = await getIsManifest(s5, pin.hash);
        if (manifest) {
          const mHash = Multihash.fromBase64Url(pin.hash);
          items.push({
            cid: new CID(manifest, mHash, pin.size).toString(),
            type: "manifest",
            mimeType: "application/octet-stream",
            size: pin.size,
            pinned: pin.pinned_at
          });
        } else {
          items.push({
            cid: new CID(
              CID_TYPES.RAW,
              Multihash.fromBase64Url(pin.hash),
              pin.size
            ).toString(),
            type: "raw",
            mimeType: pin.mime_type,
            size: pin.size,
            pinned: pin.pinned_at
          });
        }
      }
    } catch (e) {
      return Promise.reject(e);
    }
    return {
      data: items,
      total: items.length
    };
  },
  getOne() {
    console.log("Not implemented");
    return Promise.resolve({
      data: {
        id: 1
      }
    });
  },
  update() {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  create() {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  deleteOne() {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  getApiUrl() {
    return "";
  }
};
const accountProvider = {
  getList: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: []
    });
  },
  getOne: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  // @ts-ignore
  async update(params) {
    var _a;
    if (params.variables.email && params.variables.password) {
      const ret = await ((_a = accountProvider.sdk) == null ? void 0 : _a.account().updateEmail(params.variables.email, params.variables.password));
      if (ret) {
        if (ret instanceof Error) {
          return Promise.reject(ret);
        }
      } else {
        return Promise.reject();
      }
      return {
        data: {
          email: params.variables.email
        }
      };
    }
    return {
      data: {}
    };
  },
  create: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  deleteOne: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {}
    });
  },
  getApiUrl: () => ""
};
const createPortalAuthProvider = (sdk) => {
  const maybeSetupAuth = () => {
    let jwt = sdk.account().jwtToken;
    if (jwt) {
      sdk.setAuthToken(jwt);
    }
  };
  const handleResponse = (result) => {
    var _a;
    if (result.ret) {
      if (result.ret instanceof AccountError) {
        return {
          success: false,
          error: result.ret,
          redirectTo: result.redirectToError
        };
      }
      (_a = result.successCb) == null ? void 0 : _a.call(result);
      return {
        success: true,
        successNotification: result.successNotification,
        redirectTo: result.redirectToSuccess
      };
    }
    return {
      success: false,
      redirectTo: result.redirectToError
    };
  };
  const handleCheckResponse = (result) => {
    const response = handleResponse(result);
    const success = response.success;
    delete response.success;
    return {
      ...response,
      authenticated: success
    };
  };
  return {
    async login(params) {
      const ret = await sdk.account().login({
        email: params.email,
        password: params.password
      });
      maybeSetupAuth();
      return handleResponse({
        ret,
        redirectToSuccess: "/dashboard",
        redirectToError: "/login",
        successCb: () => {
          sdk.setAuthToken(sdk.account().jwtToken);
        },
        successNotification: {
          message: "Login Successful",
          description: "You have successfully logged in."
        }
      });
    },
    async logout(params) {
      let ret = await sdk.account().logout();
      return handleResponse({ ret, redirectToSuccess: "/login" });
    },
    async check(params) {
      maybeSetupAuth();
      const ret = await sdk.account().ping();
      maybeSetupAuth();
      return handleCheckResponse({ ret, redirectToError: "/login", successCb: maybeSetupAuth });
    },
    async onError(error) {
      return {};
    },
    async register(params) {
      const ret = await sdk.account().register({
        email: params.email,
        password: params.password,
        first_name: params.firstName,
        last_name: params.lastName
      });
      return handleResponse({
        ret,
        redirectToSuccess: "/login",
        successNotification: {
          message: "Registration Successful",
          description: "You have successfully registered. Please check your email to verify your account."
        }
      });
    },
    async forgotPassword(params) {
      return { success: true };
    },
    async updatePassword(params) {
      maybeSetupAuth();
      const ret = await sdk.account().updatePassword(params.currentPassword, params.password);
      return handleResponse({
        ret,
        successNotification: {
          message: "Password Updated",
          description: "Your password has been updated successfully."
        }
      });
    },
    async getPermissions(params) {
      return { success: true };
    },
    async getIdentity(params) {
      maybeSetupAuth();
      const ret = await sdk.account().info();
      if (!ret) {
        return { identity: null };
      }
      const acct = ret;
      return {
        id: acct.id,
        firstName: acct.first_name,
        lastName: acct.last_name,
        email: acct.email,
        verified: acct.verified
      };
    }
  };
};
function getProviders(sdk) {
  accountProvider.sdk = sdk;
  fileProvider.sdk = sdk;
  return {
    default: accountProvider,
    auth: createPortalAuthProvider(sdk),
    files: fileProvider
  };
}
const resources = [
  {
    name: "account",
    meta: {
      dataProviderName: "default"
    }
  },
  {
    name: "file",
    meta: {
      dataProviderName: "files"
    }
  }
];
var define_process_env_default = {};
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
  const client = z.object(_client);
  const server = z.object(_server);
  const shared = z.object(_shared);
  const isServer = opts.isServer ?? typeof window === "undefined";
  const allClient = client.merge(shared);
  const allServer = server.merge(shared).merge(client);
  const parsed = isServer ? allServer.safeParse(runtimeEnv) : allClient.safeParse(runtimeEnv);
  const onValidationError = opts.onValidationError ?? ((error) => {
    console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  });
  const onInvalidAccess = opts.onInvalidAccess ?? ((_variable) => {
    throw new Error("❌ Attempted to access a server-side environment variable on the client");
  });
  if (parsed.success === false) {
    return onValidationError(parsed.error);
  }
  const isServerAccess = (prop) => {
    if (!opts.clientPrefix) return true;
    return !prop.startsWith(opts.clientPrefix) && !(prop in shared.shape);
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
  const fullObj = Object.assign(parsed.data, extendedObj);
  const env2 = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return void 0;
      if (ignoreProp(prop)) return void 0;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    }
  });
  return env2;
}
var define_import_meta_env_default = { VITE_PORTAL_URL: "https://alpha.pinner.xyz", BASE_URL: "/", MODE: "production", DEV: false, PROD: true, SSR: false };
const env = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",
  client: {
    VITE_PORTAL_URL: z.string().url().optional()
  },
  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: define_import_meta_env_default,
  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true
});
const links = () => [{
  rel: "stylesheet",
  href: stylesheet
}];
const queryClient = new QueryClient();
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("head", {
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Links, {})]
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("body", {
      className: "max-h-screen",
      children: [children, /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollRestoration, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})]
    })]
  });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})]
  });
}
function Root() {
  const [portalUrl, setPortalUrl] = reactExports.useState(env.VITE_PORTAL_URL);
  const [sdk, setSdk] = reactExports.useState(portalUrl ? Sdk.create(portalUrl) : void 0);
  reactExports.useEffect(() => {
    if (!portalUrl) {
      fetch("/api/meta").then((response) => response.json()).then((data) => {
        setPortalUrl(`https://${data.domain}`);
      }).catch((error) => {
        console.error("Failed to fetch portal url:", error);
      });
    }
  }, [portalUrl]);
  reactExports.useEffect(() => {
    if (portalUrl) {
      setSdk(Sdk.create(portalUrl));
    }
  }, [portalUrl]);
  if (!portalUrl) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
      children: "Loading..."
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SdkContextProvider, {
    sdk,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SdkWrapper, {})
  });
}
function SdkWrapper() {
  const sdk = useSdk();
  PinningProcess.setupSdk(sdk);
  const providers = reactExports.useMemo(() => getProviders(sdk), [sdk]);
  if (!sdk) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
      children: "Loading..."
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ju, {
      authProvider: providers.auth,
      routerProvider: E,
      notificationProvider,
      dataProvider: {
        default: providers.default,
        files: providers.files
      },
      resources,
      options: {
        disableTelemetry: true
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    })
  });
}
function HydrateFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
    children: "Loading..."
  });
}
export {
  HydrateFallback,
  Layout,
  Root as default,
  links
};
