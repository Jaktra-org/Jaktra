import React from 'react';
import { screen, act, waitFor } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { MfaSetup } from '../../../src/pages/Settings/MfaSetup';
import { authService } from '../../../src/services/auth';

// Mock authService
vi.mock('../../../src/services/auth', () => ({
  authService: {
    mfaSetupInitiate: vi.fn(),
    mfaSetupConfirm: vi.fn(),
    mfaDisable: vi.fn(),
  },
}));

describe('MfaSetup component steps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates the user step-by-step through MFA enrollment', async () => {
    const onMfaChangeMock = vi.fn();
    vi.mocked(authService.mfaSetupInitiate).mockResolvedValue({
      qrCodeDataUrl: 'data:image/png;base64,qr-mock',
    });
    vi.mocked(authService.mfaSetupConfirm).mockResolvedValue({
      backupCodes: ['code-1', 'code-2', 'code-3'],
    });

    renderWithProviders(<MfaSetup mfaEnabled={false} onMfaChange={onMfaChangeMock} />);

    // Step 1: Idle
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    const setupBtn = screen.getByRole('button', { name: /Enable Two-Factor Authentication/i });
    await act(async () => {
      setupBtn.click();
    });

    expect(authService.mfaSetupInitiate).toHaveBeenCalled();

    // Step 2: QR Scan Code Confirm
    await waitFor(() => {
      expect(screen.getByText('Set up Authenticator')).toBeInTheDocument();
    });
    const codeInput = screen.getByPlaceholderText('000000');
    await userEvent.type(codeInput, '123456');

    const verifyBtn = screen.getByRole('button', { name: /^Confirm$/i });
    await act(async () => {
      verifyBtn.click();
    });

    expect(authService.mfaSetupConfirm).toHaveBeenCalledWith('123456');

    // Step 3: Backup Codes Page
    await waitFor(() => {
      expect(screen.getByText('Save your backup codes')).toBeInTheDocument();
      expect(screen.getByText('code-1')).toBeInTheDocument();
    });

    // Toggle confirm checkbox
    const confirmCheckbox = screen.getByRole('checkbox');
    await act(async () => {
      confirmCheckbox.click();
    });

    const doneBtn = screen.getByRole('button', { name: /Done — Enable 2FA/i });
    await act(async () => {
      doneBtn.click();
    });

    // Verify final enrolled callback
    expect(onMfaChangeMock).toHaveBeenCalledWith(true);
  });
});
