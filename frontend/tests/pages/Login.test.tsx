import React from 'react';
import { screen, act, waitFor } from '../test-utils';
import { renderWithProviders, userEvent } from '../test-utils';
import { Login } from '../../src/pages/Login';
import { authService } from '../../src/services/auth';

// Mock authService
vi.mock('../../src/services/auth', () => ({
  authService: {
    login: vi.fn(),
    mfaVerify: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: { pathname: '/settings' } } }),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits credentials and routes directly on successful logins', async () => {
    const loginMock = vi.fn();
    const mockUser = { id: 'u1', name: 'User 1', email: 'u1@ex.com', role: 'admin' as const, tenantId: 't1' };
    vi.mocked(authService.login).mockResolvedValue({ token: 'jwt-token', user: mockUser });

    renderWithProviders(<Login />, {
      authState: { user: null, isLoading: false, isAuthenticated: false, login: loginMock },
    });

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'u1@ex.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pwd123');

    const signInBtn = screen.getByRole('button', { name: /Sign in/i });
    await act(async () => {
      signInBtn.click();
    });

    expect(authService.login).toHaveBeenCalledWith({ email: 'u1@ex.com', password: 'pwd123' });
    expect(loginMock).toHaveBeenCalledWith('jwt-token', mockUser);
    expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
  });

  it('renders MFA step when login response indicates mfaPending is true', async () => {
    vi.mocked(authService.login).mockResolvedValue({ mfaPending: true, mfaPendingToken: 'pending-token-xyz' });

    renderWithProviders(<Login />, {
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'u1@ex.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pwd123');

    const signInBtn = screen.getByRole('button', { name: /Sign in/i });
    await act(async () => {
      signInBtn.click();
    });

    // Should transition to MFA screen
    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication')).toBeInTheDocument();
    });

    // Mock verify token submission
    const mockUser = { id: 'u1', name: 'User 1', email: 'u1@ex.com', role: 'admin' as const, tenantId: 't1' };
    vi.mocked(authService.mfaVerify).mockResolvedValue({ token: 'mfa-auth-jwt', user: mockUser });

    const mfaCodeInput = screen.getByPlaceholderText('000000');
    await userEvent.type(mfaCodeInput, '112233');

    const verifyBtn = screen.getByRole('button', { name: /Verify/i });
    await act(async () => {
      verifyBtn.click();
    });

    expect(authService.mfaVerify).toHaveBeenCalledWith('112233');
    expect(mockNavigate).toHaveBeenCalledWith('/settings', { replace: true });
  });

  it('goes back to credentials layout when back arrow link is clicked on MFA screen', async () => {
    vi.mocked(authService.login).mockResolvedValue({ mfaPending: true, mfaPendingToken: 'pending-token-xyz' });

    renderWithProviders(<Login />, {
      authState: { user: null, isLoading: false, isAuthenticated: false },
    });

    await userEvent.type(screen.getByPlaceholderText('you@company.com'), 'u1@ex.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pwd123');

    await act(async () => {
      screen.getByRole('button', { name: /Sign in/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication')).toBeInTheDocument();
    });

    const backToSignInBtn = screen.getByRole('button', { name: /Back to login/i });
    await act(async () => {
      backToSignInBtn.click();
    });

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});
