import React, { createContext, ReactNode, useContext } from "react";
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
  const { state, context, actions } = usePaymentMachine();

  return (
    <PaymentContext.Provider
      value={{
        state,
        context,
        actions,
      }}>
      {children}
    </PaymentContext.Provider>
  );
}
