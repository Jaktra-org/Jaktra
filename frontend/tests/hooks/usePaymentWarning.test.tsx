import { renderHook, act, waitFor } from '@testing-library/react';
import { usePaymentWarning } from '../../src/hooks/usePaymentWarning';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { settingsService } from '../../src/services/settings';
import React from 'react';

// Mock settingsService
vi.mock('../../src/services/settings', () => ({
  settingsService: {
    updateSettings: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePaymentWarning hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not trigger a warning when Razorpay integration is configured and valid', () => {
    const integrations = {
      razorpay: {
        isConfigured: true,
        lastValidationResult: 'valid',
        maskedKeyId: '1234',
      },
    };
    const settings = { skipPaymentWarning: false };

    const { result } = renderHook(
      () => usePaymentWarning({ integrations: integrations as any, settings: settings as any }),
      { wrapper: createWrapper() }
    );

    const mockAction = vi.fn();

    act(() => {
      result.current.runWithWarningCheck(mockAction);
    });

    expect(result.current.showModal).toBe(false);
    expect(mockAction).toHaveBeenCalled();
  });

  it('triggers a warning modal when Razorpay is not configured and warning is not skipped', () => {
    const integrations = {
      razorpay: {
        isConfigured: false,
        lastValidationResult: 'invalid',
      },
    };
    const settings = { skipPaymentWarning: false };

    const { result } = renderHook(
      () => usePaymentWarning({ integrations: integrations as any, settings: settings as any }),
      { wrapper: createWrapper() }
    );

    const mockAction = vi.fn();

    act(() => {
      result.current.runWithWarningCheck(mockAction);
    });

    // Modal should be shown, action should not have run yet
    expect(result.current.showModal).toBe(true);
    expect(mockAction).not.toHaveBeenCalled();

    // Confirm warning
    act(() => {
      result.current.handleConfirm(false);
    });

    expect(result.current.showModal).toBe(false);
    expect(mockAction).toHaveBeenCalled();
  });

  it('skips warning modal when settings skipPaymentWarning is true', () => {
    const integrations = {
      razorpay: {
        isConfigured: false,
        lastValidationResult: 'invalid',
      },
    };
    const settings = { skipPaymentWarning: true };

    const { result } = renderHook(
      () => usePaymentWarning({ integrations: integrations as any, settings: settings as any }),
      { wrapper: createWrapper() }
    );

    const mockAction = vi.fn();

    act(() => {
      result.current.runWithWarningCheck(mockAction);
    });

    expect(result.current.showModal).toBe(false);
    expect(mockAction).toHaveBeenCalled();
  });

  it('calls settingsService.updateSettings when warning is confirmed with skipInFuture = true', async () => {
    const integrations = {
      razorpay: {
        isConfigured: false,
        lastValidationResult: 'invalid',
      },
    };
    const settings = { skipPaymentWarning: false };
    vi.mocked(settingsService.updateSettings).mockResolvedValue({} as any);

    const { result } = renderHook(
      () => usePaymentWarning({ integrations: integrations as any, settings: settings as any }),
      { wrapper: createWrapper() }
    );

    const mockAction = vi.fn();

    act(() => {
      result.current.runWithWarningCheck(mockAction);
    });

    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.handleConfirm(true);
    });

    expect(result.current.showModal).toBe(false);
    expect(mockAction).toHaveBeenCalled();
    await waitFor(() => {
      expect(settingsService.updateSettings).toHaveBeenCalledWith({ skipPaymentWarning: true });
    });
  });

  it('resets pending action and hides modal when handleCancel is called', () => {
    const integrations = {
      razorpay: {
        isConfigured: false,
        lastValidationResult: 'invalid',
      },
    };
    const settings = { skipPaymentWarning: false };

    const { result } = renderHook(
      () => usePaymentWarning({ integrations: integrations as any, settings: settings as any }),
      { wrapper: createWrapper() }
    );

    const mockAction = vi.fn();

    act(() => {
      result.current.runWithWarningCheck(mockAction);
    });

    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.showModal).toBe(false);
    expect(mockAction).not.toHaveBeenCalled();
  });
});
