import { base58btc } from "multiformats/bases/base58";
import { equalBytes } from "@noble/curves/abstract/utils";
import { NodeId } from "./nodeId";
import { ed25519 } from "@noble/curves/ed25519";

describe("NodeID", () => {
  const pk = ed25519.getPublicKey(ed25519.utils.randomPrivateKey());

  test("should encode and decode correctly", () => {
    const input = pk.slice();
    const encoded = base58btc.encode(input);
    const decoded = NodeId.decode(encoded);
    expect(decoded.bytes).toEqual(input);
  });

  test("equals method should return true when comparing identical NodeIds", () => {
    const input = pk.slice();
    const nid1 = new NodeId(input);
    const nid2 = new NodeId(input);
    expect(nid1.equals(nid2)).toBeTruthy();
  });

  test("equals method should return false when comparing different NodeIds", () => {
    const input1 = pk.slice();
    const input2 = ed25519.getPublicKey(ed25519.utils.randomPrivateKey());
    const nid1 = new NodeId(input1);
    const nid2 = new NodeId(input2);
    expect(nid1.equals(nid2)).toBeFalsy();
  });

  test("toBase58 method should return correct base58 string", () => {
    const input = pk.slice();
    const nid = new NodeId(input);
    expect(nid.toBase58()).toEqual(base58btc.encode(input));
  });

  test("toString method should return correct string representation", () => {
    const input = pk.slice();
    const nid = new NodeId(input);
    expect(nid.toString()).toEqual(nid.toBase58());
  });
});
