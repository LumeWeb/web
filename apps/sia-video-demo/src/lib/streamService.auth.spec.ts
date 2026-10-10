import { describe, expect, it } from "vitest";
import {
  configureDemoStreamAuth,
  createDemoNativeStreamService,
} from "./streamService";

const createStore = () => ({
  getState: () => ({ indexerUrl: "", sharingKeyHex: null, userKeyHex: "" }),
  subscribe: () => () => undefined,
});

describe("demo stream auth configuration", () => {
  it("rejects a second pre-service configuration from a different store", () => {
    const firstStore = createStore();
    const secondStore = createStore();

    configureDemoStreamAuth(firstStore);
    configureDemoStreamAuth(firstStore);

    expect(() => configureDemoStreamAuth(secondStore)).toThrow(
      "configureDemoStreamAuth was already configured with a different store",
    );
  });

  it("rejects configuration after the factory creates a service", () => {
    createDemoNativeStreamService();

    expect(() => configureDemoStreamAuth(createStore())).toThrow(
      "configureDemoStreamAuth must run before the demo stream service is constructed",
    );
  });
});
