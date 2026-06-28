import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NavigationTreeNode } from "../hooks/useNavigationTree";

// Mock external UI dependencies that the component's sub-components rely on
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Collapsible: ({ children, open, ...props }: any) => (
    <div data-state={open ? "open" : "closed"} {...props}>
      {children}
    </div>
  ),
  CollapsibleContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CollapsibleTrigger: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipContent: () => null,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@refinedev/core", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("./layout/SidebarContext", () => ({
  useSidebarContext: () => ({ isCollapsed: false }),
}));

import { NavigationTreeRenderer } from "./NavigationTreeRenderer";

describe("NavigationTreeRenderer", () => {
  afterEach(cleanup);

  it("renders 3-level nested menu structure", () => {
    const tree: NavigationTreeNode[] = [
      {
        id: "a",
        label: "Section A",
        path: "/a",
        depth: 0,
        children: [
          {
            id: "b",
            label: "Subsection B",
            path: "/a/b",
            depth: 1,
            children: [
              {
                id: "c",
                label: "Item C",
                path: "/a/b/c",
                depth: 2,
                children: [],
              },
            ],
          },
        ],
      },
    ];

    const { getByText } = render(<NavigationTreeRenderer tree={tree} />);

    expect(getByText("Section A")).toBeTruthy();
    expect(getByText("Subsection B")).toBeTruthy();
    expect(getByText("Item C")).toBeTruthy();
  });

  it("renders 4-level deep nesting", () => {
    const tree: NavigationTreeNode[] = [
      {
        id: "a",
        label: "L1",
        path: "/a",
        depth: 0,
        children: [
          {
            id: "b",
            label: "L2",
            path: "/a/b",
            depth: 1,
            children: [
              {
                id: "c",
                label: "L3",
                path: "/a/b/c",
                depth: 2,
                children: [
                  {
                    id: "d",
                    label: "L4",
                    path: "/a/b/c/d",
                    depth: 3,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const { getByText } = render(<NavigationTreeRenderer tree={tree} />);

    expect(getByText("L1")).toBeTruthy();
    expect(getByText("L2")).toBeTruthy();
    expect(getByText("L3")).toBeTruthy();
    expect(getByText("L4")).toBeTruthy();
  });

  it("renders leaf node with no children", () => {
    const tree: NavigationTreeNode[] = [
      {
        id: "leaf",
        label: "Leaf Item",
        path: "/leaf",
        depth: 0,
        children: [],
      },
    ];

    const { getByText } = render(<NavigationTreeRenderer tree={tree} />);

    expect(getByText("Leaf Item")).toBeTruthy();
  });

  it("renders empty tree gracefully", () => {
    const { container } = render(<NavigationTreeRenderer tree={[]} />);
    expect(container.querySelector("ul")).toBeTruthy();
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });

  it("renders multiple siblings at same level", () => {
    const tree: NavigationTreeNode[] = [
      {
        id: "a",
        label: "Alpha",
        path: "/a",
        depth: 0,
        children: [
          { id: "b", label: "Beta", path: "/a/b", depth: 1, children: [] },
          { id: "c", label: "Gamma", path: "/a/c", depth: 1, children: [] },
        ],
      },
    ];

    const { getByText } = render(<NavigationTreeRenderer tree={tree} />);

    expect(getByText("Alpha")).toBeTruthy();
    expect(getByText("Beta")).toBeTruthy();
    expect(getByText("Gamma")).toBeTruthy();
  });

  it("renders 5-level deep nesting (regression guard)", () => {
    const tree: NavigationTreeNode[] = [
      {
        id: "1",
        label: "D1",
        path: "/1",
        depth: 0,
        children: [
          {
            id: "2",
            label: "D2",
            path: "/1/2",
            depth: 1,
            children: [
              {
                id: "3",
                label: "D3",
                path: "/1/2/3",
                depth: 2,
                children: [
                  {
                    id: "4",
                    label: "D4",
                    path: "/1/2/3/4",
                    depth: 3,
                    children: [
                      {
                        id: "5",
                        label: "D5",
                        path: "/1/2/3/4/5",
                        depth: 4,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const { getByText } = render(<NavigationTreeRenderer tree={tree} />);

    expect(getByText("D1")).toBeTruthy();
    expect(getByText("D2")).toBeTruthy();
    expect(getByText("D3")).toBeTruthy();
    expect(getByText("D4")).toBeTruthy();
    expect(getByText("D5")).toBeTruthy();
  });
});
