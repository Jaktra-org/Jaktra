import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { teamService } from '../services/team';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, MailCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { getErrorMessage } from '../utils/error-utils';

export function AcceptInvitation() {
  const navigate = useNavigate();
  const [token] = useState<string | null>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const tokenMatch = hash.match(/token=([^&]+)/);
    return tokenMatch && tokenMatch[1] ? tokenMatch[1] : null;
  });
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const tokenMatch = hash.match(/token=([^&]+)/);
    return tokenMatch && tokenMatch[1] ? '' : 'Invalid or missing invitation token.';
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [token]);

  const acceptSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  const mutation = useMutation({
    mutationFn: () => teamService.acceptInvitation(token!, name, password),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid invitation token.');
      return;
    }

    const parsed = acceptSchema.safeParse({ name, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    mutation.mutate();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border border-[#23252a] bg-[#0f1011] shadow-2xl">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[#27a644]/10 border border-[#27a644]/30 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-[#27a644]" />
              </div>
              <h2 className="text-xl font-bold text-[#f7f8f8] mb-2 tracking-tight">Invitation Accepted!</h2>
              <p className="text-xs text-[#8a8f98]">Your account has been created successfully.</p>
              <p className="text-xs text-[#8a8f98] mt-6 flex items-center">
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-[#5e6ad2]" />
                Redirecting to login...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-xl flex items-center justify-center shadow-lg">
            <MailCheck className="w-6 h-6 text-[#5e6ad2]" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-[#f7f8f8] tracking-tight">
          Join the Team
        </h2>
        <p className="mt-2 text-center text-xs text-[#8a8f98]">
          Set up your profile to accept the invitation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border border-[#23252a] bg-[#0f1011] shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-400 mr-2 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#d0d6e0] block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!token || mutation.isPending}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#23252a] bg-[#0f1011] rounded-md text-sm text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e69d1] focus:outline-none focus:ring-1 focus:ring-[#5e69d1] disabled:opacity-40"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#d0d6e0] block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  disabled={!token || mutation.isPending}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#23252a] bg-[#0f1011] rounded-md text-sm text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e69d1] focus:outline-none focus:ring-1 focus:ring-[#5e69d1] disabled:opacity-40"
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-[11px] text-[#8a8f98]">Must be at least 8 characters long.</p>
              </div>
            </CardContent>
            <div className="bg-[#141516] border-t border-[#23252a] px-6 py-4 rounded-b-xl">
              <button
                type="submit"
                disabled={!token || mutation.isPending}
                className="w-full flex justify-center items-center py-2 px-4 rounded-md text-xs font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] focus:outline-none focus:ring-1 focus:ring-[#5e69d1] disabled:opacity-40 transition-colors"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

