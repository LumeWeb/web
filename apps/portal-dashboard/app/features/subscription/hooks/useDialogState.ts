import { useState, useCallback, useEffect } from 'react';

interface UseDialogStateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shouldPreventClose?: boolean;
}

export function useDialogState({
  isOpen,
  onOpenChange,
  shouldPreventClose = false
}: UseDialogStateProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasError(false);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && shouldPreventClose && hasError) {
      return;
    }
    onOpenChange(open);
  }, [onOpenChange, shouldPreventClose, hasError]);

  return {
    hasError,
    setHasError,
    handleOpenChange
  };
}
