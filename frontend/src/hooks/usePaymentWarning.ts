import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import type { IntegrationsResponse, TenantSettings } from '../types/api';

interface UsePaymentWarningOptions {
  integrations: IntegrationsResponse | undefined;
  settings: TenantSettings | undefined;
}

interface UsePaymentWarningReturn {
  /** True when the warning modal should be shown before running */
  showModal: boolean;
  /** Call this instead of directly running. It will show the modal if needed,
   *  save the preference if "don't ask again" is checked, then invoke `action`. */
  runWithWarningCheck: (action: () => void) => void;
  /** Call when the user confirms from the modal */
  handleConfirm: (skipInFuture: boolean) => void;
  /** Call when the user cancels the modal */
  handleCancel: () => void;
}

/**
 * Centralised hook for payment-warning gating.
 *
 * Shows a warning modal when:
 *   1. Razorpay is NOT configured (or not valid), AND
 *   2. The tenant has NOT set skipPaymentWarning = true
 *
 * When the user confirms with "don't ask again" checked, the preference is
 * persisted via PATCH /api/settings so future runs bypass the modal.
 */
export function usePaymentWarning({
  integrations,
  settings,
}: UsePaymentWarningOptions): UsePaymentWarningReturn {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Is Razorpay currently configured and valid?
  const razorpayReady =
    integrations?.razorpay?.isConfigured &&
    integrations.razorpay.lastValidationResult === 'valid';

  // Has the tenant opted out of future warnings?
  const warningDismissed = settings?.skipPaymentWarning === true;

  // Should we gate with a warning?
  const needsWarning = !razorpayReady && !warningDismissed;

  const skipWarningMutation = useMutation({
    mutationFn: () =>
      settingsService.updateSettings({ skipPaymentWarning: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const runWithWarningCheck = useCallback(
    (action: () => void) => {
      if (needsWarning) {
        // Store the action, show the modal
        setPendingAction(() => action);
        setShowModal(true);
      } else {
        // Payment is configured or warning already dismissed — run directly
        action();
      }
    },
    [needsWarning]
  );

  const handleConfirm = useCallback(
    (skipInFuture: boolean) => {
      setShowModal(false);
      if (skipInFuture) {
        skipWarningMutation.mutate();
      }
      // Execute the pending action
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    [pendingAction, skipWarningMutation]
  );

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingAction(null);
  }, []);

  return {
    showModal,
    runWithWarningCheck,
    handleConfirm,
    handleCancel,
  };
}
