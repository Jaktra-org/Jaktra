import React from 'react';
import { screen, act, waitFor, fireEvent } from '../../test-utils';
import { renderWithProviders, userEvent } from '../../test-utils';
import { TeamSettings } from '../../../src/pages/Settings/TeamSettings';
import { teamService } from '../../../src/services/team';

// Mock teamService
vi.mock('../../../src/services/team', () => ({
  teamService: {
    getMembers: vi.fn(),
    getInvitations: vi.fn(),
    inviteMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}));

describe('TeamSettings component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Access Denied when the user is not an admin or manager', () => {
    renderWithProviders(<TeamSettings />, {
      authState: {
        user: { id: '1', name: 'Member', email: 'm@m.com', role: 'member', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Invite Member')).not.toBeInTheDocument();
  });

  it('renders active members list for manager/admin role profiles', async () => {
    const mockMembers = [
      { id: 'u-1', name: 'Alice Admin', email: 'alice@ex.com', role: 'admin' as const },
      { id: 'u-2', name: 'Bob Viewer', email: 'bob@ex.com', role: 'viewer' as const },
    ];
    vi.mocked(teamService.getMembers).mockResolvedValue(mockMembers);
    vi.mocked(teamService.getInvitations).mockResolvedValue([]);

    renderWithProviders(<TeamSettings />, {
      authState: {
        user: { id: 'u-1', name: 'Alice Admin', email: 'alice@ex.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
      expect(screen.getByText('Bob Viewer')).toBeInTheDocument();
    });
  });

  it('triggers InviteModal validation and submits new member invitation on success', async () => {
    vi.mocked(teamService.getMembers).mockResolvedValue([]);
    vi.mocked(teamService.getInvitations).mockResolvedValue([]);
    vi.mocked(teamService.inviteMember).mockResolvedValue({} as any);

    renderWithProviders(<TeamSettings />, {
      authState: {
        user: { id: 'u-1', name: 'Alice Admin', email: 'alice@ex.com', role: 'admin', tenantId: 't1' },
        isLoading: false,
        isAuthenticated: true,
      },
    });

    // Wait for initial render complete
    await waitFor(() => {
      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });

    // Open invite modal
    const inviteBtn = screen.getByRole('button', { name: /Invite Member/i });
    await act(async () => {
      inviteBtn.click();
    });

    // Modal forms visible
    expect(screen.getByRole('heading', { name: 'Invite Team Member' })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('colleague@example.com');
    const roleSelect = screen.getByRole('combobox');
    const submitBtn = screen.getByRole('button', { name: /Send Invitation/i });

    // Validate invalid email
    await userEvent.type(emailInput, 'invalid-email');
    await act(async () => {
      fireEvent.submit(submitBtn.closest('form')!);
    });
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();

    // Fill valid details and submit
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'colleague@example.com');
    await userEvent.selectOptions(roleSelect, 'manager');

    await act(async () => {
      submitBtn.click();
    });

    expect(teamService.inviteMember).toHaveBeenCalledWith('colleague@example.com', 'manager');
    
    // Modal should close on success
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Invite Team Member' })).not.toBeInTheDocument();
    });
  });
});
