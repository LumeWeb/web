// MSW handlers for Websites and IPNS API endpoints
// These handlers mock the Lume Pinner Websites & IPNS API

import { http, HttpResponse } from "msw";
import { testConfig } from "./setup";
import { SSLStatus, SSLStatusValue } from "@/api/websites";

// ============================================================================
// TYPES
// ============================================================================

interface IPNSKey {
  id: number;
  name: string;
  ipns_name: string;
  peer_id: string;
  created: Date;
}

interface Website {
  id: number;
  domain: string;
  target_type: string;
  target_hash: string;
  status: string;
  validation_token: string;
  created: Date;
  updated: Date;
  expired: boolean;
  last_checked_at: Date;
  validation_expires_at: Date;
}

// ============================================================================
// STATE
// ============================================================================

const initialIPNSKeys: IPNSKey[] = [
  {
    id: 1,
    name: "test-key-1",
    ipns_name: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
    peer_id: "12D3KooWJjPjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
    created: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: 2,
    name: "test-key-2",
    ipns_name: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
    peer_id: "12D3KooWKjPjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
    created: new Date("2024-01-02T00:00:00Z"),
  },
];

let ipnsKeys: IPNSKey[] = [...initialIPNSKeys];

let websites: Website[] = [
  {
    id: 1,
    domain: "example.com",
    target_type: "ipfs",
    target_hash: "QmTest1",
    status: "active",
    validation_token: "valid-token-123",
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-01T00:00:00Z"),
    expired: false,
    last_checked_at: new Date("2024-01-01T00:00:00Z"),
    validation_expires_at: new Date("2024-01-08T00:00:00Z"),
  },
  {
    id: 2,
    domain: "test.org",
    target_type: "ipns",
    target_hash: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
    status: "pending",
    validation_token: "valid-token-456",
    created: new Date("2024-01-02T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
    expired: false,
    last_checked_at: new Date("2024-01-02T00:00:00Z"),
    validation_expires_at: new Date("2024-01-09T00:00:00Z"),
  },
];

let nextKeyId = 3;
let nextWebsiteId = 3;

// Export state reset function for tests
export function resetWebsitesIPNSState() {
  ipnsKeys = [
    {
      id: 1,
      name: "test-key-1",
      ipns_name: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
      peer_id: "12D3KooWJjPjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
      created: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: 2,
      name: "test-key-2",
      ipns_name: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
      peer_id: "12D3KooWKjPjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ",
      created: new Date("2024-01-02T00:00:00Z"),
    },
  ];
  websites = [
    {
      id: 1,
      domain: "example.com",
      target_type: "ipfs",
      target_hash: "QmTest1",
      status: "active",
      validation_token: "valid-token-123",
      created: new Date("2024-01-01T00:00:00Z"),
      updated: new Date("2024-01-01T00:00:00Z"),
      expired: false,
      last_checked_at: new Date("2024-01-01T00:00:00Z"),
      validation_expires_at: new Date("2024-01-08T00:00:00Z"),
    },
    {
      id: 2,
      domain: "test.org",
      target_type: "ipns",
      target_hash: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
      status: SSLStatus.PENDING,
      validation_token: "valid-token-456",
      created: new Date("2024-01-02T00:00:00Z"),
      updated: new Date("2024-01-02T00:00:00Z"),
      expired: false,
      last_checked_at: new Date("2024-01-02T00:00:00Z"),
      validation_expires_at: new Date("2024-01-09T00:00:00Z"),
    },
  ];
  nextKeyId = 3;
  nextWebsiteId = 3;
  resetSSLStatuses();
}

// ============================================================================
// IPNS HANDLERS
// ============================================================================

export const listIPNSKeysHandler = http.get(
  `${testConfig.apiUrl}/ipns/keys`,
  async () => {
    return HttpResponse.json(ipnsKeys, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const listIPNSKeysUnauthorizedHandler = http.get(
  `${testConfig.apiUrl}/ipns/keys`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

export const createIPNSKeyHandler = http.post(
  `${testConfig.apiUrl}/ipns/keys`,
  async ({ request }) => {
    const body = (await request.json()) as { name: string; key?: string };

    const newKey: IPNSKey = {
      id: nextKeyId++,
      name: body.name,
      ipns_name: `k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e-${nextKeyId}`,
      peer_id: `12D3KooW${"J".repeat(44)}`,
      created: new Date(),
    };

    ipnsKeys.push(newKey);

    return HttpResponse.json(newKey, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const getIPNSKeyHandler = http.get(
  `${testConfig.apiUrl}/ipns/keys/:id`,
  async ({ params }) => {
    const id = parseInt(params.id as string);
    const key = ipnsKeys.find((k) => k.id === id);

    if (!key) {
      return HttpResponse.json(
        { error: "IPNS key not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(key, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const deleteIPNSKeyHandler = http.delete(
  `${testConfig.apiUrl}/ipns/keys/:id`,
  async ({ params }) => {
    const id = parseInt(params.id as string);
    const index = ipnsKeys.findIndex((k) => k.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: "IPNS key not found" },
        { status: 404 },
      );
    }

    ipnsKeys.splice(index, 1);

    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const publishIPNSHandler = http.post(
  `${testConfig.apiUrl}/ipns/publish`,
  async ({ request }) => {
    const body = (await request.json()) as { key_id: number; cid: string; ttl?: string };

    const key = ipnsKeys.find((k) => k.id === body.key_id);
    if (!key) {
      return HttpResponse.json(
        { error: "IPNS key not found" },
        { status: 404 },
      );
    }

    const publishResult = {
      name: key.ipns_name,
      value: body.cid,
      sequence: 1,
      validity: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      published: new Date().toISOString(),
    };

    return HttpResponse.json(publishResult, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const republishIPNSHandler = http.post(
  `${testConfig.apiUrl}/ipns/republish`,
  async () => {
    return new HttpResponse(null, {
      status: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const resolveIPNSHandler = http.get(
  `${testConfig.apiUrl}/ipns/resolve/:name`,
  async ({ params }) => {
    const name = params.name as string;

    const resolveResult = {
      name,
      value: "QmResolvedCID",
      sequence: 1,
      path: `/ipfs/QmResolvedCID`,
      expired: false,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    return HttpResponse.json(resolveResult, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// Combine all IPNS handlers
export const ipnsHandlers = [
  listIPNSKeysHandler,
  createIPNSKeyHandler,
  getIPNSKeyHandler,
  deleteIPNSKeyHandler,
  publishIPNSHandler,
  republishIPNSHandler,
  resolveIPNSHandler,
];

// ============================================================================
// WEBSITES HANDLERS
// ============================================================================

export const listWebsitesHandler = http.get(
  `${testConfig.apiUrl}/websites`,
  async () => {
    return HttpResponse.json(
      {
        data: websites,
        total: websites.length,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

export const createWebsiteHandler = http.post(
  `${testConfig.apiUrl}/websites`,
  async ({ request }) => {
    const body = (await request.json()) as {
      domain: string;
      target_type: string;
      target_hash: string;
    };

    const newWebsite: Website = {
      id: nextWebsiteId++,
      domain: body.domain,
      target_type: body.target_type,
      target_hash: body.target_hash,
      status: SSLStatus.PENDING,
      validation_token: `valid-token-${nextWebsiteId}`,
      created: new Date(),
      updated: new Date(),
      expired: false,
      last_checked_at: new Date(),
      validation_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    websites.push(newWebsite);

    return HttpResponse.json(newWebsite, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const getWebsiteHandler = http.get(
  `${testConfig.apiUrl}/websites/:id`,
  async ({ params }) => {
    const id = parseInt(params.id as string);
    const website = websites.find((w) => w.id === id);

    if (!website) {
      return HttpResponse.json(
        { error: "Website not found" },
        { status: 404 },
      );
    }

    return HttpResponse.json(website, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const updateWebsiteHandler = http.put(
  `${testConfig.apiUrl}/websites/:id`,
  async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const body = (await request.json()) as {
      domain: string;
      target_type: string;
      target_hash: string;
    };

    const website = websites.find((w) => w.id === id);
    if (!website) {
      return HttpResponse.json(
        { error: "Website not found" },
        { status: 404 },
      );
    }

    website.domain = body.domain;
    website.target_type = body.target_type;
    website.target_hash = body.target_hash;
    website.updated = new Date();
    website.status = "pending";

    return HttpResponse.json(website, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const deleteWebsiteHandler = http.delete(
  `${testConfig.apiUrl}/websites/:id`,
  async ({ params }) => {
    const id = parseInt(params.id as string);
    const index = websites.findIndex((w) => w.id === id);

    if (index === -1) {
      return HttpResponse.json(
        { error: "Website not found" },
        { status: 404 },
      );
    }

    websites.splice(index, 1);

    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

export const validateWebsiteHandler = http.post(
  `${testConfig.apiUrl}/websites/:id/validate`,
  async ({ params }) => {
    const id = parseInt(params.id as string);
    const website = websites.find((w) => w.id === id);

    if (!website) {
      return HttpResponse.json(
        { error: "Website not found" },
        { status: 404 },
      );
    }

    const validationResult = {
      id: website.id,
      domain: website.domain,
      valid: true,
      message: "DNS validation successful",
    };

    return HttpResponse.json(validationResult, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// ============================================================================
// SSL STATUS HANDLERS
// ============================================================================

// Track SSL status for domains
let sslStatuses: Record<string, {
  status: string;
  error?: string;
  issued_at?: string;
  last_updated_at?: string;
}> = {};

// Note: This handler intentionally persists state for unknown domains to ensure
// consistent responses across requests (important for polling scenarios). Tests must
// call resetSSLStatuses() in beforeEach to maintain test isolation. The stateful
// behavior is necessary because:
// 1. Polling tests need consistent timestamps across requests
// 2. Tests should be able to verify state persistence behavior
// 3. resetSSLStatuses() is called in beforeEach to prevent cross-test contamination
export const getSSLStatusHandler = http.get(
  `${testConfig.apiUrl}/websites/:domain/ssl-status`,
  async ({ params }) => {
    const domain = params.domain as string;

    if (!sslStatuses[domain]) {
      sslStatuses[domain] = {
        status: SSLStatus.PENDING,
        last_updated_at: new Date().toISOString(),
      };
    }

    return HttpResponse.json(sslStatuses[domain], {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// Helper function to set SSL status for testing
export function setSSLStatus(
  domain: string,
  status: string | SSLStatusValue,
  error?: string,
): void {
  sslStatuses[domain] = {
    status,
    error,
    last_updated_at: new Date().toISOString(),
  };
}

// Reset SSL statuses
export function resetSSLStatuses(): void {
  sslStatuses = {};
}

// Combine all Websites handlers
export const websitesHandlers = [
  listWebsitesHandler,
  createWebsiteHandler,
  getWebsiteHandler,
  updateWebsiteHandler,
  deleteWebsiteHandler,
  validateWebsiteHandler,
  getSSLStatusHandler,
];

// ============================================================================
// ERROR HANDLERS
// ============================================================================

export const ipnsNotFoundHandler = http.get(
  `${testConfig.apiUrl}/ipns/keys/:id`,
  async ({ params }) => {
    return HttpResponse.json(
      { error: "IPNS key not found" },
      { status: 404 },
    );
  },
);

export const ipnsUnauthorizedHandler = http.get(
  `${testConfig.apiUrl}/ipns/keys`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add POST handler for unauthorized create
export const ipnsUnauthorizedPostHandler = http.post(
  `${testConfig.apiUrl}/ipns/keys`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add DELETE handler for unauthorized delete
export const ipnsUnauthorizedDeleteHandler = http.delete(
  `${testConfig.apiUrl}/ipns/keys/:id`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add POST handler for unauthorized publish
export const ipnsUnauthorizedPublishHandler = http.post(
  `${testConfig.apiUrl}/ipns/publish`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add POST handler for unauthorized republish
export const ipnsUnauthorizedRepublishHandler = http.post(
  `${testConfig.apiUrl}/ipns/republish`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add GET handler for unauthorized resolve
export const ipnsUnauthorizedResolveHandler = http.get(
  `${testConfig.apiUrl}/ipns/resolve/:name`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

export const websiteNotFoundHandler = http.get(
  `${testConfig.apiUrl}/websites/:id`,
  async ({ params }) => {
    return HttpResponse.json(
      { error: "Website not found" },
      { status: 404 },
    );
  },
);

export const websiteUnauthorizedHandler = http.get(
  `${testConfig.apiUrl}/websites`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add GET handler for unauthorized single website
export const websiteUnauthorizedGetHandler = http.get(
  `${testConfig.apiUrl}/websites/:id`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add POST handler for unauthorized create
export const websiteUnauthorizedPostHandler = http.post(
  `${testConfig.apiUrl}/websites`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add DELETE handler for unauthorized delete
export const websiteUnauthorizedDeleteHandler = http.delete(
  `${testConfig.apiUrl}/websites/:id`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add POST handler for unauthorized validate
export const websiteUnauthorizedValidateHandler = http.post(
  `${testConfig.apiUrl}/websites/:id/validate`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// Add PUT handler for unauthorized update
export const websiteUnauthorizedPutHandler = http.put(
  `${testConfig.apiUrl}/websites/:id`,
  async () => {
    return HttpResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  },
);

// ============================================================================
// COMBINED HANDLERS
// ============================================================================

export const websitesIPNSHandlers = [...ipnsHandlers, ...websitesHandlers];
