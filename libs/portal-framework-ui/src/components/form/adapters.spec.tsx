import type { z } from "zod"; // Import zod type for importedZod variable

import { useForm as useRefineForm } from "@refinedev/react-hook-form";
import {
  Controller as RHFController,
  FormProvider as RHFFormProvider,
  useForm as useRHFForm,
} from "react-hook-form";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest"; // Import Mock type

import { adapters } from "./adapters";
import { FormConfig } from "./types";

// Declare variables to hold dynamically imported mock exports
let importedZodResolver: Mock; // Use vi.Mock type
let importedZodResolverSymbol: symbol;
let importedMockZodSchema: symbol;
let importedMockZodString: symbol;
let importedZod: typeof z; // Declare variable for the mocked z object

// Mock external libraries
vi.mock("react-hook-form", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-hook-form")>();
  return {
    ...actual,
    Controller: vi.fn(({ render }) => render({ field: {} })),
    FormProvider: vi.fn(({ children }) => <div>{children}</div>),
    useForm: vi.fn(),
  };
});
vi.mock("@refinedev/react-hook-form", () => ({
  useForm: vi.fn(),
}));

// Mock @hookform/resolvers/zod
vi.mock("@hookform/resolvers/zod", () => {
  const zodResolverSymbol = Symbol("zodResolverSymbol"); // Rename symbol variable
  const mockedZodResolver = vi.fn((schema) => zodResolverSymbol); // Rename mock function variable
  return {
    zodResolver: mockedZodResolver, // Export the mock function with original name
    zodResolverSymbol: zodResolverSymbol, // Export the symbol with a clearer name
  };
});

// Mock zod
vi.mock("zod", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zod")>();
  const mockZodSchema = Symbol("mockZodSchema");
  const mockZodString = Symbol("mockZodString");
  return {
    ...actual, // Keep all original exports
    mockZodSchema: mockZodSchema, // Export symbol for assertions
    mockZodString: mockZodString, // Export symbol for assertions
    z: {
      // Mock the 'z' export
      // Removed ...actual.z as it's not needed and causes TS error
      object: vi.fn((shape) => mockZodSchema), // Mock the 'object' function to return a symbol
      string: vi.fn(() => mockZodString), // Mock z.string to return a symbol
    },
  };
});

const mockUseRHFForm = useRHFForm as vi.Mock;
const mockUseRefineForm = useRefineForm as vi.Mock;
// mockZodResolver is no longer a top-level variable, will be imported from mock

describe("Form Adapters", () => {
  beforeEach(async () => {
    // Make beforeEach async
    // Reset mocks before each test
    vi.clearAllMocks();

    // Dynamically import mock exports
    const zodResolversMock = await import("@hookform/resolvers/zod");
    importedZodResolver = zodResolversMock.zodResolver as Mock; // Assert the type to Mock
    importedZodResolverSymbol = zodResolversMock.zodResolverSymbol;

    const zodMock = await import("zod");
    importedMockZodSchema = zodMock.mockZodSchema;
    importedMockZodString = zodMock.mockZodString;
    importedZod = zodMock.z; // Dynamically import the mocked z object

    // Mock return values for useForm hooks
    mockUseRHFForm.mockReturnValue({
      control: {},
      formState: {},
      getValues: vi.fn(),
      handleSubmit: vi.fn(),
      // Add other RHF methods if adapters use them directly
    });
    mockUseRefineForm.mockReturnValue({
      control: {},
      formState: {},
      getValues: vi.fn(),
      handleSubmit: vi.fn(),
      refineCore: {
        onFinish: vi.fn(),
        // Add other refineCore methods if adapters use them directly
      },
      // Add other Refine methods if adapters use them directly
    });
  });

  describe("rhf adapter", () => {
    const rhfAdapter = adapters.rhf;

    it("should have correct Controller and FormProvider", () => {
      expect(rhfAdapter.Controller).toBe(RHFController);
      expect(rhfAdapter.FormProvider).toBe(RHFFormProvider);
    });

    it("useForm should call react-hook-form useForm", () => {
      const options = {
        defaultValues: { name: "test" },
        validationSchema: importedZod.object({ name: importedZod.string() }), // Use importedZod
      };
      rhfAdapter.useForm(options);

      expect(mockUseRHFForm).toHaveBeenCalledTimes(1);
      expect(mockUseRHFForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: options.defaultValues,
          resolver: importedZodResolverSymbol, // Use imported symbol
        }),
      );
      expect(importedZodResolver).toHaveBeenCalledTimes(1); // Use imported mock function
      // Assert that zodResolver was called with the mocked schema symbol
      expect(importedZodResolver).toHaveBeenCalledWith(importedMockZodSchema); // Use imported mock function and symbol
    });

    it("useForm should call react-hook-form useForm without resolver if no schema", () => {
      const options = {
        defaultValues: { name: "test" },
      };
      rhfAdapter.useForm(options);

      expect(mockUseRHFForm).toHaveBeenCalledTimes(1);
      expect(mockUseRHFForm).toHaveBeenCalledWith({
        defaultValues: options.defaultValues,
        resolver: undefined,
      });
      expect(importedZodResolver).not.toHaveBeenCalled(); // Use imported mock function
    });

    it("submitHandler should call config.onSubmit with form values", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue({ success: true });
      const mockGetValues = vi.fn(() => ({ field1: "value1" }));
      const mockMethods = { getValues: mockGetValues } as any;
      const mockConfig: FormConfig<any> = {
        fields: [],
        onSubmit: mockOnSubmit,
      };

      const result = await rhfAdapter.submitHandler(mockConfig, mockMethods);

      expect(mockGetValues).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith({ field1: "value1" });
      expect(result).toEqual({ success: true });
    });

    it("submitHandler should throw error if config.onSubmit is missing", async () => {
      const mockMethods = { getValues: vi.fn() } as any;
      const mockConfig: FormConfig<any> = { fields: [] }; // Missing onSubmit

      await expect(
        rhfAdapter.submitHandler(mockConfig, mockMethods),
      ).rejects.toThrow("onSubmit required for RHF adapter");
    });
  });

  describe("refine adapter", () => {
    const refineAdapter = adapters.refine;

    it("should have correct Controller and FormProvider", () => {
      expect(refineAdapter.Controller).toBe(RHFController);
      expect(refineAdapter.FormProvider).toBe(RHFFormProvider);
    });

    it("useForm should call @refinedev/react-hook-form useForm", () => {
      const options = {
        defaultValues: { name: "test" },
        refineCoreProps: { resource: "posts" },
        validationSchema: importedZod.object({ name: importedZod.string() }), // Use importedZod
      };
      refineAdapter.useForm(options);

      expect(mockUseRefineForm).toHaveBeenCalledTimes(1);
      expect(mockUseRefineForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: options.defaultValues,
          refineCoreProps: {
            autoSave: { enabled: false },
            resource: "posts",
          },
          resolver: importedZodResolverSymbol, // Use imported symbol
        }),
      );
      expect(importedZodResolver).toHaveBeenCalledTimes(1); // Use imported mock function
      // Assert that zodResolver was called with the mocked schema symbol
      expect(importedZodResolver).toHaveBeenCalledWith(importedMockZodSchema); // Use imported mock function and symbol
    });

    it("useForm should merge default refineCoreProps", () => {
      const options = {
        refineCoreProps: { action: "create", meta: { foo: "bar" } }, // Use string literal 'create'
      };
      refineAdapter.useForm(options);

      expect(mockUseRefineForm).toHaveBeenCalledTimes(1);
      expect(mockUseRefineForm).toHaveBeenCalledWith(
        expect.objectContaining({
          refineCoreProps: {
            action: "create",
            autoSave: { enabled: false },
            meta: { foo: "bar" },
          },
        }),
      );
    });

    it("submitHandler should call refineCore.onFinish", async () => {
      const mockOnFinish = vi
        .fn()
        .mockResolvedValue({ data: { refineData: true } });
      const mockGetValues = vi.fn(() => ({ field1: "value1" }));
      const mockMethods = {
        getValues: mockGetValues,
        refineCore: { onFinish: mockOnFinish },
      } as any;
      const mockConfig: FormConfig<any> = { fields: [] };

      const result = await refineAdapter.submitHandler(mockConfig, mockMethods);

      expect(mockGetValues).toHaveBeenCalledTimes(1);
      expect(mockOnFinish).toHaveBeenCalledWith({ field1: "value1" });
      // The submitHandler returns the raw refine result, SchemaForm unwraps data
      expect(result).toEqual({ data: { refineData: true } });
    });

    it("submitHandler should call config.onSubmit after refineCore.onFinish if present", async () => {
      const mockOnFinish = vi
        .fn()
        .mockResolvedValue({ data: { refineData: true } });
      const mockOnSubmit = vi.fn().mockResolvedValue({ submitData: true });
      const mockGetValues = vi.fn(() => ({ field1: "value1" }));
      const mockMethods = {
        getValues: mockGetValues,
        refineCore: { onFinish: mockOnFinish },
      } as any;
      const mockConfig: FormConfig<any> = {
        fields: [],
        onSubmit: mockOnSubmit,
      };

      const result = await refineAdapter.submitHandler(mockConfig, mockMethods);

      expect(mockGetValues).toHaveBeenCalledTimes(1);
      expect(mockOnFinish).toHaveBeenCalledWith({ field1: "value1" });
      expect(mockOnSubmit).toHaveBeenCalledWith({ field1: "value1" });
      // If onSubmit returns a value, it should be returned, otherwise refineResult
      expect(result).toEqual({ submitData: true });
    });

    it("submitHandler should return refineCore.onFinish result if config.onSubmit is present but returns void", async () => {
      const mockOnFinish = vi
        .fn()
        .mockResolvedValue({ data: { refineData: true } });
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined); // onSubmit returns void
      const mockGetValues = vi.fn(() => ({ field1: "value1" }));
      const mockMethods = {
        getValues: mockGetValues,
        refineCore: { onFinish: mockOnFinish },
      } as any;
      const mockConfig: FormConfig<any> = {
        fields: [],
        onSubmit: mockOnSubmit,
      };

      const result = await refineAdapter.submitHandler(mockConfig, mockMethods);

      expect(mockOnFinish).toHaveBeenCalledWith({ field1: "value1" });
      expect(mockOnSubmit).toHaveBeenCalledWith({ field1: "value1" });
      // Should return refineResult if onSubmit returns void
      expect(result).toEqual({ data: { refineData: true } });
    });
  });
});
