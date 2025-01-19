import React, { createContext, ReactNode, useContext, useState } from "react";
import { usePaymentMachine } from "../hooks/usePaymentMachine";

interface PaymentContextValue {
  state: string;
  context: {
    payment: any;
    error: Error | null;
    retryCount: number;
    maxRetries: number;
  };
  actions: {
    startPayment: () => void;
    processPayment: () => void;
    completePayment: () => void;
    handleError: (error: Error) => void;
    retry: () => void;
  };
  forceRemount: () => void;
}

const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePaymentContext must be used within a PaymentProvider");
  }
  return context;
}

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [key, setKey] = useState(0);
  const { state, context, actions } = usePaymentMachine();

  const forceRemount = () => {
    setKey(prev => prev + 1);
  };

  return (
    <PaymentContext.Provider
      key={key}
      value={{
        state,
        context,
        actions,
        forceRemount,
      }}>
      {children}
    </PaymentContext.Provider>
  );
}
