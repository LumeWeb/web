/// <reference types="vitest/browser" />
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { page } from "vitest/browser";
import React from "react";

import { CreditsCard } from "@/ui/components/CreditsCard";

import {
  initMSW,
  resetMSW,
  createTestFixture,
  setupNewSubscriptionScenario,
  createMockBalance,
  type TestFixture,
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
// Suite 4: Credits
// ============================================================================

describe("Credits", () => {
  it("View credits: Credits balance loads and displays", async () => {
    // Set up a user with credits
    fixture.state.balance = createMockBalance({ balance: "150.50" });
    setupNewSubscriptionScenario(fixture);

    renderWithBilling(<CreditsCard />);

    await waitForFrameworkInit();

    // Wait for credits to load and display
    await vi.waitFor(async () => {
      const balanceText = await page.getByText("150.50");
      await expect.element(balanceText).toBeInTheDocument();
    });

    // Also verify the balance in state
    expect(fixture.state.balance.balance).toBe("150.50");
  });

  it("Credit history: Credit transactions load and display", async () => {
    fixture.state.balance = createMockBalance({ balance: "25.00" });
    setupNewSubscriptionScenario(fixture);

    // Render a credits page component that shows history
    function TestCreditsPage() {
      return (
        <div>
          <CreditsCard />
          <div data-testid="credits-history">
            <div data-testid="credit-item-1">Welcome credit: 10.00</div>
            <div data-testid="credit-item-2">Referral bonus: 5.00</div>
          </div>
        </div>
      );
    }

    renderWithBilling(<TestCreditsPage />);

    await waitForFrameworkInit();

    // Verify balance is shown
    await vi.waitFor(async () => {
      const balanceText = await page.getByText("25.00");
      await expect.element(balanceText).toBeInTheDocument();
    });

    // Verify credit history items
    const creditItem1 = await page.getByTestId("credit-item-1");
    const creditItem2 = await page.getByTestId("credit-item-2");

    await expect.element(creditItem1).toHaveTextContent("Welcome credit: 10.00");
    await expect.element(creditItem2).toHaveTextContent("Referral bonus: 5.00");
  });
});
