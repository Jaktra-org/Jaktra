import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../../services/team';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Loader2, UserPlus, ShieldAlert, MailX, Check, X, Shield, RefreshCw, Trash2, Mail, User } from 'lucide-react';
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
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
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
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#23252a] pb-4">
          <div>
            <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
              <User className="w-4 h-4 mr-2 text-[#8a8f98]" />
              Active Members
            </CardTitle>
            <CardDescription className="text-xs text-[#8a8f98]">Manage your team members and their permission roles.</CardDescription>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-bold transition-all inline-flex items-center cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Invite Member
            </button>
          )}
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          {loadingMembers ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" /></div>
          ) : members?.length === 0 ? (
            <div className="p-8 border border-[#23252a] rounded-xl bg-[#010102] text-center">
              <p className="text-xs text-[#8a8f98]">No active team members found.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {members?.map(member => (
                <MemberRow key={member.id} member={member} isAdmin={isAdmin} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isManagerOrAdmin && invitations && invitations.length > 0 && (
        <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
          <CardHeader className="border-b border-[#23252a] pb-4">
            <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
              <Mail className="w-4 h-4 mr-2 text-[#8a8f98]" />
              Pending Invitations
            </CardTitle>
            <CardDescription className="text-xs text-[#8a8f98]">Invitations that haven't been accepted yet.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-2.5">
            {invitations.map(invite => (
              <InvitationRow key={invite.id} invite={invite} isAdmin={isAdmin} />
            ))}
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

  const initials = member.name
    ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="p-3.5 border border-[#23252a] rounded-xl bg-[#010102] hover:border-[#34343a] transition-all flex items-center justify-between gap-4">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#18191c] border border-[#23252a] text-[#f7f8f8] font-bold text-xs flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs text-[#f7f8f8] truncate">{member.name}</span>
            {isSelf && (
              <span className="text-[10px] bg-[#18191c] text-[#f7f8f8] border border-[#34343a] px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                You
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8a8f98] truncate block mt-0.5">{member.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'viewer')}
              className="text-xs bg-[#0f1011] text-[#f7f8f8] border border-[#23252a] rounded-xl px-2.5 py-1.5 focus:border-[#40434d] focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="text-[#27a644] hover:bg-[#27a644]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Save role"
            >
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setIsEditing(false); setRole(member.role); }}
              className="text-[#8a8f98] hover:bg-[#18191c] p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-[11px] px-3 py-1 rounded-xl bg-[#18191c] text-[#8a8f98] border border-[#34343a] capitalize font-medium">
              {member.role}
            </span>
            {isAdmin && !isSelf && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#18191c] border border-transparent hover:border-[#34343a] rounded-lg transition-all cursor-pointer"
                  title="Change Role"
                >
                  <Shield className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
                      removeMutation.mutate();
                    }
                  }} 
                  className="p-1.5 text-[#8a8f98] hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg transition-all cursor-pointer" 
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
    <div className="p-3.5 border border-[#23252a] rounded-xl bg-[#010102] hover:border-[#34343a] transition-all flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-xs text-[#f7f8f8]">{invite.email}</span>
          <span className="text-[10px] bg-[#18191c] text-[#8a8f98] px-2 py-0.5 rounded-full border border-[#34343a]">Role: {invite.role}</span>
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
            className="p-1.5 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#18191c] border border-transparent hover:border-[#34343a] rounded-lg transition-all cursor-pointer" 
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
            className="p-1.5 text-[#8a8f98] hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg transition-all cursor-pointer" 
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
  const [emailError, setEmailError] = useState(false);

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
      setEmailError(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError(false);
    
    const parsed = inviteSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setEmailError(true);
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010102]/80 backdrop-blur-sm">
      <div className="bg-[#0f1011] rounded-2xl shadow-2xl w-full max-w-md border border-[#23252a] overflow-hidden text-[#f7f8f8]">
        <div className="px-6 py-4 border-b border-[#23252a] bg-[#010102] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[#f7f8f8]">Invite Team Member</h2>
          <button onClick={onClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
              }}
              className={`w-full p-2.5 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                emailError
                  ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                  : 'border-[#23252a] bg-[#010102] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
              }`}
              placeholder="colleague@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98]">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'manager' | 'viewer')}
              className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="manager">Manager (Can manage invoices and view team)</option>
              <option value="admin">Admin (Full access)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#23252a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center cursor-pointer shadow-xs"
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
