// MSW adapter for mock-ipfs-pinning-service
// Adapts the business logic from mock-ipfs-pinning-service/service/pins.js
// to work with MSW handlers in the browser environment
//
// Source: https://github.com/ipfs-shipyard/js-mock-ipfs-pinning-service/
// License: (Apache-2.0 AND MIT)

import { http, HttpResponse } from "msw";
import type { Pin, PinStatus } from "@ipfs-shipyard/pinning-service-client";
import { Status } from "@ipfs-shipyard/pinning-service-client";
import { createMockCID, testConfig } from "@/__tests__/setup";

// ============================================================================
// TYPES (adapted from mock-ipfs-pinning-service/protocol.ts)
// ============================================================================

type MockState = {
  accessToken: string | null;
  delegates: string[];
  requestid: number;
  pins: Map<string, PinStatus>;
};

// ============================================================================
// STATE
// ============================================================================

let globalState: MockState = {
  accessToken: null,
  delegates: [
    "/ip4/203.0.113.42/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    "/ip6/2001:db8::42/tcp/8080/p2p/QmYVEDcquBLjoMEz6qxTSm5AfQ3uUcvHdxC8VUJs6sB1oh",
    "/dns4/node0.example.net/tcp/443/wss/p2p/QmZMxuNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
    "/dnsaddr/node1.example.org/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  ],
  requestid: 0,
  pins: new Map(),
};

// Initialize state with some default pins for testing
function initializeDefaultPins() {
  const defaultPins: Pin[] = [
    {
      cid: "QmTest1",
      name: "pinned-test-pin",
      meta: {},
      origins: [],
    },
    {
      cid: "QmTest2",
      name: "pinned-test-pin-2",
      meta: {},
      origins: [],
    },
    {
      cid: "QmTest3",
      name: "pinned-test-pin-3",
      meta: {},
      origins: [],
    },
  ];

  for (const pin of defaultPins) {
    const requestid = globalState.requestid + 1;
    const pinStatus: PinStatus = {
      requestid: `req-${requestid}`,
      status: deriveStatus(pin),
      created: new Date(),
      pin,
      delegates: globalState.delegates,
      info: {},
    };
    globalState.requestid = requestid;
    globalState.pins.set(pin.cid, pinStatus);
  }
}

// Initialize on module load
// Note: We use an async initialization pattern since createMockCID is async
let initializationPromise: Promise<void> | null = null;

async function asyncInitializeDefaultPins() {
  const defaultPins: Pin[] = [
    {
      cid: await createMockCID(1),
      name: "pinned-test-pin",
      meta: {},
      origins: [],
    },
    {
      cid: await createMockCID(2),
      name: "pinned-test-pin-2",
      meta: {},
      origins: [],
    },
    {
      cid: await createMockCID(3),
      name: "pinned-test-pin-3",
      meta: {},
      origins: [],
    },
  ];

  for (const pin of defaultPins) {
    const requestid = globalState.requestid + 1;
    const pinStatus: PinStatus = {
      requestid: `req-${requestid}`,
      status: deriveStatus(pin),
      created: new Date(),
      pin,
      delegates: globalState.delegates,
      info: {},
    };
    globalState.requestid = requestid;
    globalState.pins.set(pin.cid, pinStatus);
  }
}

// Initialize on module load (will wait for async initialization)
if (!initializationPromise) {
  initializationPromise = asyncInitializeDefaultPins();
}

// Export state reset function for tests
export async function resetPinServiceState() {
  globalState = {
    accessToken: null,
    delegates: [
      "/ip4/203.0.113.42/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
      "/ip6/2001:db8::42/tcp/8080/p2p/QmYVEDcquBLjoMEz6qxTSm5AfQ3uUcvHdxC8VUJs6sB1oh",
      "/dns4/node0.example.net/tcp/443/wss/p2p/QmZMxuNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
      "/dnsaddr/node1.example.org/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    ],
    requestid: 0,
    pins: new Map(),
  };
  await asyncInitializeDefaultPins();
}

// Ensure initialization is complete before any handler is used
async function ensureInitialized(): Promise<void> {
  if (initializationPromise) {
    await initializationPromise;
  }
}

// ============================================================================
// BUSINESS LOGIC (adapted from mock-ipfs-pinning-service/service/pins.js)
// ============================================================================

function deriveStatus(pin: Pin): Status {
  const name = pin.name || "";
  for (const status of Object.values(Status)) {
    if (name.startsWith(`${status}-`)) {
      return status;
    }
  }
  return Status.Queued;
}

function parseDate(d: string | Date): number | Date {
  if (d instanceof Date) {
    return d;
  }
  return Date.parse(d);
}

function parseStringArr(s: string | string[] | undefined): string[] {
  if (s == null) {
    return [];
  }
  if (typeof s === "string") {
    return s.split(",");
  }
  return s;
}

function matchMetadata(
  query: Record<string, any>,
  meta: Record<string, any>,
): boolean {
  for (const [key, value] of Object.entries(query)) {
    if (meta[key] != value) {
      return false;
    }
  }
  return true;
}

function match(query: ListPinsQuery, entry: PinStatus): boolean {
  const statuses = parseStringArr(query.status);
  const cids = parseStringArr(query.cid);

  const matched =
    (query.cid == null || cids.includes(entry.pin.cid)) &&
    (query.name == null || query.name == entry.pin.name) &&
    (query.status == null || statuses.includes(entry.status)) &&
    (query.before == null ||
      parseDate(entry.created) < parseDate(query.before)) &&
    (query.after == null ||
      parseDate(entry.created) > parseDate(query.after)) &&
    (query.meta == null || matchMetadata(query.meta, entry.pin.meta || {}));

  return matched;
}

// ============================================================================
// HANDLERS
// ============================================================================

interface ListPinsQuery {
  cid?: string | string[];
  name?: string;
  status?: string | string[];
  before?: string | Date;
  after?: string | Date;
  limit?: number;
  meta?: Record<string, any>;
}

export const listPinsHandler = http.get(
  `${testConfig.apiUrl}/pins`,
  async ({ request }) => {
    try {
      // Ensure initialization is complete
      await ensureInitialized();

      const url = new URL(request.url);
      const query: ListPinsQuery = {
        cid: url.searchParams.get("cid") || undefined,
        name: url.searchParams.get("name") || undefined,
        status: url.searchParams.get("status") || undefined,
        limit: url.searchParams.get("limit")
          ? parseInt(url.searchParams.get("limit")!, 10)
          : undefined,
        after: url.searchParams.get("after") || undefined,
        before: url.searchParams.get("before") || undefined,
      };

      const limit = query.limit ?? Infinity;
      const results: PinStatus[] = [];

      for (const entry of globalState.pins.values()) {
        if (match(query, entry)) {
          results.push(entry);
          if (results.length === limit) {
            break;
          }
        }
      }

      return HttpResponse.json(
        {
          count: results.length,
          results,
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } catch (error) {
      console.error("[MSW Handler] Error in GET /pins:", error);
      throw error;
    }
  },
);

export const createPinHandler = http.post(
  `${testConfig.apiUrl}/pins`,
  async ({ request }) => {
    try {
      const pin = (await request.json()) as Pin;

      const existingPin = globalState.pins.get(pin.cid);
      let pinStatus: PinStatus;

      if (existingPin) {
        // Update existing pin
        const newStatus = deriveStatus(pin);
        pinStatus = {
          ...existingPin,
          status: newStatus,
          pin: { ...existingPin.pin, ...pin },
        };
        globalState.pins.set(pin.cid, pinStatus);
      } else {
        // Create new pin
        const requestid = globalState.requestid + 1;
        pinStatus = {
          requestid: `req-${requestid}`,
          status: deriveStatus(pin),
          created: new Date(),
          pin,
          delegates: globalState.delegates,
          info: {},
        };
        globalState.requestid = requestid;
        globalState.pins.set(pin.cid, pinStatus);
      }

      return HttpResponse.json(pinStatus, {
        status: 202,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("[MSW Handler] Error in POST /pins:", error);
      throw error;
    }
  },
);

export const updatePinHandler = http.post(
  `${testConfig.apiUrl}/pins/:requestid`,
  async ({ params, request }) => {
    try {
      const pin = (await request.json()) as Pin;
      const requestid = params.requestid as string;

      // Find existing pin by requestid
      let existingCid: string | undefined;
      for (const [cid, pinStatus] of globalState.pins.entries()) {
        if (pinStatus.requestid === requestid) {
          existingCid = cid;
          break;
        }
      }

      if (!existingCid) {
        return HttpResponse.json(
          {
            error: {
              reason: "NotFound",
              details: `Pin with requestid ${requestid} not found`,
            },
          },
          { status: 404 },
        );
      }

      // Remove old pin and add new one
      globalState.pins.delete(existingCid);
      const newRequestid = globalState.requestid + 1;
      const pinStatus: PinStatus = {
        requestid: `req-${newRequestid}`,
        status: deriveStatus(pin),
        created: new Date(),
        pin,
        delegates: globalState.delegates,
        info: {},
      };
      globalState.requestid = newRequestid;
      globalState.pins.set(pin.cid, pinStatus);

      return HttpResponse.json(pinStatus, {
        status: 202,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("[MSW Handler] Error in POST /pins/:requestid:", error);
      throw error;
    }
  },
);

export const getPinHandler = http.get(
  `${testConfig.apiUrl}/pins/:requestid`,
  async ({ params }) => {
    try {
      const requestid = params.requestid as string;

      // Find pin by requestid
      for (const pinStatus of globalState.pins.values()) {
        if (pinStatus.requestid === requestid) {
          return HttpResponse.json(pinStatus, {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      return HttpResponse.json(
        {
          error: {
            reason: "NotFound",
            details: `Pin with requestid ${requestid} not found`,
          },
        },
        { status: 404 },
      );
    } catch (error) {
      console.error("[MSW Handler] Error in GET /pins/:requestid:", error);
      throw error;
    }
  },
);

export const deletePinHandler = http.delete(
  `${testConfig.apiUrl}/pins/:requestid`,
  async ({ params }) => {
    try {
      const requestid = params.requestid as string;

      // Find and delete pin by requestid
      let found = false;
      for (const [cid, pinStatus] of globalState.pins.entries()) {
        if (pinStatus.requestid === requestid) {
          globalState.pins.delete(cid);
          found = true;
          break;
        }
      }

      if (!found) {
        return HttpResponse.json(
          {
            error: {
              reason: "NotFound",
              details: `Pin with requestid ${requestid} not found`,
            },
          },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        { status: "deleted" },
        {
          status: 202,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } catch (error) {
      console.error("[MSW Handler] Error in DELETE /pins/:requestid:", error);
      throw error;
    }
  },
);

// Combined handlers
export const pinHandlers = [
  createPinHandler,
  listPinsHandler,
  getPinHandler,
  updatePinHandler,
  deletePinHandler,
];
