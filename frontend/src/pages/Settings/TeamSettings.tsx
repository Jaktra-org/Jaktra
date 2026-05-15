import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../../services/team';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Loader2, UserPlus, ShieldAlert, MailX, Check, X, Shield, RefreshCw, Trash2 } from 'lucide-react';
import type { TeamMember, TeamInvitation } from '../../types/api';
import { z } from 'zod';
import { getErrorMessage } from '../../utils/error-utils';

export function TeamSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManagerOrAdmin = isAdmin || user?.role === 'manager';

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['team', 'members'],
    queryFn: teamService.getMembers,
    enabled: isManagerOrAdmin,
  });

  const { data: invitations } = useQuery({
    queryKey: ['team', 'invitations'],
    queryFn: teamService.getInvitations,
    enabled: isManagerOrAdmin,
  });

  if (!isManagerOrAdmin) {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center text-[#f7f8f8]">
          <ShieldAlert className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-base font-semibold text-[#f7f8f8]">Access Denied</h3>
          <p className="text-[#8a8f98] text-xs mt-1">You need to be an admin or manager to view team settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 text-[#f7f8f8]">
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#23252a] pb-4">
          <div>
            <CardTitle className="text-base text-[#f7f8f8]">Active Members</CardTitle>
            <CardDescription className="text-xs text-[#8a8f98]">Manage your team members and their roles.</CardDescription>
          </div>
          {isAdmin && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all bg-[#5e6ad2] text-white hover:bg-[#828fff] h-8 px-3.5 shadow-none"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Invite Member
            </button>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {loadingMembers ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /></div>
          ) : members?.length === 0 ? (
            <p className="text-center text-[#8a8f98] text-xs py-8">No active members found.</p>
          ) : (
            <div className="divide-y divide-[#23252a] border border-[#23252a] rounded-md bg-[#010102]">
              {members?.map(member => (
                <MemberRow key={member.id} member={member} isAdmin={isAdmin} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isManagerOrAdmin && invitations && invitations.length > 0 && (
        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader className="border-b border-[#23252a] pb-4">
            <CardTitle className="text-base text-[#f7f8f8]">Pending Invitations</CardTitle>
            <CardDescription className="text-xs text-[#8a8f98]">Invitations that haven't been accepted yet.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y divide-[#23252a] border border-[#23252a] rounded-md bg-[#010102]">
              {invitations.map(invite => (
                <InvitationRow key={invite.id} invite={invite} isAdmin={isAdmin} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}

function MemberRow({ member, isAdmin, currentUserId }: { member: TeamMember, isAdmin: boolean, currentUserId?: string }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(member.role);
  const isSelf = member.id === currentUserId;

  const updateMutation = useMutation({
    mutationFn: () => teamService.updateMemberRole(member.id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      setIsEditing(false);
    }
  });

  const removeMutation = useMutation({
    mutationFn: () => teamService.removeMember(member.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    }
  });

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-[#141516]/60 transition-colors">
      <div className="flex flex-col">
        <span className="font-medium text-xs text-[#f7f8f8]">{member.name} {isSelf && <span className="text-[10px] bg-[#5e6ad2]/20 text-[#5e6ad2] border border-[#5e6ad2]/30 px-2 py-0.5 rounded-full ml-1.5 font-bold">You</span>}</span>
        <span className="text-xs text-[#8a8f98]">{member.email}</span>
      </div>
      <div className="flex items-center gap-3">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'viewer')}
              className="text-xs bg-[#010102] text-[#f7f8f8] border border-[#23252a] rounded-md px-2 py-1 focus:ring-1 focus:ring-[#5e69d1]"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="text-[#27a644] hover:bg-[#27a644]/10 p-1 rounded transition-colors">
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => { setIsEditing(false); setRole(member.role); }} className="text-[#8a8f98] hover:bg-[#141516] p-1 rounded transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#141516] text-[#8a8f98] border border-[#23252a] capitalize font-medium">
              {member.role}
            </span>
            {isAdmin && !isSelf && (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1 text-[#8a8f98] hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/10 rounded transition-colors" title="Change Role">
                  <Shield className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                      removeMutation.mutate();
                    }
                  }} 
                  className="p-1 text-[#8a8f98] hover:text-red-400 hover:bg-red-950/40 rounded transition-colors" 
                  title="Remove Member"
                  disabled={removeMutation.isPending}
                >
                  {removeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InvitationRow({ invite, isAdmin }: { invite: TeamInvitation, isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const isExpired = new Date(invite.expiresAt) < new Date();

  const resendMutation = useMutation({
    mutationFn: () => teamService.resendInvitation(invite.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] });
      alert('Invitation resent successfully');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: () => teamService.revokeInvitation(invite.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] });
    }
  });

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-[#141516]/60 transition-colors">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-xs text-[#f7f8f8]">{invite.email}</span>
          <span className="text-[10px] bg-[#141516] text-[#8a8f98] px-2 py-0.5 rounded-full border border-[#23252a]">Role: {invite.role}</span>
        </div>
        <span className="text-[11px] text-[#8a8f98] flex items-center mt-1">
          Sent: {new Date(invite.createdAt).toLocaleDateString()}
          <span className="mx-1.5">•</span>
          Status: <span className={`ml-1 capitalize ${invite.deliveryStatus === 'failed' ? 'text-red-400' : 'text-[#8a8f98]'}`}>{invite.deliveryStatus}</span>
          {isExpired && <span className="ml-2 text-amber-400 flex items-center text-[10px] font-bold"><ShieldAlert className="w-3 h-3 mr-1"/> Expired</span>}
        </span>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => resendMutation.mutate()} 
            disabled={resendMutation.isPending}
            className="p-1 text-[#8a8f98] hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/10 rounded transition-colors" 
            title="Resend Invitation"
          >
            {resendMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to revoke this invitation?')) {
                revokeMutation.mutate();
              }
            }} 
            disabled={revokeMutation.isPending}
            className="p-1 text-[#8a8f98] hover:text-red-400 hover:bg-red-950/40 rounded transition-colors" 
            title="Revoke Invitation"
          >
            {revokeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MailX className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'viewer'>('viewer');
  const [error, setError] = useState('');

  const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
  });

  const mutation = useMutation({
    mutationFn: () => teamService.inviteMember(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'invitations'] });
      onClose();
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const parsed = inviteSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010102]/80 backdrop-blur-sm">
      <div className="bg-[#0f1011] rounded-xl shadow-none w-full max-w-md border border-[#23252a] overflow-hidden text-[#f7f8f8]">
        <div className="px-6 py-4 border-b border-[#23252a] bg-[#010102] flex justify-between items-center">
          <h2 className="text-sm font-semibold text-[#f7f8f8]">Invite Team Member</h2>
          <button onClick={onClose} className="text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-md text-xs font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8a8f98]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
              placeholder="colleague@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#8a8f98]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'viewer')}
              className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="manager">Manager (Can manage invoices and views team)</option>
              <option value="admin">Admin (Full access)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#23252a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] hover:bg-[#141516] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] rounded-md disabled:opacity-40 flex items-center transition-colors"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

