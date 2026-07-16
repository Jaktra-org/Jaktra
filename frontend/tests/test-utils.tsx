import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// We create a mock context type structure that matches AuthContext Type
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  tenantId: string;
  mfaEnabled?: boolean;
}

interface MockAuthState {
  user: MockUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login?: (token: string, user: MockUser) => void;
  logout?: () => void;
  updateUser?: (userData: MockUser) => void;
}

// Create custom React Context to inject auth state into test trees
export const TestAuthContext = React.createContext<MockAuthState | undefined>(undefined);

// A default auth state representing an authenticated admin user for generic tests
const defaultAuthState: MockAuthState = {
  user: {
    id: 'test-user-123',
    name: 'Admin Test User',
    email: 'admin@example.com',
    role: 'admin',
    tenantId: 'test-tenant-456',
    mfaEnabled: false,
  },
  isLoading: false,
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  authState?: Partial<MockAuthState>;
}

// Custom wrapper setup
export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    authState = {},
    ...options
  }: CustomRenderOptions = {}
) {
  // Create a clean QueryClient instance for every render to ensure test isolation
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const mergedAuthState = {
    ...defaultAuthState,
    ...authState,
    // Ensure isAuthenticated stays synced with user presence unless explicitly overridden
    isAuthenticated: authState.isAuthenticated ?? !!(authState.user ?? defaultAuthState.user),
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <TestAuthContext.Provider value={mergedAuthState}>
            {children}
          </TestAuthContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export standard query mocking and user event library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

import { useContext } from 'react';
import { vi } from 'vitest';

// Automatically mock the AuthContext useAuth hook to fall back to our TestAuthContext in test runs
vi.mock('../src/contexts/AuthContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/contexts/AuthContext')>();
  return {
    ...original,
    useAuth: () => {
      try {
        const testCtx = useContext(TestAuthContext);
        if (testCtx) {
          return testCtx;
        }
      } catch {
        // Fallback if called outside React context tree
      }
      return original.useAuth();
    },
  };
});
