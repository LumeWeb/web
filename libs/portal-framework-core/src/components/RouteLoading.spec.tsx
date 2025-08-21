import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteLoading } from "./RouteLoading";

describe("RouteLoading", () => {
  it("should render loading skeleton", () => {
    render(<RouteLoading />);

    const container = screen.getByRole("alert");
    expect(container).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(1);
    expect(container.querySelectorAll(".h-4.bg-gray-200.rounded")).toHaveLength(
      3,
    );
  });
});
