import React, { createContext, useContext, useEffect, useState } from "react";

// Core store for managing context values and subscriptions
class ContextBridgeStore {
  private static instance: ContextBridgeStore;
  private contextMap = new Map<symbol, React.Context<any>>();
  private contextNameMap = new Map<symbol, string>();
  private subscribers = new Map<symbol, Set<(value: any) => void>>();
  private values = new Map<symbol, any>();

  static getInstance() {
    if (!this.instance) {
      this.instance = new ContextBridgeStore();
    }
    return this.instance;
  }

  getContext(id: symbol): React.Context<any> | undefined {
    return this.contextMap.get(id);
  }

  getName(id: symbol): any {
    return this.contextNameMap.get(id);
  }

  getRegisteredContextIds(): symbol[] {
    return Array.from(this.contextMap.keys());
  }

  getValue(id: symbol): any {
    return this.values.get(id);
  }

  register<T>(context: React.Context<T>, name = ""): symbol {
    // Check if this context is already registered
    for (const [id, existingContext] of this.contextMap) {
      if (existingContext === context) {
        return id;
      }
    }

    const id = Symbol();
    this.contextMap.set(id, context);
    this.contextNameMap.set(id, name);

    // Register default value if provided
    const defaultValue = (context as any)._currentValue;
    if (defaultValue !== undefined) {
      this.values.set(id, defaultValue);
    }

    return id;
  }

  setValue(id: symbol, value: any) {
    this.values.set(id, value);
    this.subscribers.get(id)?.forEach((listener) => listener(value));
  }

  subscribe(id: symbol, listener: (value: any) => void) {
    if (!this.subscribers.has(id)) {
      this.subscribers.set(id, new Set());
    }
    const subscribers = this.subscribers.get(id)!;
    subscribers.add(listener);

    // Send initial value if available
    const currentValue = this.values.get(id);
    if (currentValue !== undefined) {
      // Queue the initial notification to avoid calling it synchronously
      queueMicrotask(() => {
        if (subscribers.has(listener)) {
          listener(currentValue);
        }
      });
    }

    return () => {
      subscribers.delete(listener);
    };
  }
}

export const store = ContextBridgeStore.getInstance();

const DummyContext = createContext<any>(undefined);

interface RemoteContextConsumerProps<T = any> {
  children: React.ReactNode;
  context: React.Context<T>;
}

// Component to detect and propagate context changes
export function ContextBridgeProvider({
  children,
  contextId,
  name,
}: {
  children: React.ReactNode;
  contextId: symbol;
  name?: string;
}) {
  const context = store.getContext(contextId);
  // Always call hooks at the top level
  const value = useContext(context || DummyContext);

  useEffect(() => {
    if (context) {
      store.setValue(contextId, value);
    }

    if (name) {
      console.debug(`Setting up host context ${name} in ContextBridgeProvider`);
    }
  }, [context, value, contextId, name]);

  return <>{children}</>;
}

// Host-side bridge component
export function HostContextBridge({
  children = [],
}: {
  children?: React.ReactNode;
}) {
  const contextIds = store.getRegisteredContextIds();

  return contextIds.reduce(
    (acc, contextId) => (
      <ContextBridgeProvider
        contextId={contextId}
        name={store.getName(contextId) || ""}>
        {acc}
      </ContextBridgeProvider>
    ),
    children,
  );
}

// Helper to register a context for bridging
export function registerBridgedContext<T>(
  context: React.Context<T>,
  name?: string,
): symbol {
  return store.register(context, name);
}

// Remote-side bridge component
export function RemoteContextBridge({
  children,
  contextId,
  name = "",
}: {
  children: React.ReactNode;
  contextId: symbol;
  name?: string;
}) {
  const context = store.getContext(contextId);
  const [value, setValue] = React.useState<any>(() => {
    return context ? store.getValue(contextId) : undefined;
  });

  useEffect(() => {
    if (!context) return;

    if (name) {
      console.debug(
        "Setting up remote context %s in RemoteContextBridge",
        name,
      );
    }

    // Get initial value
    const initialValue = store.getValue(contextId);
    if (initialValue !== undefined) {
      setValue(initialValue);
    }

    // Subscribe to updates
    return store.subscribe(contextId, (newValue) => {
      setValue(newValue);
    });
  }, [contextId, context, name]);

  if (!context) {
    return <>{children}</>;
  }

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function RemoteContextConsumer<T = any>({
  children,
  context,
}: RemoteContextConsumerProps<T>) {
  // Get the initial value from the store
  const [value, setValue] = useState<T | undefined>(() => {
    // Find the context ID in the store
    const allContexts = store.getRegisteredContextIds();
    for (const id of allContexts) {
      if (store.getContext(id) === context) {
        return store.getValue(id);
      }
    }
    return undefined;
  });

  useEffect(() => {
    // Find the context ID in the store
    const allContexts = store.getRegisteredContextIds();
    for (const id of allContexts) {
      if (store.getContext(id) === context) {
        // Subscribe to updates
        return store.subscribe(id, setValue);
      }
    }
  }, [context]);

  // If we don't have a value yet, pass through children without wrapping
  if (value === undefined) {
    return <>{children}</>;
  }

  return <context.Provider value={value}>{children}</context.Provider>;
}
