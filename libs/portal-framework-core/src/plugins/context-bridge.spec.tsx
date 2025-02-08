import { render, screen, waitFor } from "@testing-library/react";
import { createContext, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ContextBridgeProvider,
  HostContextBridge,
  RemoteContextBridge,
  RemoteContextConsumer,
  store,
} from "./context-bridge";
import { createBridgeComponent } from "./remoteComponentLoader";

// Test contexts
const TestContext = createContext<string>("default");
const AnotherContext = createContext<number>(0);

describe("ContextBridgeStore", () => {
  beforeEach(() => {
    // Clear store before each test
    const ids = store.getRegisteredContextIds();
    ids.forEach((id) => {
      const ctx = store.getContext(id);
      if (ctx) {
        store.setValue(id, (ctx as any)._currentValue);
      }
    });
  });

  it("should register and retrieve contexts", () => {
    const id = store.register(TestContext, "test");

    expect(store.getContext(id)).toBe(TestContext);
    expect(store.getName(id)).toBe("test");
    expect(store.getValue(id)).toBe("default");
  });

  it("should handle value updates and subscriptions", async () => {
    const id = store.register(TestContext);
    const listener = vi.fn();

    const unsubscribe = store.subscribe(id, listener);
    store.setValue(id, "updated");

    expect(listener).toHaveBeenCalledWith("updated");
    expect(store.getValue(id)).toBe("updated");

    unsubscribe();
    store.setValue(id, "another");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple contexts", () => {
    const id1 = store.register(TestContext);
    const id2 = store.register(AnotherContext);

    store.setValue(id1, "test");
    store.setValue(id2, 42);

    expect(store.getRegisteredContextIds()).toHaveLength(2);
    expect(store.getValue(id1)).toBe("test");
    expect(store.getValue(id2)).toBe(42);
  });
});

describe("ContextBridgeProvider", () => {
  it("should propagate context values from React tree to store", async () => {
    const id = store.register(TestContext);
    const initialValue = "initial value from provider";
    const updatedValue = "updated value from provider";

    const TestWrapper = ({ initialVal }: { initialVal: string }) => {
      const [val, setVal] = useState(initialVal);
      (TestWrapper as any).setVal = setVal;

      return (
        <TestContext.Provider value={val}>
          <ContextBridgeProvider contextId={id}>
            <div>Some child content</div>
          </ContextBridgeProvider>
        </TestContext.Provider>
      );
    };
    TestWrapper.displayName = "TestWrapper";

    render(<TestWrapper initialVal={initialValue} />);

    await waitFor(() => {
      expect(store.getValue(id)).toBe(initialValue);
    });

    (TestWrapper as any).setVal(updatedValue);

    await waitFor(() => {
      expect(store.getValue(id)).toBe(updatedValue);
    });
  });

  it("children within ContextBridgeProvider receive context from parent providers, not the store", async () => {
    const id = store.register(TestContext);
    const parentValue = "from parent provider";
    const storeValue = "from store directly";
    store.setValue(id, storeValue);

    render(
      <TestContext.Provider value={parentValue}>
        <ContextBridgeProvider contextId={id}>
          <TestContext.Consumer>
            {(value) => <div data-testid="test-consumer">Value: {value}</div>}
          </TestContext.Consumer>
        </ContextBridgeProvider>
      </TestContext.Provider>,
    );

    expect(screen.getByTestId("test-consumer")).toHaveTextContent(
      `Value: ${parentValue}`,
    );

    store.setValue(id, "new store value");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId("test-consumer")).toHaveTextContent(
      `Value: ${parentValue}`,
    );
  });
});

describe("HostContextBridge", () => {
  it("should propagate context values from React tree to store for all registered contexts", async () => {
    const id1 = store.register(TestContext);
    const id2 = store.register(AnotherContext);

    const initialVal1 = "initial test from host";
    const updatedVal1 = "updated test from host";
    const initialVal2 = 10;
    const updatedVal2 = 20;

    const TestWrapper = ({ val1, val2 }: { val1: string; val2: number }) => {
      return (
        <TestContext.Provider value={val1}>
          <AnotherContext.Provider value={val2}>
            <HostContextBridge>
              <div>Host Child</div>
            </HostContextBridge>
          </AnotherContext.Provider>
        </TestContext.Provider>
      );
    };
    TestWrapper.displayName = "HostTestWrapper";

    const { rerender } = render(
      <TestWrapper val1={initialVal1} val2={initialVal2} />,
    );

    await waitFor(() => {
      expect(store.getValue(id1)).toBe(initialVal1);
      expect(store.getValue(id2)).toBe(initialVal2);
    });

    rerender(<TestWrapper val1={updatedVal1} val2={updatedVal2} />);

    await waitFor(() => {
      expect(store.getValue(id1)).toBe(updatedVal1);
      expect(store.getValue(id2)).toBe(updatedVal2);
    });
  });

  it("children within HostContextBridge consume context from parent providers, not the store", async () => {
    const id1 = store.register(TestContext);
    const id2 = store.register(AnotherContext);

    const parentValue1 = "from parent provider 1";
    const parentValue2 = 999;
    const storeValue1 = "from store directly 1";
    const storeValue2 = 1234;
    store.setValue(id1, storeValue1);
    store.setValue(id2, storeValue2);

    render(
      <TestContext.Provider value={parentValue1}>
        <AnotherContext.Provider value={parentValue2}>
          <HostContextBridge>
            <TestContext.Consumer>
              {(value) => (
                <div data-testid="test-consumer-host">Test: {value}</div>
              )}
            </TestContext.Consumer>
            <AnotherContext.Consumer>
              {(value) => (
                <div data-testid="another-consumer-host">Another: {value}</div>
              )}
            </AnotherContext.Consumer>
          </HostContextBridge>
        </AnotherContext.Provider>
      </TestContext.Provider>,
    );

    expect(screen.getByTestId("test-consumer-host")).toHaveTextContent(
      `Test: ${parentValue1}`,
    );
    expect(screen.getByTestId("another-consumer-host")).toHaveTextContent(
      `Another: ${parentValue2}`,
    );

    store.setValue(id1, "new store value 1");
    store.setValue(id2, 5678);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId("test-consumer-host")).toHaveTextContent(
      `Test: ${parentValue1}`,
    );
    expect(screen.getByTestId("another-consumer-host")).toHaveTextContent(
      `Another: ${parentValue2}`,
    );
  });
});

describe("RemoteContextBridge", () => {
  it("should provide bridged context values", () => {
    const id = store.register(TestContext);
    store.setValue(id, "remote");

    render(
      <RemoteContextBridge contextId={id}>
        <TestContext.Consumer>
          {(value) => <div>Remote: {value}</div>}
        </TestContext.Consumer>
      </RemoteContextBridge>,
    );

    expect(screen.getByText("Remote: remote")).toBeInTheDocument();
  });
});

describe("RemoteContextConsumer", () => {
  it("should consume bridged contexts", () => {
    const id = store.register(TestContext);
    store.setValue(id, "consumer");

    render(
      <RemoteContextConsumer context={TestContext}>
        <TestContext.Consumer>
          {(value) => <div>Consumed: {value}</div>}
        </TestContext.Consumer>
      </RemoteContextConsumer>,
    );

    expect(screen.getByText("Consumed: consumer")).toBeInTheDocument();
  });
});

describe("createBridgeComponent", () => {
  it("should create component with context bridging", () => {
    const TestContext = createContext<string>("default");
    const id = store.register(TestContext, "test-context");
    store.setValue(id, "bridged");

    const TestComponent = ({ label }: { label: string }) => (
      <TestContext.Consumer>
        {(value) => (
          <div>
            {label}: {value}
          </div>
        )}
      </TestContext.Consumer>
    );
    TestComponent.displayName = "TestComponent";
    const BridgedComponent = createBridgeComponent(TestComponent)();

    render(
      <RemoteContextBridge contextId={id}>
        <BridgedComponent label="BridgeTest" />
      </RemoteContextBridge>,
    );

    expect(screen.getByText("BridgeTest: bridged")).toBeInTheDocument();
  });
});
