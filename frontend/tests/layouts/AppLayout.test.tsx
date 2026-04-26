import React from 'react';
import { screen } from '../test-utils';
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
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Autopilot' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inquiries' })).toBeInTheDocument();
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

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoices' })).toBeInTheDocument();
    
    // Restricted links should NOT render
    expect(screen.queryByRole('link', { name: 'DLQ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Inquiries' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Activity Log' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('renders layout container for active navigation route', () => {
    renderWithProviders(<AppLayout />, {
      authState: {
        user: { id: 'u1', name: 'Admin Jane', email: 'j@a.com', role: 'admin', tenantId: 't1', mfaEnabled: false, created_at: '' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
