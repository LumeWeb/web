import { Logger, Peer, S5Config, SignedRegistryEntry } from "#types.js";
import { AbstractLevel, AbstractSublevel } from "abstract-level";
import {
  mkeyEd25519,
  protocolMethodRegistryQuery,
  recordTypeRegistryEntry,
  registryMaxDataSize,
} from "#constants.js";
import { Multihash } from "#multihash.js";
import { base64url } from "multiformats/bases/base64";
import { decodeEndian, encodeEndian } from "#util.js";
import { ed25519 } from "@noble/curves/ed25519";
import Packer from "#serialization/pack.js";
import { Buffer } from "buffer";
import { EventEmitter } from "events";
import KeyPairEd25519 from "#ed25519.js";
import { S5Node, stringifyBytes } from "#node.js";

export class RegistryService {
  private db?: AbstractSublevel<
    AbstractLevel<Uint8Array, string, Uint8Array>,
    Uint8Array,
    string,
    Uint8Array
  >;
  private node: S5Node;
  private logger: Logger;
  private streams: Map<string, EventEmitter> = new Map<string, EventEmitter>();

  constructor(node: S5Node) {
    this.node = node;
    this.logger = this.node.logger;
    node.services.registry = this;
  }

  async init(): Promise<void> {
    this.db = this.node.db.sublevel<string, Uint8Array>("s5-registry-db", {});
  }

  async set(
    sre: SignedRegistryEntry,
    trusted: boolean = false,
    receivedFrom?: Peer,
  ): Promise<void> {
    this.logger.verbose(
      `[registry] set ${base64url.encode(sre.pk)} ${sre.revision} (${
        receivedFrom?.id
      })`,
    );

    if (!trusted) {
      if (sre.pk.length !== 33) {
        throw new Error("Invalid pubkey");
      }
      if (sre.pk[0] !== mkeyEd25519) {
        throw new Error("Only ed25519 keys are supported");
      }
      if (sre.revision < 0 || sre.revision > 281474976710656) {
        throw new Error("Invalid revision");
      }
      if (sre.data.length > registryMaxDataSize) {
        throw new Error("Data too long");
      }

      const isValid = this.verifyRegistryEntry(sre);
      if (!isValid) {
        throw new Error("Invalid signature found");
      }
    }

    const existingEntry = await this.getFromDB(sre.pk);

    if (existingEntry) {
      if (receivedFrom) {
        if (existingEntry.revision === sre.revision) {
          return;
        } else if (existingEntry.revision > sre.revision) {
          const updateMessage = this.serializeRegistryEntry(existingEntry);
          receivedFrom.sendMessage(updateMessage);
          return;
        }
      }

      if (existingEntry.revision >= sre.revision) {
        throw new Error("Revision number too low");
      }
    }

    const key = new Multihash(sre.pk);
    this.streams.get(key.toString())?.emit("event", sre);

    this.db?.put(stringifyBytes(sre.pk), this.serializeRegistryEntry(sre));

    this.broadcastEntry(sre, receivedFrom);
  }

  // TODO: Clean this table after some time
  // TODO: If there are more than X peers, only broadcast to subscribed nodes (routing table) and shard-nodes (256)
  broadcastEntry(sre: SignedRegistryEntry, receivedFrom?: Peer): void {
    this.logger.verbose("[registry] broadcastEntry");
    const updateMessage = this.serializeRegistryEntry(sre);

    for (const p of Object.values(this.node.services.p2p.peers)) {
      if (receivedFrom == null || p.id !== receivedFrom.id) {
        p.sendMessage(updateMessage);
      }
    }
  }

  sendRegistryRequest(pk: Uint8Array): void {
    const p = new Packer();

    p.packInt(protocolMethodRegistryQuery);
    p.packBinary(Buffer.from(pk));

    const req = p.takeBytes();

    // TODO: Use shard system if there are more than X peers
    for (const peer of Object.values(this.node.services.p2p.peers)) {
      peer.sendMessage(req);
    }
  }

  async get(pk: Uint8Array): Promise<SignedRegistryEntry | null> {
    const key = new Multihash(pk);
    if (this.streams.has(key.toString())) {
      this.logger.verbose(`[registry] get (subbed) ${key}`);
      let res = await this.getFromDB(pk);
      if (res !== null) {
        return res;
      }
      this.sendRegistryRequest(pk);
      await pTimeout(200);
      return this.getFromDB(pk);
    } else {
      this.sendRegistryRequest(pk);
      this.streams.set(key.toString(), new EventEmitter());
      let res = await this.getFromDB(pk);
      if (res === null) {
        this.logger.verbose(`[registry] get (clean) ${key}`);
        for (let i = 0; i < 200; i++) {
          await pTimeout(10);
          if ((await this.getFromDB(pk)) !== null) {
            break;
          }
        }
      } else {
        this.logger.verbose(`[registry] get (cached) ${key}`);
        await pTimeout(200);
      }
      return this.getFromDB(pk);
    }
  }

  private async setEntryHelper(
    keyPair: KeyPairEd25519,
    data: Uint8Array,
  ): Promise<void> {
    const revision = Math.round(Date.now() / 1000);

    const sre: SignedRegistryEntry = this.signRegistryEntry({
      kp: keyPair,
      data,
      revision,
    });

    await this.set(sre);
  }

  signRegistryEntry({
    kp,
    data,
    revision,
  }: {
    kp: KeyPairEd25519;
    data: Uint8Array;
    revision: number;
  }): SignedRegistryEntry {
    const list = new Uint8Array([
      recordTypeRegistryEntry,
      ...encodeEndian(revision, 8),
      data.length,
      ...data,
    ]);

    const signature = ed25519.sign(list, kp.extractBytes());

    return {
      pk: kp.publicKey,
      revision,
      data,
      signature: new Uint8Array(signature),
    };
  }

  async getFromDB(pk: Uint8Array): Promise<SignedRegistryEntry | null> {
    const val = await this.db?.get(stringifyBytes(pk));

    if (val) {
      return this.deserializeRegistryEntry(val);
    }

    return null;
  }

  public listen(
    pk: Uint8Array,
    cb: (sre: SignedRegistryEntry) => void,
  ): () => void {
    const key = new Multihash(pk).toString();
    if (!this.streams[key]) {
      this.streams[key] = new EventEmitter();
      this.sendRegistryRequest(pk);
    }
    const stream = this.streams[key] as EventEmitter;

    const done = () => {
      stream.off("event", cb);
    };

    stream.on("event", cb);

    return done;
  }

  public deserializeRegistryEntry(event: Uint8Array): SignedRegistryEntry {
    const dataLength = event[42];
    return {
      pk: event.slice(1, 34),
      revision: decodeEndian(event.slice(34, 42)),
      data: event.slice(43, 43 + dataLength),
      signature: event.slice(43 + dataLength),
    };
  }

  public verifyRegistryEntry(sre: SignedRegistryEntry): boolean {
    const list: Uint8Array = Uint8Array.from([
      recordTypeRegistryEntry,
      ...encodeEndian(sre.revision, 8),
      sre.data.length, // 1 byte
      ...sre.data,
    ]);

    return ed25519.verify(list, sre.signature, sre.pk.slice(1));
  }
  public serializeRegistryEntry(sre: SignedRegistryEntry): Uint8Array {
    return Uint8Array.from([
      recordTypeRegistryEntry,
      ...sre.pk,
      ...encodeEndian(sre.revision, 8),
      sre.data.length,
      ...sre.data,
      ...sre.signature,
    ]);
  }
}

async function pTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
