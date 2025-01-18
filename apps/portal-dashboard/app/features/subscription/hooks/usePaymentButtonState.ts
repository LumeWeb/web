import { useState, useCallback } from 'react';
import { PaymentButtonState } from '../types/payment.types';

export function usePaymentButtonState(initialState: PaymentButtonState = 'idle') {
  const [buttonState, setButtonState] = useState<PaymentButtonState>(initialState);

  const startProcessing = useCallback(() => {
    setButtonState('processing');
  }, []);

  const handleSuccess = useCallback(() => {
    setButtonState('succeeded');
  }, []);

  const handleError = useCallback(() => {
    setButtonState('failed');
  }, []);

  const retry = useCallback(() => {
    setButtonState('retrying');
  }, []);

  const reset = useCallback(() => {
    setButtonState('idle');
  }, []);

  return {
    buttonState,
    startProcessing,
    handleSuccess,
    handleError,
    retry,
    reset
  };
}
