import { MapStore } from "./store";
import type { Pin, PinStatus } from "@ipfs-shipyard/pinning-service-client";
import { Status } from "@ipfs-shipyard/pinning-service-client";
import { createMockCID } from "../setup";

/** If pin name starts with a Status value + "-", use that status. Otherwise Queued. */
export function deriveStatus(pin: Pin): Status {
  const name = pin.name || "";
  for (const status of Object.values(Status)) {
    if (name.startsWith(`${status}-`)) {
      return status;
    }
  }
  return Status.Queued;
}

const DEFAULT_DELEGATES = [
  "/ip4/203.0.113.42/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/ip6/2001:db8::42/tcp/8080/p2p/QmYVEDcquBLjoMEz6qxTSm5AfQ3uUcvHdxC8VUJs6sB1oh",
  "/dns4/node0.example.net/tcp/443/wss/p2p/QmZMxuNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
  "/dnsaddr/node1.example.org/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
];

/**
 * MapStore<string, PinStatus> keyed by CID, with requestid counter and delegates.
 * Call initializeDefaults() after construction to populate test pins.
 */
export class PinStore extends MapStore<string, PinStatus> {
  private requestIdCounter = 0;
  private readonly delegates = [...DEFAULT_DELEGATES];

  constructor() {
    super();
  }

  getNextRequestId(): string {
    this.requestIdCounter++;
    return `req-${this.requestIdCounter}`;
  }

  getDelegates(): string[] {
    return this.delegates;
  }

  findByRequestId(requestid: string): PinStatus | undefined {
    for (const pinStatus of this.list()) {
      if (pinStatus.requestid === requestid) {
        return pinStatus;
      }
    }
    return undefined;
  }

  findCidByRequestId(requestid: string): string | undefined {
    for (const [cid, pinStatus] of this.entries()) {
      if (pinStatus.requestid === requestid) {
        return cid;
      }
    }
    return undefined;
  }

  deleteByRequestId(requestid: string): boolean {
    const cid = this.findCidByRequestId(requestid);
    if (cid) {
      return this.delete(cid);
    }
    return false;
  }

  override reset(): void {
    super.reset();
    this.requestIdCounter = 0;
  }

  async initializeDefaults(): Promise<void> {
    this.clear();
    this.requestIdCounter = 0;

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
      const requestid = this.getNextRequestId();
      const pinStatus: PinStatus = {
        requestid,
        status: deriveStatus(pin),
        created: new Date(),
        pin,
        delegates: this.delegates,
        info: {},
      };
      this.set(pin.cid, pinStatus);
    }
  }
}
