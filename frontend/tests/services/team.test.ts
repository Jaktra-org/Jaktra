import { teamService } from '../../src/services/team';
import { api } from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct API endpoints for team operations', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.delete).mockResolvedValue({ data: {} });
    vi.mocked(api.put).mockResolvedValue({ data: {} });

    await teamService.getMembers();
    expect(api.get).toHaveBeenCalledWith('/team/members');

    await teamService.getInvitations();
    expect(api.get).toHaveBeenCalledWith('/team/invitations');

    await teamService.inviteMember('colleague@ex.com', 'admin');
    expect(api.post).toHaveBeenCalledWith('/team/invitations', { email: 'colleague@ex.com', role: 'admin' });

    await teamService.resendInvitation('invite-1');
    expect(api.post).toHaveBeenCalledWith('/team/invitations/invite-1/resend');

    await teamService.revokeInvitation('invite-1');
    expect(api.delete).toHaveBeenCalledWith('/team/invitations/invite-1');

    await teamService.removeMember('user-1');
    expect(api.delete).toHaveBeenCalledWith('/team/members/user-1');

    await teamService.updateMemberRole('user-1', 'viewer');
    expect(api.put).toHaveBeenCalledWith('/team/members/user-1/role', { role: 'viewer' });

    await teamService.acceptInvitation('token-123', 'name', 'password');
    expect(api.post).toHaveBeenCalledWith('/team/accept-invitation', { token: 'token-123', name: 'name', password: 'password' });
  });
});
