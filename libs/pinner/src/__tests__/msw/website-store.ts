import { MapStore } from "./store";
import { SSLStatus, type SSLStatusValue } from "@/api/websites";

// ============================================================================
// TYPES
// ============================================================================

export interface IPNSKey {
  id: number;
  name: string;
  ipns_name: string;
  peer_id: string;
  created: Date;
}

export interface Website {
  id: number;
  domain: string;
  target_type: string;
  target_hash: string;
  status: string;
  validation_token: string;
  dns_hosting_enabled: boolean;
  created: Date;
  updated: Date;
  expired: boolean;
  last_checked_at: Date;
  validation_expires_at: Date;
}

export interface SSLStatusEntry {
  status: string;
  error?: string;
  issued_at?: string;
  last_updated_at?: string;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_IPNS_KEYS: IPNSKey[] = [
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

const DEFAULT_WEBSITES: Website[] = [
  {
    id: 1,
    domain: "example.com",
    target_type: "ipfs",
    target_hash: "QmTest1",
    status: "active",
    validation_token: "valid-token-123",
    dns_hosting_enabled: false,
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
    dns_hosting_enabled: false,
    created: new Date("2024-01-02T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
    expired: false,
    last_checked_at: new Date("2024-01-02T00:00:00Z"),
    validation_expires_at: new Date("2024-01-09T00:00:00Z"),
  },
];

// ============================================================================
// IPNS STORE
// ============================================================================

export class IPNSStore extends MapStore<number, IPNSKey> {
  private keyIdCounter = 3;

  constructor() {
    super();
  }

  getNextKeyId(): number {
    return this.keyIdCounter++;
  }

  findById(id: number): IPNSKey | undefined {
    return this.get(id);
  }

  findByName(name: string): IPNSKey | undefined {
    for (const key of this.list()) {
      if (key.name === name) {
        return key;
      }
    }
    return undefined;
  }

  deleteById(id: number): boolean {
    return this.delete(id);
  }

  override reset(): void {
    super.reset();
    this.keyIdCounter = 3;
  }

  async initializeDefaults(): Promise<void> {
    this.clear();
    this.keyIdCounter = 3;
    for (const key of DEFAULT_IPNS_KEYS) {
      this.set(key.id, { ...key });
    }
  }
}

// ============================================================================
// WEBSITE STORE
// ============================================================================

export class WebsiteStore extends MapStore<number, Website> {
  private websiteIdCounter = 3;
  private sslStatuses = new Map<string, SSLStatusEntry>();

  constructor() {
    super();
  }

  getNextWebsiteId(): number {
    return this.websiteIdCounter++;
  }

  findById(id: number): Website | undefined {
    return this.get(id);
  }

  findByDomain(domain: string): Website | undefined {
    for (const website of this.list()) {
      if (website.domain === domain) {
        return website;
      }
    }
    return undefined;
  }

  deleteById(id: number): boolean {
    return this.delete(id);
  }

  getSSLStatus(domain: string): SSLStatusEntry {
    let entry = this.sslStatuses.get(domain);
    if (!entry) {
      entry = {
        status: SSLStatus.PENDING,
        last_updated_at: new Date().toISOString(),
      };
      this.sslStatuses.set(domain, entry);
    }
    return entry;
  }

  setSSLStatus(domain: string, status: string | SSLStatusValue, error?: string): void {
    this.sslStatuses.set(domain, {
      status,
      error,
      last_updated_at: new Date().toISOString(),
    });
  }

  resetSSLStatuses(): void {
    this.sslStatuses.clear();
  }

  override reset(): void {
    super.reset();
    this.websiteIdCounter = 3;
    this.sslStatuses.clear();
  }

  async initializeDefaults(): Promise<void> {
    this.clear();
    this.websiteIdCounter = 3;
    this.sslStatuses.clear();
    for (const website of DEFAULT_WEBSITES) {
      this.set(website.id, { ...website });
    }
  }
}
