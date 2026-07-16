import { authService } from '../../src/services/auth';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('login handles mfaPending responses by updating sessionStorage', async () => {
    const mockPendingRes = { mfaPending: true, mfaPendingToken: 'mfa-token-abc' };
    vi.mocked(api.post).mockResolvedValue({ data: mockPendingRes });

    const result = await authService.login({ email: 'u@e.com', password: 'pwd' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'u@e.com', password: 'pwd' });
    expect(sessionStorage.getItem('mfa_pending_token')).toBe('mfa-token-abc');
    expect(result).toEqual(mockPendingRes);
  });

  it('login handles direct token responses by updating localStorage', async () => {
    const mockLoginRes = { token: 'jwt-auth-token-123', user: { id: 'u1' } };
    vi.mocked(api.post).mockResolvedValue({ data: mockLoginRes });

    const result = await authService.login({ email: 'u@e.com', password: 'pwd' });

    expect(localStorage.getItem('auth_token')).toBe('jwt-auth-token-123');
    expect(result).toEqual(mockLoginRes);
  });

  it('mfaVerify throws error if no session token exists in sessionStorage', async () => {
    await expect(authService.mfaVerify('123456')).rejects.toThrow('No MFA session found. Please log in again.');
  });

  it('mfaVerify succeeds and clears sessionStorage and sets localStorage', async () => {
    sessionStorage.setItem('mfa_pending_token', 'mfa-session-token');
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'auth-jwt-token' } });

    await authService.mfaVerify('123456');

    expect(api.post).toHaveBeenCalledWith('/auth/mfa/verify', {
      mfaPendingToken: 'mfa-session-token',
      code: '123456',
    });
    expect(sessionStorage.getItem('mfa_pending_token')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBe('auth-jwt-token');
  });

  it('logout clears storage and redirects to /login', () => {
    localStorage.setItem('auth_token', 'token');
    sessionStorage.setItem('mfa_pending_token', 'pending');

    const originalLocation = window.location;
    const mockLocation = { href: '' } as any;
    // @ts-ignore
    delete window.location;
    window.location = mockLocation;

    authService.logout();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('mfa_pending_token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  it('calls correct API endpoints for MFA and profiles updates', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: {} });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });

    await authService.getMe();
    expect(api.get).toHaveBeenCalledWith('/auth/me');

    await authService.updateProfile('New Name');
    expect(api.patch).toHaveBeenCalledWith('/auth/profile', { name: 'New Name' });

    await authService.mfaSetupInitiate();
    expect(api.post).toHaveBeenCalledWith('/auth/mfa/setup');

    await authService.mfaSetupConfirm('112233');
    expect(api.post).toHaveBeenCalledWith('/auth/mfa/confirm', { code: '112233' });

    await authService.mfaDisable('445566');
    expect(api.delete).toHaveBeenCalledWith('/auth/mfa', { data: { code: '445566' } });
  });
});
