/// <reference types="vitest/browser" />
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { page } from "vitest/browser";
import React from "react";

import { SubscriptionManagement } from "@/ui/components/SubscriptionManagement";

import {
  initMSW,
  resetMSW,
  createTestFixture,
  setupActiveSubscriptionScenario,
  type TestFixture,
  createMockManagementRedirectResult,
  createMockManagementApiRequiredResult,
  createMockManagementCheckoutRequiredResult,
  renderWithBilling,
  waitForFrameworkInit,
} from "./setup";

// ============================================================================
// Test Setup
// ============================================================================

let fixture: TestFixture;

beforeAll(async () => {
  await initMSW();
});

beforeEach(() => {
  resetMSW();
  fixture = createTestFixture();
});

// ============================================================================
// Suite 2: Subscription Management
// ============================================================================

describe("Subscription Management — Stripe (portal mode)", () => {
  beforeEach(() => {
    setupActiveSubscriptionScenario(fixture, "stripe");
  });

  it("Stripe cancel (portal mode): Active subscription → shows cancel and customer portal options", async () => {
    fixture.setManagementActionResult("cancel", createMockManagementRedirectResult("https://billing.stripe.com/session/test_cancel_123"));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    // Wait for management capabilities to load and render
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Cancel Subscription") && bodyText.includes("Manage in Portal");
    }, { timeout: 10000 });

    // Verify buttons are interactive elements using getByRole
    const cancelButton = page.getByRole("button", { name: /Cancel Subscription/i });
    await expect.element(cancelButton).toBeInTheDocument();

    // "Manage in Portal" section has an "Open Portal →" button
    const portalButton = page.getByRole("button", { name: /Open Portal/i });
    await expect.element(portalButton).toBeInTheDocument();

    expect(fixture.state.managementCapabilities.management_mode).toBe("portal");
    expect(fixture.state.managementCapabilities.operations.customer_portal).toBe(true);
    expect(fixture.state.managementCapabilities.operations.cancel).toBe(true);
  });

  it("Stripe plan change (checkout_required): Active subscription → shows change plan option", async () => {
    const sessionId = `sess_plan_change_${Date.now()}`;

    fixture.setManagementActionResult("change_plan", createMockManagementCheckoutRequiredResult({
      checkout_link: sessionId,
      fragments: [
        { type: "html", html: "<div>Plan change checkout</div>" },
        {
          type: "script",
          script: `window.dispatchEvent(new CustomEvent('paymentCompleted', { bubbles: true }));`,
        },
      ],
      gateway_name: "stripe",
      charge_due: "10.00",
      credit_applied: "0.00",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Change Plan");
    }, { timeout: 10000 });

    const changePlanButton = page.getByRole("button", { name: /Change Plan/i });
    await expect.element(changePlanButton).toBeInTheDocument();
  });
});

describe("Subscription Management — Atlos (api mode)", () => {
  beforeEach(() => {
    setupActiveSubscriptionScenario(fixture, "atlos");
  });

  it("Atlos cancel (api mode): Active subscription → shows cancel option for API call", async () => {
    fixture.setManagementActionResult("cancel", createMockManagementApiRequiredResult({
      method: "post",
      path: "/api/billing/gateway/atlos/cancel",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Cancel Subscription");
    }, { timeout: 10000 });

    expect(fixture.state.managementCapabilities.management_mode).toBe("api");
    expect(fixture.state.managementCapabilities.operations.cancel).toBe(true);

    const cancelButton = page.getByRole("button", { name: /Cancel Subscription/i });
    await expect.element(cancelButton).toBeInTheDocument();

    expect(fixture.state.managementCapabilities.operations.customer_portal).toBe(false);
  });

  it("Atlos plan change (api_required): Active subscription → shows change plan option for API", async () => {
    fixture.setManagementActionResult("change_plan", createMockManagementApiRequiredResult({
      method: "post",
      path: "/api/billing/gateway/atlos/change_plan",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Change Plan");
    }, { timeout: 10000 });

    expect(fixture.state.managementCapabilities.operations.change_plan).toBe(true);
    const changePlanButton = page.getByRole("button", { name: /Change Plan/i });
    await expect.element(changePlanButton).toBeInTheDocument();
  });

  it("Atlos plan change (credit_only): Downgrade → shows change plan option", async () => {
    const sessionId = `sess_credit_only_${Date.now()}`;

    fixture.setManagementActionResult("change_plan", createMockManagementCheckoutRequiredResult({
      checkout_link: sessionId,
      fragments: [],
      gateway_name: "atlos",
      charge_due: "0.00",
      credit_applied: "5.00",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Change Plan");
    }, { timeout: 10000 });

    expect(fixture.state.managementCapabilities.operations.change_plan).toBe(true);
    const changePlanButton = page.getByRole("button", { name: /Change Plan/i });
    await expect.element(changePlanButton).toBeInTheDocument();
  });

  it("Pause/Resume (Atlos api mode): Active subscription → shows pause option", async () => {
    fixture.setManagementActionResult("pause", createMockManagementApiRequiredResult({
      method: "post",
      path: "/api/billing/gateway/atlos/pause",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Pause Subscription");
    }, { timeout: 10000 });

    expect(fixture.state.managementCapabilities.operations.pause).toBe(true);
    const pauseButton = page.getByRole("button", { name: /Pause Subscription/i });
    await expect.element(pauseButton).toBeInTheDocument();
  });

  it("Unsupported operations: Gateway doesn't support customer portal → not shown", async () => {
    fixture.setManagementActionResult("customer_portal", createMockManagementApiRequiredResult({
      method: "post",
      path: "/api/billing/gateway/atlos/customer_portal",
    }));

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Cancel Subscription");
    }, { timeout: 10000 });

    // Should NOT have "Manage in Portal" / "Open Portal" button since Atlos doesn't support it
    expect(fixture.state.managementCapabilities.operations.customer_portal).toBe(false);
  });
});

describe("Subscription Management — Mixed gateway scenarios", () => {
  it("Management capabilities respected: Only show operations that gateway supports", async () => {
    setupActiveSubscriptionScenario(fixture, "stripe");
    fixture.state.managementCapabilities = {
      management_mode: "portal",
      operations: {
        cancel: true,
        change_plan: false,
        pause: false,
        resume: false,
        customer_portal: true,
      },
      admin_operations: {},
    };

    renderWithBilling(<SubscriptionManagement />);

    await waitForFrameworkInit();
    await vi.waitFor(async () => {
      const bodyText = document.body.textContent || "";
      return bodyText.includes("Cancel Subscription");
    }, { timeout: 10000 });

    // Cancel should be shown
    const cancelButton = page.getByRole("button", { name: /Cancel Subscription/i });
    await expect.element(cancelButton).toBeInTheDocument();

    // Change plan should NOT be shown (set to false in capabilities)
    const changePlanButtons = await page.getByRole("button", { name: /Change Plan/i }).elements();
    expect(changePlanButtons.length).toBe(0);

    // Customer portal should be shown
    const portalButton = page.getByRole("button", { name: /Open Portal/i });
    await expect.element(portalButton).toBeInTheDocument();
  });
});
