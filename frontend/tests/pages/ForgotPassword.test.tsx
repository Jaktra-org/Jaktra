import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders, userEvent } from '../test-utils';
import { ForgotPassword } from '../../src/pages/ForgotPassword';
import { authService } from '../../src/services/auth';

// Mock authService
vi.mock('../../src/services/auth', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPasswordVerify: vi.fn(),
    resetPasswordConfirm: vi.fn(),
    resetPasswordResend: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('ForgotPassword page step sequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs through the full recovery password flow successfully', async () => {
    const loginMock = vi.fn();
    vi.mocked(authService.forgotPassword).mockResolvedValue({ success: true, message: 'Code sent' });
    vi.mocked(authService.resetPasswordVerify).mockResolvedValue({ resetToken: 'reset-token-123' });
    vi.mocked(authService.resetPasswordConfirm).mockResolvedValue({ token: 'login-token', user: { name: 'Recovered User' } as any });

    renderWithProviders(<ForgotPassword />, {
      authState: { user: null, isLoading: false, isAuthenticated: false, login: loginMock },
    });

    // 1. Email Step
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText('you@company.com');
    await userEvent.type(emailInput, 'recover@example.com');
    await act(async () => {
      screen.getByRole('button', { name: /Send Reset Code/i }).click();
    });

    expect(authService.forgotPassword).toHaveBeenCalledWith('recover@example.com');

    // 2. Verification Step
    await waitFor(() => {
      expect(screen.getByText('Verify reset code')).toBeInTheDocument();
    });
    const codeInput = screen.getByPlaceholderText('000000');
    await userEvent.type(codeInput, '998877');
    await act(async () => {
      screen.getByRole('button', { name: /Verify Code/i }).click();
    });

    expect(authService.resetPasswordVerify).toHaveBeenCalledWith('recover@example.com', '998877');

    // 3. New Password Step
    await waitFor(() => {
      expect(screen.getByText('Reset password')).toBeInTheDocument();
    });
    const passInputs = screen.getAllByPlaceholderText('••••••••');

    // Mismatch check
    await userEvent.type(passInputs[0], 'new-password');
    await userEvent.type(passInputs[1], 'mismatch-password');
    const resetBtn = screen.getByRole('button', { name: /Reset Password/i });
    await act(async () => {
      resetBtn.click();
    });
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();

    // Valid check
    await userEvent.clear(passInputs[1]);
    await userEvent.type(passInputs[1], 'new-password');
    await act(async () => {
      resetBtn.click();
    });

    expect(authService.resetPasswordConfirm).toHaveBeenCalledWith('reset-token-123', 'new-password');
    expect(loginMock).toHaveBeenCalledWith('login-token', { name: 'Recovered User' });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
