/** Asserts browser payload results against the opted-in real host cluster. */
import {
  observeHostPayload,
  observeHostPayloadSettled,
} from "../support/host-observer.js";
import { observeSharedHosts } from "../support/response-drain.js";
import { expect, test } from "./browser-fixture.js";

function readOnly(rpcs: string[]) {
  expect(
    rpcs.some((rpc) => rpc.includes("ReadSector")),
    "real read-sector evidence",
  ).toBe(true);
  expect(rpcs.some((rpc) => rpc.includes("WriteSector"))).toBe(false);
}

test("browser retained reads succeed after key expiry and reject after observed token deadlines", async ({
  realPage,
}, testInfo) => {
  const bodyStartedAtMs = Date.now();
  const origin = new URL(process.env.SIA_TEST_INDEXD_URL!).origin;
  const observer = observeSharedHosts(realPage, origin);
  const { drain } = observer;
  let noTokenDiagnostics = 0;
  let probeFailure: undefined | { error: unknown };
  try {
    const expiresAt = Date.now() + 15_000;
    const prepared = await realPage.evaluate(
      (expiresAt) => window.probe.prepareExpiry(expiresAt),
      expiresAt,
    );
    expect(prepared.owner).toMatchObject({ metadata: [], size: 1 });
    const before = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(before.result).toEqual([42]);
    readOnly(before.payloadRPCs);
    expect(Date.now()).toBeLessThan(expiresAt);
    await drain();
    const firstExpiry =
      observer.snapshot().conservativeMaximumDeliveredExpiryMs;
    expect(firstExpiry).not.toBeNull();
    expect(firstExpiry!).toBeGreaterThan(expiresAt + 1000);
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, expiresAt + 1000 - Date.now())),
    );
    expect(
      Date.now(),
      "fresh checks start after sharing-key expiry",
    ).toBeGreaterThanOrEqual(expiresAt + 1000);
    expect(
      await realPage.evaluate(() => window.probe.expiryDenyFresh()),
    ).toEqual({ connect401: true, metadata401: true });
    const immediate = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    const lastSuccessfulReadAtMs = Date.now();
    expect(immediate.result).toEqual([42]);
    readOnly(immediate.payloadRPCs);
    const ownerImmediate = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryOwnerRead()),
    );
    expect(ownerImmediate.result).toEqual({
      bytes: [42],
      owner: prepared.owner,
    });
    readOnly(ownerImmediate.payloadRPCs);
    let deadline: number;
    for (;;) {
      await drain();
      const snapshot = observer.snapshot();
      for (const response of snapshot.observations) {
        if (response.kind === "delivered")
          expect(
            response.requestStartedAtMs,
            "no successful refresh admitted after key expiry",
          ).toBeLessThan(expiresAt);
      }
      deadline = snapshot.conservativeMaximumDeliveredExpiryMs! + 1000;
      expect(Number.isSafeInteger(deadline)).toBe(true);
      expect(
        deadline - bodyStartedAtMs,
        "observed wait fits beside the seven-minute funding bound",
      ).toBeLessThan(6 * 60_000);
      if (Date.now() >= deadline) break;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000, deadline - Date.now())),
      );
    }
    const firstFailedReadAtMs = Date.now();
    expect(
      firstFailedReadAtMs,
      "new download starts after observed expiry and wire margin",
    ).toBeGreaterThanOrEqual(deadline);
    const diagnosticsBefore = await realPage.evaluate(
      () => window.probe.diagnostics().noToken,
    );
    const cutoff = await observeHostPayloadSettled(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(
      cutoff.status,
      "retained-object download rejects, including an empty EOF",
    ).toBe("rejected");
    expect(
      await realPage.evaluate(() => window.probe.expiryProgress()),
    ).toEqual({ bytes: 0, chunks: 0, completed: false, rejected: true });
    expect(cutoff.payloadRPCs).toEqual([]);
    expect(
      (noTokenDiagnostics = await realPage.evaluate(
        () => window.probe.diagnostics().noToken,
      )) - diagnosticsBefore,
      "SDK reports no-token admission",
    ).toBeGreaterThan(0);
    const ownerFinal = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryOwnerRead()),
    );
    expect(ownerFinal.result).toEqual({ bytes: [42], owner: prepared.owner });
    readOnly(ownerFinal.payloadRPCs);
    await drain();
    const snapshot = observer.snapshot();
    for (const response of snapshot.observations) {
      if (response.kind === "delivered")
        expect(
          response.requestStartedAtMs,
          "no late successful refresh",
        ).toBeLessThan(expiresAt);
    }
    const evidence = {
      deadline,
      firstFailedReadAtMs,
      lastSuccessfulReadAtMs,
      noTokenDiagnostics,
      observations: snapshot.observations,
      ownerRPCs: [
        ownerImmediate.payloadRPCs.length,
        ownerFinal.payloadRPCs.length,
      ],
      recipientRPCs: [
        before.payloadRPCs.length,
        immediate.payloadRPCs.length,
        cutoff.payloadRPCs.length,
      ],
    };
    await testInfo.attach("observed-expiry", {
      body: JSON.stringify(evidence),
      contentType: "application/json",
    });
    console.log("Observed expiry evidence:", JSON.stringify(evidence));
  } catch (error) {
    probeFailure = { error };
    throw error;
  } finally {
    await observer.finish(probeFailure);
  }
});

test("browser authorized refresh permits new reads past the original token deadline", async ({
  realPage,
}, testInfo) => {
  const bodyStartedAtMs = Date.now();
  const origin = new URL(process.env.SIA_TEST_INDEXD_URL!).origin;
  const observer = observeSharedHosts(realPage, origin);
  const { drain } = observer;
  let probeFailure: undefined | { error: unknown };
  try {
    const prepared = await realPage.evaluate(() =>
      window.probe.prepareExpiry(),
    );
    expect(prepared.owner).toMatchObject({ metadata: [], size: 1 });
    const before = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(before.result).toEqual([42]);
    readOnly(before.payloadRPCs);
    await drain();
    const initialDeadline =
      observer.snapshot().conservativeMaximumDeliveredExpiryMs;
    expect(initialDeadline).not.toBeNull();
    expect(initialDeadline!).toBeGreaterThan(Date.now() + 1000);
    const initialObservedAtMs = Date.now();
    // No public hosts query runs here: only the connected SDK can refresh its download cache.
    while (Date.now() < initialDeadline! + 1000) {
      await drain();
      expect(Date.now() - bodyStartedAtMs).toBeLessThan(6 * 60_000);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.min(1000, initialDeadline! + 1000 - Date.now()),
        ),
      );
    }
    await drain();
    const refreshed = observer.snapshot();
    expect(
      refreshed.observations.some(
        (response) =>
          response.kind === "delivered" &&
          response.requestStartedAtMs > initialObservedAtMs &&
          response.hosts.some((host) => host.validUntilMs > initialDeadline!),
      ),
      "actual background refresh extends original validity",
    ).toBe(true);
    expect(
      refreshed.observations.some(
        (response) => response.kind === "unauthorized",
      ),
    ).toBe(false);
    const readStartedAtMs = Date.now();
    const after = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(after.result).toEqual([42]);
    readOnly(after.payloadRPCs);
    expect(
      await realPage.evaluate(() => window.probe.expiryFreshAuthorized()),
    ).toBe(true);
    const owner = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryOwnerRead()),
    );
    expect(owner.result).toEqual({ bytes: [42], owner: prepared.owner });
    readOnly(owner.payloadRPCs);
    const evidence = {
      initialDeadline,
      initialObservedAtMs,
      observations: refreshed.observations,
      readStartedAtMs,
    };
    console.log("Observed valid refresh evidence:", JSON.stringify(evidence));
    await testInfo.attach("observed-valid-refresh", {
      body: JSON.stringify(evidence),
      contentType: "application/json",
    });
  } catch (error) {
    probeFailure = { error };
    throw error;
  } finally {
    await observer.finish(probeFailure);
  }
});

test("browser revoked recipients reject new reads after observed token expiry", async ({
  realPage,
}, testInfo) => {
  const bodyStartedAtMs = Date.now();
  const origin = new URL(process.env.SIA_TEST_INDEXD_URL!).origin;
  const observer = observeSharedHosts(realPage, origin);
  const { drain } = observer;
  let noTokenDiagnostics = 0;
  let probeFailure: undefined | { error: unknown };
  try {
    const prepared = await realPage.evaluate(() =>
      window.probe.prepareExpiry(),
    );
    expect(prepared.owner).toMatchObject({ metadata: [], size: 1 });
    const before = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(before.result).toEqual([42]);
    readOnly(before.payloadRPCs);
    await drain();
    const initialDeadline =
      observer.snapshot().conservativeMaximumDeliveredExpiryMs;
    expect(initialDeadline).not.toBeNull();
    expect(initialDeadline!).toBeGreaterThan(Date.now() + 1000);
    const { revokeCompletedAtMs, revokeStartedAtMs } = await realPage.evaluate(
      () => window.probe.expiryRevoke(),
    );
    expect(revokeCompletedAtMs).toBeGreaterThanOrEqual(revokeStartedAtMs);
    expect(
      await realPage.evaluate(() => window.probe.expiryDenyFresh()),
    ).toEqual({ connect401: true, metadata401: true });
    const freshDeniedAtMs = Date.now();
    const immediate = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    const lastSuccessfulReadAtMs = Date.now();
    expect(immediate.result).toEqual([42]);
    readOnly(immediate.payloadRPCs);
    const ownerImmediate = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryOwnerRead()),
    );
    expect(ownerImmediate.result).toEqual({
      bytes: [42],
      owner: prepared.owner,
    });
    readOnly(ownerImmediate.payloadRPCs);
    let deadline: number;
    for (;;) {
      await drain();
      const snapshot = observer.snapshot();
      for (const response of snapshot.observations) {
        // Requests started before revoke completed may finish later; their delivered tokens extend this bound.
        if (response.kind === "delivered")
          expect(
            response.requestStartedAtMs,
            "no successful post-revocation refresh",
          ).toBeLessThan(revokeCompletedAtMs);
      }
      deadline = snapshot.conservativeMaximumDeliveredExpiryMs! + 1000;
      expect(Number.isSafeInteger(deadline)).toBe(true);
      expect(deadline - bodyStartedAtMs).toBeLessThan(6 * 60_000);
      if (Date.now() >= deadline) break;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000, deadline - Date.now())),
      );
    }
    const firstFailedReadAtMs = Date.now();
    expect(
      firstFailedReadAtMs,
      "new download starts after observed expiry and wire margin",
    ).toBeGreaterThanOrEqual(deadline);
    const diagnosticsBefore = await realPage.evaluate(
      () => window.probe.diagnostics().noToken,
    );
    const cutoff = await observeHostPayloadSettled(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryRecipientRead()),
    );
    expect(
      cutoff.status,
      "retained-object download rejects, including an empty EOF",
    ).toBe("rejected");
    expect(
      await realPage.evaluate(() => window.probe.expiryProgress()),
    ).toEqual({ bytes: 0, chunks: 0, completed: false, rejected: true });
    expect(cutoff.payloadRPCs).toEqual([]);
    expect(
      (noTokenDiagnostics = await realPage.evaluate(
        () => window.probe.diagnostics().noToken,
      )) - diagnosticsBefore,
      "SDK reports no-token admission",
    ).toBeGreaterThan(0);
    const ownerFinal = await observeHostPayload(
      process.env.SIA_TEST_CLUSTER_LOG,
      () => realPage.evaluate(() => window.probe.expiryOwnerRead()),
    );
    expect(ownerFinal.result).toEqual({
      bytes: [42],
      owner: prepared.owner,
    });
    readOnly(ownerFinal.payloadRPCs);
    await drain();
    const snapshot = observer.snapshot();
    for (const response of snapshot.observations) {
      if (response.kind === "delivered")
        expect(
          response.requestStartedAtMs,
          "no late successful refresh",
        ).toBeLessThan(revokeCompletedAtMs);
    }
    expect(
      snapshot.observations.some(
        (response) =>
          response.kind === "unauthorized" &&
          response.requestStartedAtMs > freshDeniedAtMs,
      ),
      "background refresh receives 401 after fresh denial",
    ).toBe(true);
    const evidence = {
      deadline,
      firstFailedReadAtMs,
      initialDeadline,
      lastSuccessfulReadAtMs,
      noTokenDiagnostics,
      observations: snapshot.observations,
      ownerRPCs: [
        ownerImmediate.payloadRPCs.length,
        ownerFinal.payloadRPCs.length,
      ],
      recipientRPCs: [
        before.payloadRPCs.length,
        immediate.payloadRPCs.length,
        cutoff.payloadRPCs.length,
      ],
      revokeCompletedAtMs,
      revokeStartedAtMs,
    };
    await testInfo.attach("observed-revocation", {
      body: JSON.stringify(evidence),
      contentType: "application/json",
    });
    console.log("Observed revocation evidence:", JSON.stringify(evidence));
  } catch (error) {
    probeFailure = { error };
    throw error;
  } finally {
    await observer.finish(probeFailure);
  }
});
