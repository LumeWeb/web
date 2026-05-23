import { http, HttpResponse } from "msw";
import type { Pin, PinStatus } from "@ipfs-shipyard/pinning-service-client";
import { testConfig } from "../setup";
import { PinStore, deriveStatus } from "./pin-store";

// Pin handlers use the base domain (without /api) because the
// pinning-service-client uses endpointUrl as basePath and appends /pins itself.
// testConfig.apiUrl = "https://test.pinner.xyz/api" → pinBaseUrl = "https://test.pinner.xyz"
const pinBaseUrl = testConfig.apiUrl.replace(/\/api$/, "");

interface ListPinsQuery {
  cid?: string | string[];
  name?: string;
  status?: string | string[];
  before?: string | Date;
  after?: string | Date;
  limit?: number;
  meta?: Record<string, any>;
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

  return (
    (query.cid == null || cids.includes(entry.pin.cid)) &&
    (query.name == null || query.name == entry.pin.name) &&
    (query.status == null || statuses.includes(entry.status)) &&
    (query.before == null ||
      parseDate(entry.created) < parseDate(query.before)) &&
    (query.after == null ||
      parseDate(entry.created) > parseDate(query.after)) &&
    (query.meta == null || matchMetadata(query.meta, entry.pin.meta || {}))
  );
}

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export function createPinHandlers(store: PinStore) {
  const listPinsHandler = http.get(
    `${pinBaseUrl}/pins`,
    async ({ request }) => {
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

      for (const entry of store.list()) {
        if (match(query, entry)) {
          results.push(entry);
          if (results.length === limit) {
            break;
          }
        }
      }

      return HttpResponse.json(
        { count: results.length, results },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const createPinHandler = http.post(
    `${pinBaseUrl}/pins`,
    async ({ request }) => {
      const pin = (await request.json()) as Pin;
      const existingPin = store.get(pin.cid);
      let pinStatus: PinStatus;

      if (existingPin) {
        pinStatus = {
          ...existingPin,
          status: deriveStatus(pin),
          pin: { ...existingPin.pin, ...pin },
        };
        store.set(pin.cid, pinStatus);
      } else {
        const requestid = store.getNextRequestId();
        pinStatus = {
          requestid,
          status: deriveStatus(pin),
          created: new Date(),
          pin,
          delegates: store.getDelegates(),
          info: {},
        };
        store.set(pin.cid, pinStatus);
      }

      return HttpResponse.json(pinStatus, {
        status: 202,
        headers: CORS_HEADERS,
      });
    },
  );

  const updatePinHandler = http.post(
    `${pinBaseUrl}/pins/:requestid`,
    async ({ params, request }) => {
      const pin = (await request.json()) as Pin;
      const requestid = params.requestid as string;

      const existingCid = store.findCidByRequestId(requestid);

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

      store.delete(existingCid);
      const newRequestid = store.getNextRequestId();
      const pinStatus: PinStatus = {
        requestid: newRequestid,
        status: deriveStatus(pin),
        created: new Date(),
        pin,
        delegates: store.getDelegates(),
        info: {},
      };
      store.set(pin.cid, pinStatus);

      return HttpResponse.json(pinStatus, {
        status: 202,
        headers: CORS_HEADERS,
      });
    },
  );

  const getPinHandler = http.get(
    `${pinBaseUrl}/pins/:requestid`,
    async ({ params }) => {
      const requestid = params.requestid as string;
      const pinStatus = store.findByRequestId(requestid);

      if (pinStatus) {
        return HttpResponse.json(pinStatus, {
          status: 200,
          headers: CORS_HEADERS,
        });
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
    },
  );

  const deletePinHandler = http.delete(
    `${pinBaseUrl}/pins/:requestid`,
    async ({ params }) => {
      const requestid = params.requestid as string;
      const found = store.deleteByRequestId(requestid);

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
        { status: 202, headers: CORS_HEADERS },
      );
    },
  );

  return [createPinHandler, listPinsHandler, getPinHandler, updatePinHandler, deletePinHandler];
}

export async function resetPinServiceState(store: PinStore): Promise<void> {
  store.reset();
  await store.initializeDefaults();
}
