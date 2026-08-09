import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { settingsService } from '../../services/settings';
import { getErrorMessage } from '../../utils/error-utils';
import type { SendgridSetupProgress } from '../../types/api';

interface Props {
  progress: SendgridSetupProgress;
  refetch: () => Promise<unknown>;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Sender Identity & Reply Mode
 *
 * VIEW MODE: renders only static read-only text from progress.step2SenderAndMode.
 * No <input> elements. No verification comparisons. The "Verified" badge appears
 * only here, sourced purely from server data.
 *
 * EDIT MODE: a fully local draft form. The OTP flow runs here.
 * No "Verified" badge is ever shown inside the form — it is just a draft editor.
 * On OTP verification success: await refetch() -> setMode('view') -> onNext().
 *
 * MODE SAFETY: mode is seeded from progress.step2SenderAndMode.isDone at mount.
 * Safe because parent blocks render until sendgridProgress has resolved.
 * Component fully unmounts on modal close (parent uses `if (!isOpen) return null`),
 * so stale mode state cannot persist across close/reopen.
 *
 * CANCEL SAFETY: clicking Edit then closing modal without saving does NOT affect
 * backend state. Only successful mutation calls touch the backend.
 */
export function SendGridWizardStep2({ progress, refetch, onNext, onBack }: Props) {
  const s = progress.step2SenderAndMode;
  const [mode, setMode] = useState<'view' | 'edit'>(s.isDone ? 'view' : 'edit');

  // Draft form state — only used in edit mode
  const [senderName, setSenderName] = useState(s.senderName || '');
  const [senderEmail, setSenderEmail] = useState(s.senderEmail || '');
  const [replyTo, setReplyTo] = useState(s.replyTo || '');
  const [replyMode, setReplyMode] = useState<'real_mailbox' | 'webhook_only'>(s.replyMode || 'webhook_only');
  const [inboundDomainDerived, setInboundDomainDerived] = useState(
    s.senderEmail?.includes('@') ? `reply.${s.senderEmail.split('@')[1]}` : ''
  );
  const [otpInput, setOtpInput] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();

  // OTP cooldown timer
  const startCooldown = () => {
    setOtpCooldown(60);
    const tick = setInterval(() => {
      setOtpCooldown(prev => {
        if (prev <= 1) { clearInterval(tick); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const saveSenderMutation = useMutation({
    mutationFn: () => {
      const targetMailbox = replyTo.trim() || senderEmail.trim();
      return settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: replyTo.trim() || null,
        replyMode,
        replyMailboxEmail: replyMode === 'real_mailbox' ? targetMailbox : undefined,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await refetch();
      setErrorMsg('');
      setInfoMsg('Sender details saved.');
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      if (!senderName.trim()) throw new Error('Outbound Sender Name is required.');
      if (!senderEmail.trim() || !senderEmail.includes('@')) throw new Error('Valid Outbound Sender Email is required.');

      const target = replyTo.trim() || senderEmail.trim();
      // First save sender details so DB has name & email
      await settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: replyTo.trim() || null,
        replyMode: 'real_mailbox',
        replyMailboxEmail: target,
      });

      return settingsService.sendReplyMailboxOtp({ replyMailboxEmail: target });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await refetch();
      setInfoMsg(data.message);
      setErrorMsg('');
      startCooldown();
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
      setInfoMsg('');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!senderName.trim()) throw new Error('Outbound Sender Name is required.');
      if (!senderEmail.trim() || !senderEmail.includes('@')) throw new Error('Valid Outbound Sender Email is required.');

      const target = replyTo.trim() || senderEmail.trim();
      // 1. Save sender details to DB first!
      await settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: replyTo.trim() || null,
        replyMode: 'real_mailbox',
        replyMailboxEmail: target,
      });

      // 2. Verify OTP
      return settingsService.verifyReplyMailboxOtp(otp);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await refetch();
      setOtpInput('');
      setInfoMsg('');
      setErrorMsg('');
      setMode('view');
      onNext();
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const handleSaveAndContinue = () => {
    if (!senderName.trim()) { setErrorMsg('Outbound Sender Name is required.'); return; }
    if (!senderEmail.trim() || !senderEmail.includes('@')) { setErrorMsg('Valid Outbound Sender Email is required.'); return; }

    saveSenderMutation.mutate(undefined, {
      onSuccess: async () => {
        const fresh = await refetch();
        const freshData = fresh as { data?: { sendgridProgress?: SendgridSetupProgress } | SendgridSetupProgress } | undefined;
        const freshProgress = freshData?.data && 'sendgridProgress' in freshData.data ? freshData.data.sendgridProgress : progress;
        if (freshProgress?.step2SenderAndMode?.isDone) {
          setMode('view');
          onNext();
        } else if (replyMode === 'real_mailbox') {
          setErrorMsg('Please send 6-digit OTP and click "Verify OTP" to complete Step 2 verification.');
        } else {
          setMode('view');
          onNext();
        }
      },
    });
  };

  if (mode === 'view') {
    // VIEW MODE: static read-only text only — sourced entirely from server data
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <Mail className="w-4 h-4 mr-2 text-blue-600" />
            Step 2 of 3: Sender Identity & Reply Mode
          </h4>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Sender Name</p>
              <p className="text-slate-900 font-medium mt-0.5">{s.senderName}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Sender Email</p>
              <p className="text-slate-900 font-medium mt-0.5 font-mono">{s.senderEmail}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Reply Mode</p>
              <p className="text-slate-900 font-medium mt-0.5">
                {s.replyMode === 'real_mailbox' ? 'Mode 1: Real Mailbox' : 'Mode 2: Virtual Sub-Address'}
              </p>
            </div>
            {s.replyTo && (
              <div>
                <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Reply-To Override</p>
                <p className="text-slate-900 font-medium mt-0.5 font-mono">{s.replyTo}</p>
              </div>
            )}
          </div>

          {s.replyMode === 'real_mailbox' && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Reply Mailbox</p>
                <p className="text-slate-900 font-mono font-medium mt-0.5">{s.replyMailboxEmail}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => {
              // Reset draft to current server values before entering edit
              setSenderName(s.senderName || '');
              setSenderEmail(s.senderEmail || '');
              setReplyTo(s.replyTo || '');
              setReplyMode(s.replyMode || 'webhook_only');
              setOtpInput('');
              setInfoMsg('');
              setErrorMsg('');
              setMode('edit');
            }}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm"
          >
            Continue to Step 3 →
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE — pure draft form, no "Verified" badge, no state comparisons
  const targetMailbox = replyTo.trim() || senderEmail.trim();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="text-sm font-bold text-slate-900 flex items-center">
          <Mail className="w-4 h-4 mr-2 text-blue-600" />
          Step 2 of 3: Sender Identity & Reply Mode
        </h4>
        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
          Step 2 Awaiting Action ⏳
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">{errorMsg}</div>
      )}

      {/* Reply Mode Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">Select Reply Handling Mode (Mandatory)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setReplyMode('real_mailbox')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${replyMode === 'real_mailbox' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <input type="radio" name="replyMode" checked={replyMode === 'real_mailbox'} onChange={() => setReplyMode('real_mailbox')} className="text-blue-600" />
              <span className="font-semibold text-slate-900 text-xs">Mode 1: Real Mailbox</span>
            </div>
            <p className="text-[11px] text-slate-600 pl-5 leading-tight">Replies forwarded to your verified mailbox. Requires 6-digit OTP verification.</p>
          </div>
          <div
            onClick={() => setReplyMode('webhook_only')}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${replyMode === 'webhook_only' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <input type="radio" name="replyMode" checked={replyMode === 'webhook_only'} onChange={() => setReplyMode('webhook_only')} className="text-blue-600" />
              <span className="font-semibold text-slate-900 text-xs">Mode 2: Virtual Sub-Address</span>
            </div>
            <p className="text-[11px] text-slate-600 pl-5 leading-tight">Replies flow directly into Jaktra AI via sub-addressing. No OTP required.</p>
          </div>
        </div>
      </div>

      {/* Sender fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Outbound Sender Name</label>
            <input
              type="text"
              autoComplete="off"
              value={senderName}
              onChange={(e) => { setSenderName(e.target.value); setErrorMsg(''); }}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="e.g. Acme Billing"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Outbound Sender Email</label>
            <input
              type="text"
              inputMode="email"
              autoComplete="new-password"
              data-1p-ignore="true"
              value={senderEmail}
              onChange={(e) => {
                const val = e.target.value;
                const prev = senderEmail;
                setSenderEmail(val);
                setErrorMsg('');
                // Keep inbound domain in sync if it was derived from old email
                const oldDerived = prev.includes('@') ? `reply.${prev.split('@')[1]}` : '';
                const newDerived = val.includes('@') ? `reply.${val.split('@')[1]}` : '';
                if (!inboundDomainDerived || inboundDomainDerived === oldDerived) {
                  setInboundDomainDerived(newDerived);
                }
              }}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="billing@acme.com"
            />
          </div>
        </div>

        {replyMode === 'real_mailbox' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Reply-To Email (Optional Override)</label>
              <span className="text-[10px] text-slate-400">Leave blank to use Outbound Sender Email</span>
            </div>
            <input
              type="text"
              inputMode="email"
              autoComplete="new-password"
              data-1p-ignore="true"
              value={replyTo}
              onChange={(e) => { setReplyTo(e.target.value); setErrorMsg(''); }}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder={senderEmail ? `Defaults to ${senderEmail}` : 'support@acme.com'}
            />
          </div>
        )}
      </div>

      {/* Mode 2 info */}
      {replyMode === 'webhook_only' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 font-medium">
          ✓ <strong>Mode 2 Selected:</strong> No mailbox or OTP verification required.
        </div>
      )}

      {/* Mode 1 OTP section — ONLY shows the form, never a "Verified" badge */}
      {replyMode === 'real_mailbox' && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
              Target Mailbox for OTP & Reply Forwarding:
            </label>
            <p className="text-xs font-mono font-bold text-blue-700">
              {targetMailbox || '(Enter Outbound Sender Email above)'}
            </p>
            <p className="text-[10px] text-slate-500">{replyTo.trim() ? 'Using Reply-To override' : 'Using Outbound Sender Email'}</p>
          </div>

          <div className="p-3 bg-white border border-amber-200 rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-800 font-medium">
                Verify ownership of <strong className="font-mono">{targetMailbox || 'your mailbox'}</strong>
              </span>
              <button
                type="button"
                onClick={() => sendOtpMutation.mutate()}
                disabled={sendOtpMutation.isPending || !targetMailbox || otpCooldown > 0}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {sendOtpMutation.isPending ? 'Sending...' : otpCooldown > 0 ? `Resend OTP (${otpCooldown}s)` : 'Send 6-Digit OTP'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="6-digit OTP"
                className="w-36 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => verifyOtpMutation.mutate(otpInput)}
                disabled={verifyOtpMutation.isPending || otpInput.trim().length !== 6}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>

          {infoMsg && <p className="text-[11px] text-emerald-600 font-medium">{infoMsg}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="pt-4 flex justify-between items-center border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            if (s.isDone) {
              // Cancel edit — revert to view without touching backend
              setSenderName(s.senderName || '');
              setSenderEmail(s.senderEmail || '');
              setReplyTo(s.replyTo || '');
              setReplyMode(s.replyMode || 'webhook_only');
              setOtpInput('');
              setInfoMsg('');
              setErrorMsg('');
              setMode('view');
            } else {
              onBack();
            }
          }}
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
        >
          {s.isDone ? '← Cancel Edit' : '← Back to Step 1'}
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveSenderMutation.isPending || verifyOtpMutation.isPending}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center disabled:opacity-50"
        >
          {saveSenderMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {saveSenderMutation.isPending ? 'Saving...' : 'Save & Continue to Step 3 →'}
        </button>
      </div>
    </div>
  );
}
