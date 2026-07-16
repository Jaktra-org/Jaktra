import React from 'react';
import { screen, act } from '../test-utils';
import { renderWithProviders } from '../test-utils';
import { AppLayout } from '../../src/layouts/AppLayout';

describe('AppLayout layout component', () => {
  it('renders standard sidebar items for admin role profiles', () => {
    renderWithProviders(<AppLayout />, {
      authState: {
        user: { id: 'u1', name: 'Admin Jane', email: 'j@a.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    // Check all admin sidebar link items exist
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Agent' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'DLQ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Disputes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Activity Log' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });

  it('hides admin-restricted settings & disputes links for viewer role profiles', () => {
    renderWithProviders(<AppLayout />, {
      authState: {
        user: { id: 'u2', name: 'Viewer Bob', email: 'b@a.com', role: 'viewer', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoices' })).toBeInTheDocument();
    
    // Restricted links should NOT render
    expect(screen.queryByRole('link', { name: 'Disputes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Activity Log' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('toggles profile menu user dropdown options on click', async () => {
    const logoutMock = vi.fn();
    renderWithProviders(<AppLayout />, {
      authState: {
        user: { id: 'u1', name: 'Admin Jane', email: 'j@a.com', role: 'admin', tenantId: 't1', mfaEnabled: false },
        isLoading: false,
        isAuthenticated: true,
        logout: logoutMock,
      },
    });

    // Renders initials
    const initialsBtn = screen.getByText('AJ');
    expect(initialsBtn).toBeInTheDocument();

    // Menu dropdown initially hidden
    expect(screen.queryByText('Admin Jane')).not.toBeInTheDocument();

    // Click to toggle dropdown open
    await act(async () => {
      initialsBtn.click();
    });

    expect(screen.getByText('Admin Jane')).toBeInTheDocument();
  });
});
