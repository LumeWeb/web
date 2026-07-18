import { http, HttpResponse } from "msw";
import { testConfig } from "../setup";
import { SSLStatus } from "@/api/websites";
import { WebsiteStore, IPNSStore } from "./website-store";
import type { IPNSKey, Website } from "./website-store";

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export function createWebsiteHandlers(websiteStore: WebsiteStore, ipnsStore: IPNSStore) {
  // ============================================================================
  // IPNS HANDLERS
  // ============================================================================

  const listIPNSKeysHandler = http.get(
    `${testConfig.apiUrl}/ipns/keys`,
    async () => {
      const keys = ipnsStore.list();
      return HttpResponse.json(
        { data: keys, total: keys.length },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const createIPNSKeyHandler = http.post(
    `${testConfig.apiUrl}/ipns/keys`,
    async ({ request }) => {
      const body = (await request.json()) as { name: string; key?: string };
      const id = ipnsStore.getNextKeyId();

      const newKey: IPNSKey = {
        id,
        name: body.name,
        ipns_name: `k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e-${id + 1}`,
        peer_id: `12D3KooW${"J".repeat(44)}`,
        created: new Date(),
      };

      ipnsStore.set(id, newKey);

      return HttpResponse.json(newKey, {
        status: 201,
        headers: CORS_HEADERS,
      });
    },
  );

  const getIPNSKeyHandler = http.get(
    `${testConfig.apiUrl}/ipns/keys/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const key = ipnsStore.findById(id);

      if (!key) {
        return HttpResponse.json(
          { error: { reason: "IPNS key not found" } },
          { status: 404 },
        );
      }

      return HttpResponse.json(key, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const deleteIPNSKeyHandler = http.delete(
    `${testConfig.apiUrl}/ipns/keys/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const key = ipnsStore.findById(id);

      if (!key) {
        return HttpResponse.json(
          { error: { reason: "IPNS key not found" } },
          { status: 404 },
        );
      }

      ipnsStore.deleteById(id);

      return new HttpResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    },
  );

  const publishIPNSHandler = http.post(
    `${testConfig.apiUrl}/ipns/publish`,
    async ({ request }) => {
      const body = (await request.json()) as { key_id: number; cid: string; ttl?: string };

      const key = ipnsStore.findById(body.key_id);
      if (!key) {
        return HttpResponse.json(
          { error: { reason: "IPNS key not found" } },
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
        headers: CORS_HEADERS,
      });
    },
  );

  const republishIPNSHandler = http.post(
    `${testConfig.apiUrl}/ipns/keys/:id/republish`,
    async () => {
      return HttpResponse.json(
        { count: 1, message: "Republish triggered" },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const resolveIPNSHandler = http.get(
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
        headers: CORS_HEADERS,
      });
    },
  );

  // ============================================================================
  // WEBSITE HANDLERS
  // ============================================================================

  const getWebsiteConfigHandler = http.get(
    `${testConfig.apiUrl}/websites/config`,
    async () => {
      return HttpResponse.json(
        {
          gateway_domain: "ipfs.pinner.xyz",
          nameservers: ["ns1.pinner.xyz", "ns2.pinner.xyz"],
        },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const listWebsitesHandler = http.get(
    `${testConfig.apiUrl}/websites`,
    async () => {
      const sites = websiteStore.list();
      return HttpResponse.json(
        { data: sites, total: sites.length },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const createWebsiteHandler = http.post(
    `${testConfig.apiUrl}/websites`,
    async ({ request }) => {
      const body = (await request.json()) as {
        domain: string;
        target_type: string;
        target_hash: string;
        dns_hosting_enabled?: boolean;
      };

      const id = websiteStore.getNextWebsiteId();

      const newWebsite: Website = {
        id,
        domain: body.domain,
        target_type: body.target_type,
        target_hash: body.target_hash,
        status: SSLStatus.PENDING,
        validation_token: `valid-token-${id + 1}`,
        dns_hosting_enabled: body.dns_hosting_enabled ?? false,
        created: new Date(),
        updated: new Date(),
        expired: false,
        last_checked_at: new Date(),
        validation_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      websiteStore.set(id, newWebsite);

      return HttpResponse.json(newWebsite, {
        status: 201,
        headers: CORS_HEADERS,
      });
    },
  );

  const getWebsiteHandler = http.get(
    `${testConfig.apiUrl}/websites/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const website = websiteStore.findById(id);

      if (!website) {
        return HttpResponse.json(
          { error: { reason: "Website not found" } },
          { status: 404 },
        );
      }

      return HttpResponse.json(website, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const updateWebsiteHandler = http.put(
    `${testConfig.apiUrl}/websites/:id`,
    async ({ params, request }) => {
      const id = parseInt(params.id as string);
      const body = (await request.json()) as {
        domain?: string;
        target_type?: string;
        target_hash?: string;
        dns_hosting_enabled?: boolean;
      };

      const website = websiteStore.findById(id);
      if (!website) {
        return HttpResponse.json(
          { error: { reason: "Website not found" } },
          { status: 404 },
        );
      }

      if (body.domain !== undefined) website.domain = body.domain;
      if (body.target_type !== undefined) website.target_type = body.target_type;
      if (body.target_hash !== undefined) website.target_hash = body.target_hash;
      if (body.dns_hosting_enabled !== undefined) website.dns_hosting_enabled = body.dns_hosting_enabled;
      website.updated = new Date();
      website.status = "pending";

      return HttpResponse.json(website, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const deleteWebsiteHandler = http.delete(
    `${testConfig.apiUrl}/websites/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const website = websiteStore.findById(id);

      if (!website) {
        return HttpResponse.json(
          { error: { reason: "Website not found" } },
          { status: 404 },
        );
      }

      websiteStore.deleteById(id);

      return new HttpResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    },
  );

  const validateWebsiteHandler = http.post(
    `${testConfig.apiUrl}/websites/:id/validate`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const website = websiteStore.findById(id);

      if (!website) {
        return HttpResponse.json(
          { error: { reason: "Website not found" } },
          { status: 404 },
        );
      }

      const validationResult = {
        id: website.id,
        domain: website.domain,
        valid: true,
        message: "DNS validation successful",
        reason: "validated",
      };

      return HttpResponse.json(validationResult, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const getSSLStatusHandler = http.get(
    `${testConfig.apiUrl}/websites/:domain/ssl-status`,
    async ({ params }) => {
      const domain = params.domain as string;
      const sslStatus = websiteStore.getSSLStatus(domain);

      return HttpResponse.json(sslStatus, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  // getWebsiteConfigHandler MUST come before getWebsiteHandler to avoid
  // /websites/:id matching /websites/config
  return [
    listIPNSKeysHandler,
    createIPNSKeyHandler,
    getIPNSKeyHandler,
    deleteIPNSKeyHandler,
    publishIPNSHandler,
    republishIPNSHandler,
    resolveIPNSHandler,
    listWebsitesHandler,
    createWebsiteHandler,
    getWebsiteConfigHandler,
    getWebsiteHandler,
    updateWebsiteHandler,
    deleteWebsiteHandler,
    validateWebsiteHandler,
    getSSLStatusHandler,
  ];
}

export async function resetWebsitesIPNSState(websiteStore: WebsiteStore, ipnsStore: IPNSStore): Promise<void> {
  websiteStore.reset();
  ipnsStore.reset();
  await websiteStore.initializeDefaults();
  await ipnsStore.initializeDefaults();
}
