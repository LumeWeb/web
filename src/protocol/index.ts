import { Registry } from "./registry";
import { createProtocol, Protocol } from "src/protocol/impl/protocol.js";
import { S5Client } from "@lumeweb/s5-js";
import { PROTOCOL_S5, S5 } from "src/protocol/impl/s5.js";

export function registerDefaults(registry: Registry) {
  registry.register<S5Client>(
    PROTOCOL_S5,
    createProtocol<S5Client>(S5, registry.getApiDomain()),
  );
}

export { Protocol, Registry };
export { PROTOCOL_S5 };
