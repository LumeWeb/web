import type { PortalMeta } from "@lumeweb/portal-framework-core";

import { Sdk } from "@lumeweb/portal-sdk";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { storeResetFns } from "@/../__mocks__/zustand"; // Import the reset function set
// Import Theme from the new types file
import { Theme } from "@/types/theme";
import { createDefaultTheme } from "@/utils/theme"; // createDefaultTheme is still in utils

import { metaStore, portalStore } from "./portalStore"; // Import the stores

// Mock the environment variable
// Need to await importActual outside the mock factory
const actualCore = await vi.importActual<
  typeof import("@lumeweb/portal-framework-core")
>("@lumeweb/portal-framework-core");

vi.mock("@lumeweb/portal-framework-core", () => {
  return {
    ...actualCore,
    env: {
      ...actualCore.env,
      VITE_PORTAL_DOMAIN: "https://mock-portal.example.com",
    },
  };
});

// Mock the Sdk class
vi.mock("@lumeweb/portal-sdk", () => {
  return {
    Sdk: class MockSdk {
      isMock = true;
      // Update the constructor to match the real Sdk constructor signature
      constructor(public apiUrl: string) {
        // Store the apiUrl if needed for more complex mock behavior,
        // but for this fix, just accepting it is enough.
      }
      // Add mock methods that are called in the store logic if necessary
      // For this test, we only need the constructor to be callable correctly.
    },
  };
});

// Mock theme creation
vi.mock("@/utils/theme", () => {
  return {
    createDefaultTheme: () => ({
      colors: {},
      id: "mock-theme",
      images: {},
      name: "Mock Theme",
    }),
  };
});

const createMockData = () => ({
  mockMeta: {
    domain: "mock-domain.com",
    feature_flags: {},
    plugins: {},
  } as PortalMeta, // Explicitly type mockMeta
  // Pass a mock apiUrl to the Sdk constructor
  mockSdk: new (vi.mocked(Sdk))("https://mock-portal.example.com"),
  mockTheme: createDefaultTheme(),
});

// Define mockMeta outside the function so it's accessible to all tests
const { mockMeta } = createMockData();

describe("portalStore", () => {
  // Reset the store BEFORE each test using the mock's reset functionality
  beforeEach(() => {
    act(() => {
      storeResetFns.forEach((resetFn) => resetFn());
    });
  });

  it("should have correct initial state", () => {
    const state = portalStore.getState();
    expect(state.sdk).toBeNull();
    expect(state.meta).toBeUndefined();
    expect(state.portalUrl).toBe("https://mock-portal.example.com"); // Should use the mocked env var
    expect(state.isMetaLoading).toBe(false);
  });

  it("should set sdk", () => {
    const { mockSdk } = createMockData();
    act(() => {
      portalStore.getState().setSdk(mockSdk);
    });
    expect(portalStore.getState().sdk).toEqual(mockSdk);

    act(() => {
      portalStore.getState().setSdk(null);
    });
    expect(portalStore.getState().sdk).toBeNull();
  });

  it("should set meta", () => {
    // Use the globally defined mockMeta
    act(() => {
      portalStore.getState().setMeta(mockMeta);
    });
    expect(portalStore.getState().meta).toEqual(mockMeta);

    act(() => {
      portalStore.getState().setMeta(undefined);
    });
    expect(portalStore.getState().meta).toBeUndefined();
  });

  it("should set portalUrl", () => {
    const newUrl = "https://another-portal.example.com";
    act(() => {
      portalStore.getState().setPortalUrl(newUrl);
    });
    expect(portalStore.getState().portalUrl).toBe(newUrl);
  });

  it("should set isMetaLoading", () => {
    act(() => {
      portalStore.getState().setIsMetaLoading(true);
    });
    expect(portalStore.getState().isMetaLoading).toBe(true);

    act(() => {
      portalStore.getState().setIsMetaLoading(false);
    });
    expect(portalStore.getState().isMetaLoading).toBe(false);
  });
});

describe("metaStore (derived)", () => {
  // Reset the store BEFORE each test using the mock's reset functionality
  beforeEach(() => {
    act(() => {
      storeResetFns.forEach((resetFn) => resetFn());
    });
  });

  it("should be undefined initially", () => {
    // Initial state has portalUrl but no meta
    expect(metaStore.getState()).toBeUndefined();
  });

  it("should return meta when portalUrl is set and meta is available and not loading", () => {
    act(() => {
      portalStore.getState().setPortalUrl("https://test.com");
      portalStore.getState().setMeta(mockMeta); // Use the globally defined mockMeta
      portalStore.getState().setIsMetaLoading(false);
    });
    expect(metaStore.getState()).toBe(mockMeta);
  });

  it("should be undefined when isMetaLoading is true", () => {
    act(() => {
      portalStore.getState().setPortalUrl("https://test.com");
      portalStore.getState().setMeta(mockMeta); // Use the globally defined mockMeta
      portalStore.getState().setIsMetaLoading(true); // Set loading to true
    });
    expect(metaStore.getState()).toBeUndefined();

    // Check that it becomes available again when loading is false
    act(() => {
      portalStore.getState().setIsMetaLoading(false);
    });
    expect(metaStore.getState()).toBe(mockMeta);
  });

  it("should be undefined when portalUrl is empty", () => {
    act(() => {
      portalStore.getState().setPortalUrl(""); // Clear portalUrl
      portalStore.getState().setMeta(mockMeta); // Use the globally defined mockMeta
      portalStore.getState().setIsMetaLoading(false);
    });
    expect(metaStore.getState()).toBeUndefined();

    // Check that it becomes available again when portalUrl is set
    act(() => {
      portalStore.getState().setPortalUrl("https://test.com");
    });
    expect(metaStore.getState()).toBe(mockMeta);
  });

  it("should be undefined when meta is undefined", () => {
    act(() => {
      portalStore.getState().setPortalUrl("https://test.com");
      portalStore.getState().setMeta(undefined); // Set meta to undefined
      portalStore.getState().setIsMetaLoading(false);
    });
    expect(metaStore.getState()).toBeUndefined();

    // Check that it becomes available again when meta is set
    act(() => {
      portalStore.getState().setMeta(mockMeta); // Use the globally defined mockMeta
    });
    expect(metaStore.getState()).toBe(mockMeta);
  });
});
