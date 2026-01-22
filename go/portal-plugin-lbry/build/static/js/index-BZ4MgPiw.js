import { core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__, RefineConfig } from './refineConfig-CJpDC7Fp.js';
import { createLucideIcon, jsxRuntimeExports } from './createLucideIcon-BXTHeo5K.js';

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M12 6v16", key: "nqf5sj" }],
  ["path", { d: "m19 13 2-1a9 9 0 0 1-18 0l2 1", key: "y7qv08" }],
  ["path", { d: "M9 11h6", key: "1fldmi" }],
  ["circle", { cx: "12", cy: "4", r: "2", key: "muu5ef" }]
];
const Anchor = createLucideIcon("anchor", __iconNode$1);

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode);

const LbryIcon = ({ className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      className,
      viewBox: "0 0 320 250",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "white",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M296.05, 85.9l0, 14.1l-138.8, 85.3l-104.6, -51.3l0.2, -7.9l104, 51.2l132.2, -81.2l0, -5.8l-124.8, -60.2l-139.2, 86.1l0, 38.5l131.8, 65.2l137.6, -84.4l3.9, 6l-141.1, 86.4l-139.2, -68.8l0, -46.8l145.8, -90.2l132.2, 63.8Z" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M294.25, 150.9l2, -12.6l-12.2, -2.1l0.8, -4.9l17.1, 2.9l-2.8, 17.5l-4.9, -0.8Z" })
      ]
    }
  );
};

class LbryProtocol {
  id = "lbry:protocol";
  type = "core:protocol";
  status;
  async destroy() {
  }
  getDescription() {
    return "Decentralized content storage platform";
  }
  getIcon() {
    return LbryIcon;
  }
  getName() {
    return "LBRY";
  }
  async initialize() {
  }
}

class LbryUpload {
  id = "lbry:upload";
  type = "core:upload";
  status;
  #tusEndpoint;
  #xhrEndpoint;
  async destroy() {
  }
  getAdditionalPlugins() {
    return [];
  }
  getLargeFileUploadConfig() {
    return {
      endpoint: this.#tusEndpoint
    };
  }
  getSmallFileUploadConfig() {
    return {
      endpoint: this.#xhrEndpoint
    };
  }
  async initialize(framework) {
    const apiUrl = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.getApiBaseUrl({
      currentUrl: framework.portalUrl
    });
    if (apiUrl === false) {
      throw new Error("Invalid API URL configuration");
    }
    const parsed = new URL(apiUrl);
    parsed.hostname = `lbry.${parsed.hostname}`;
    const subdomain = core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.cleanTrailingSlashes(parsed.toString());
    this.#xhrEndpoint = `${subdomain}/api/streams/upload`;
    this.#tusEndpoint = `${subdomain}/api/streams/upload/tus`;
  }
}

const routes = [
  {
    path: "/lbry/devices",
    component: "devices",
    id: "lbry_devices",
    navigation: {
      label: "Devices",
      icon: Monitor,
      order: 3
    }
  },
  {
    path: "/lbry/streams",
    component: "streams",
    id: "lbry_streams",
    navigation: {
      label: "Streams",
      icon: Anchor,
      order: 4
    }
  }
];

const getGetApiDevicesUrl = () => {
  return `/api/api/devices`;
};
const getApiDevices = async (options) => {
  const res = await fetch(getGetApiDevicesUrl(), {
    ...options,
    method: "GET"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getPostApiDevicesUrl = () => {
  return `/api/api/devices`;
};
const postApiDevices = async (createDeviceRequest, options) => {
  const res = await fetch(getPostApiDevicesUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createDeviceRequest)
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getDeleteApiDevicesIdUrl = (id) => {
  return `/api/api/devices/${id}`;
};
const deleteApiDevicesId = async (id, options) => {
  const res = await fetch(getDeleteApiDevicesIdUrl(id), {
    ...options,
    method: "DELETE"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getGetApiDevicesIdUrl = (id) => {
  return `/api/api/devices/${id}`;
};
const getApiDevicesId = async (id, options) => {
  const res = await fetch(getGetApiDevicesIdUrl(id), {
    ...options,
    method: "GET"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getPutApiDevicesIdUrl = (id) => {
  return `/api/api/devices/${id}`;
};
const putApiDevicesId = async (id, updateDeviceRequest, options) => {
  const res = await fetch(getPutApiDevicesIdUrl(id), {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateDeviceRequest)
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getGetApiStreamsUrl = () => {
  return `/api/api/streams`;
};
const getApiStreams = async (options) => {
  const res = await fetch(getGetApiStreamsUrl(), {
    ...options,
    method: "GET"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getDeleteApiStreamsSdHashUrl = (sdHash) => {
  return `/api/api/streams/${sdHash}`;
};
const deleteApiStreamsSdHash = async (sdHash, options) => {
  const res = await fetch(getDeleteApiStreamsSdHashUrl(sdHash), {
    ...options,
    method: "DELETE"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getPostApiStreamsPinUrl = () => {
  return `/api/api/streams/pin`;
};
const postApiStreamsPin = async (streamPinRequest, options) => {
  const res = await fetch(getPostApiStreamsPinUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(streamPinRequest)
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getPostApiStreamsUploadUrl = () => {
  return `/api/api/streams/upload`;
};
const postApiStreamsUpload = async (postApiStreamsUploadBody, options) => {
  const formData = new FormData();
  formData.append(`file`, postApiStreamsUploadBody.file);
  const res = await fetch(getPostApiStreamsUploadUrl(), {
    ...options,
    method: "POST",
    body: formData
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};

const getPostApiStreamsUploadTusUrl = () => {
  return `/api/api/streams/upload/tus`;
};
const postApiStreamsUploadTus = async (postApiStreamsUploadTusBody, options) => {
  const res = await fetch(getPostApiStreamsUploadTusUrl(), {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/offset+octet-stream",
      ...options?.headers
    },
    body: JSON.stringify(postApiStreamsUploadTusBody)
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getDeleteApiStreamsUploadTusIdUrl = (id) => {
  return `/api/api/streams/upload/tus/${id}`;
};
const deleteApiStreamsUploadTusId = async (id, options) => {
  const res = await fetch(getDeleteApiStreamsUploadTusIdUrl(id), {
    ...options,
    method: "DELETE"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getHeadApiStreamsUploadTusIdUrl = (id) => {
  return `/api/api/streams/upload/tus/${id}`;
};
const headApiStreamsUploadTusId = async (id, options) => {
  const res = await fetch(getHeadApiStreamsUploadTusIdUrl(id), {
    ...options,
    method: "HEAD"
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};
const getPatchApiStreamsUploadTusIdUrl = (id) => {
  return `/api/api/streams/upload/tus/${id}`;
};
const patchApiStreamsUploadTusId = async (id, patchApiStreamsUploadTusIdBody, options) => {
  const res = await fetch(getPatchApiStreamsUploadTusIdUrl(id), {
    ...options,
    method: "PATCH",
    headers: {
      "Content-Type": "application/offset+octet-stream",
      ...options?.headers
    },
    body: JSON.stringify(patchApiStreamsUploadTusIdBody)
  });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return {
    data,
    status: res.status,
    headers: res.headers
  };
};

function index() {
  return {
    capabilities: [
      new LbryProtocol(),
      new LbryUpload(),
      new RefineConfig()
    ],
    capabilityAssociations: [
      {
        associated: ["lbry:upload"],
        primary: "lbry:protocol"
      }
    ],
    async destroy(_framework) {
      console.log("Plugin LBRY destroyed");
    },
    id: core_lbry__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "lbry"),
    async initialize(_framework) {
      console.log("Plugin LBRY initialized");
    },
    routes
  };
}

export { index as default, deleteApiDevicesId, deleteApiStreamsSdHash, deleteApiStreamsUploadTusId, getApiDevices, getApiDevicesId, getApiStreams, getDeleteApiDevicesIdUrl, getDeleteApiStreamsSdHashUrl, getDeleteApiStreamsUploadTusIdUrl, getGetApiDevicesIdUrl, getGetApiDevicesUrl, getGetApiStreamsUrl, getHeadApiStreamsUploadTusIdUrl, getPatchApiStreamsUploadTusIdUrl, getPostApiDevicesUrl, getPostApiStreamsPinUrl, getPostApiStreamsUploadTusUrl, getPostApiStreamsUploadUrl, getPutApiDevicesIdUrl, headApiStreamsUploadTusId, patchApiStreamsUploadTusId, postApiDevices, postApiStreamsPin, postApiStreamsUpload, postApiStreamsUploadTus, putApiDevicesId };
