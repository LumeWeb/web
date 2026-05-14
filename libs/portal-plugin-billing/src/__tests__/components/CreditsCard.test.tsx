/// <reference types="vitest/browser" />
import { describe, it, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { CreditsCard } from "@/ui/components/CreditsCard";
import type { BalanceResponse, UserCreditItem } from "@/types/subscription";

vi.mock("@/hooks/useCredits", () => ({
  useCredits: vi.fn(() => ({
    balance: {
      data: { balance: { value: 42.50 }, user_id: 1 } as unknown as BalanceResponse,
      isLoading: false,
      isError: false,
    },
    history: {
      data: [
        { id: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], amount: { value: 10 }, direction: "credit", type: "purchase", description: "Added credits", created_at: "2025-01-15T00:00:00Z" },
        { id: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], amount: { value: 5 }, direction: "debit", type: "usage", description: "Used credits", created_at: "2025-01-16T00:00:00Z" },
      ] as unknown as UserCreditItem[],
      total: 2,
      isLoading: false,
      isError: false,
    },
  })),
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe("CreditsCard", () => {
  it("renders credits header", async () => {
    const screen = render(<CreditsCard />);

    await expect.element(page.getByRole("heading", { name: "Credits" })).toBeVisible();
  });

  it("renders balance", async () => {
    const screen = render(<CreditsCard />);

    await expect.element(page.getByText("Balance")).toBeVisible();
  });

  it("renders recent transactions", async () => {
    const screen = render(<CreditsCard />);

    await expect.element(page.getByText("Added credits")).toBeVisible();
    await expect.element(page.getByText("Used credits")).toBeVisible();
  });
});
