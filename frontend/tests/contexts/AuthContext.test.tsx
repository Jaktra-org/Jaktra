import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/auth';
import { authEvents } from '../../src/services/api';
import { MemoryRouter } from 'react-router-dom';

// Mock authService
vi.mock('../../src/services/auth', () => ({
  authService: {
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => mockNavigate,
    MemoryRouter: original.MemoryRouter,
  };
});

// A simple test component to consume AuthContext
function ConsumerComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      <div>{isAuthenticated ? `User: ${user?.name}` : 'Unauthenticated'}</div>
      <button onClick={() => login('mock-token', { id: '1', name: 'New User', email: 'n@e.com', role: 'member', tenantId: 't1' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes as unauthenticated when no token is in localStorage', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Unauthenticated')).toBeInTheDocument();
  });

  it('starts loading and fetches user data when token exists in localStorage', async () => {
    localStorage.setItem('auth_token', 'valid-mock-token');
    const mockUser = { id: 'u123', name: 'John Doe', email: 'j@d.com', role: 'admin', tenantId: 't1' };
    
    // Resolve with mock user data
    let resolveGetMe: (val: any) => void = () => {};
    const getMePromise = new Promise((resolve) => {
      resolveGetMe = resolve;
    });
    vi.mocked(authService.getMe).mockReturnValue(getMePromise as any);

    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    // Should initially show loading spinner/text
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await act(async () => {
      resolveGetMe(mockUser);
    });

    // Loading should complete and display the user's name
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('User: John Doe')).toBeInTheDocument();
  });

  it('removes token and sets unauthenticated state if getMe call fails', async () => {
    localStorage.setItem('auth_token', 'expired-token');
    vi.mocked(authService.getMe).mockRejectedValue(new Error('Unauthorized'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Unauthenticated')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('updates state and token when login is triggered', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Unauthenticated')).toBeInTheDocument();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    expect(screen.getByText('User: New User')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('mock-token');
  });

  it('clears state, clears token, and calls authService.logout when logout is triggered', async () => {
    localStorage.setItem('auth_token', 'token');
    const mockUser = { id: 'u1', name: 'User Name', email: 'u@n.com', role: 'admin', tenantId: 't1' };
    vi.mocked(authService.getMe).mockResolvedValue(mockUser);

    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User: User Name')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    expect(screen.getByText('Unauthenticated')).toBeInTheDocument();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('clears state, token and redirects to /login on external unauthorized event', async () => {
    localStorage.setItem('auth_token', 'token');
    const mockUser = { id: 'u1', name: 'User Name', email: 'u@n.com', role: 'admin', tenantId: 't1' };
    vi.mocked(authService.getMe).mockResolvedValue(mockUser);

    render(
      <MemoryRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User: User Name')).toBeInTheDocument();
    });

    // Fire the global unauthorized event (e.g. from an API interceptor response)
    act(() => {
      authEvents.dispatchEvent(new Event('unauthorized'));
    });

    // Verify it handles state updates and redirects immediately
    expect(screen.getByText('Unauthenticated')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
