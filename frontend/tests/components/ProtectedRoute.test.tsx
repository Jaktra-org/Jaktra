import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen } from '../test-utils';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';

describe('ProtectedRoute component', () => {
  const ChildComponent = () => <div>Access Granted</div>;

  it('renders a full screen spinner when authentication is loading', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<ChildComponent />} />
        </Route>
      </Routes>,
      {
        route: '/',
        authState: { user: null, isLoading: true, isAuthenticated: false },
      }
    );

    // Verify it renders the loading spinner and does NOT show child component
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByText('Access Granted')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<ChildComponent />} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        route: '/dashboard',
        authState: { user: null, isLoading: false, isAuthenticated: false },
      }
    );

    // Should redirect to login and show login page text
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Access Granted')).not.toBeInTheDocument();
  });

  it('renders nested child component when user matches allowed role', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<ChildComponent />} />
        </Route>
      </Routes>,
      {
        route: '/admin',
        authState: {
          user: { id: '1', name: 'Admin', email: 'a@a.com', role: 'admin', tenantId: 't1' },
          isLoading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(screen.getByText('Access Granted')).toBeInTheDocument();
  });

  it('redirects to root (/) when user does not have allowed role', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<ChildComponent />} />
        </Route>
        <Route path="/" element={<div>Root Directory</div>} />
      </Routes>,
      {
        route: '/admin',
        authState: {
          user: { id: '2', name: 'Member', email: 'm@m.com', role: 'member', tenantId: 't1' },
          isLoading: false,
          isAuthenticated: true,
        },
      }
    );

    expect(screen.getByText('Root Directory')).toBeInTheDocument();
    expect(screen.queryByText('Access Granted')).not.toBeInTheDocument();
  });
});
