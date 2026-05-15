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
 * Step 2 — Sender Identity & Optional Reply Forwarding
 */
export function SendGridWizardStep2({ progress, refetch, onNext, onBack }: Props) {
  const s = progress.step2SenderAndMode;
  const [mode, setMode] = useState<'view' | 'edit'>(s.isDone ? 'view' : 'edit');

  // Draft form state — used in edit mode
  const [senderName, setSenderName] = useState(s.senderName || '');
  const [senderEmail, setSenderEmail] = useState(s.senderEmail || '');
  const [enableForwarding, setEnableForwarding] = useState(s.replyMode === 'real_mailbox');
  const [forwardingMailbox, setForwardingMailbox] = useState(s.replyMailboxEmail || s.replyTo || s.senderEmail || '');
  const [otpInput, setOtpInput] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();

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
      const mode = enableForwarding ? 'real_mailbox' : 'webhook_only';
      const target = forwardingMailbox.trim() || senderEmail.trim();
      return settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: enableForwarding ? target : null,
        replyMode: mode,
        replyMailboxEmail: enableForwarding ? target : undefined,
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

      const target = forwardingMailbox.trim() || senderEmail.trim();
      if (!target || !target.includes('@')) throw new Error('Valid Forwarding Mailbox Email is required.');

      // Save sender details so DB has name, email, and target mailbox
      await settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: target,
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

      const target = forwardingMailbox.trim() || senderEmail.trim();
      if (!target || !target.includes('@')) throw new Error('Valid Forwarding Mailbox Email is required.');

      await settingsService.saveSendgridKey({
        apiKey: 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: target,
        replyMode: 'real_mailbox',
        replyMailboxEmail: target,
      });

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
    if (enableForwarding && (!forwardingMailbox.trim() || !forwardingMailbox.includes('@'))) {
      setErrorMsg('Valid Receiving Mailbox Email is required when reply forwarding is enabled.');
      return;
    }

    saveSenderMutation.mutate(undefined, {
      onSuccess: async () => {
        const fresh = await refetch();
        const freshData = fresh as { data?: { sendgridProgress?: SendgridSetupProgress } | SendgridSetupProgress } | undefined;
        const freshProgress = freshData?.data && 'sendgridProgress' in freshData.data ? freshData.data.sendgridProgress : progress;
        if (freshProgress?.step2SenderAndMode?.isDone) {
          setMode('view');
          onNext();
        } else if (enableForwarding) {
          setErrorMsg('Please send 6-digit OTP and click "Verify OTP" to complete mailbox forwarding verification.');
        } else {
          setMode('view');
          onNext();
        }
      },
    });
  };

  if (mode === 'view') {
    // VIEW MODE: static read-only summary from server data
    return (
      <div className="space-y-4 text-[#f7f8f8]">
        <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
          <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
            <Mail className="w-4 h-4 mr-2 text-[#5e6ad2]" />
            Step 2 of 3: Sender Identity & Optional Reply Forwarding
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        </div>

        <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">Sender Name</p>
              <p className="text-[#f7f8f8] font-medium mt-0.5">{s.senderName}</p>
            </div>
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">Sender Email</p>
              <p className="text-[#f7f8f8] font-medium mt-0.5 font-mono">{s.senderEmail}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#23252a] flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">Reply Copy Forwarding</p>
              <p className="text-[#f7f8f8] font-medium mt-0.5">
                {s.replyMode === 'real_mailbox' ? (
                  <span className="font-mono font-bold text-[#5e6ad2]">Enabled → {s.replyMailboxEmail}</span>
                ) : (
                  <span className="text-[#8a8f98]">Disabled (Managed inside Jaktra AI & Timeline)</span>
                )}
              </p>
            </div>
            {s.replyMode === 'real_mailbox' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => {
              setSenderName(s.senderName || '');
              setSenderEmail(s.senderEmail || '');
              setEnableForwarding(s.replyMode === 'real_mailbox');
              setForwardingMailbox(s.replyMailboxEmail || s.replyTo || s.senderEmail || '');
              setOtpInput('');
              setInfoMsg('');
              setErrorMsg('');
              setMode('edit');
            }}
            className="px-3.5 py-1.5 border border-[#23252a] rounded-md text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] text-xs font-medium transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-all shadow-none"
          >
            Continue to Step 3 →
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE
  const targetMailbox = forwardingMailbox.trim() || senderEmail.trim();

  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
          <Mail className="w-4 h-4 mr-2 text-[#5e6ad2]" />
          Step 2 of 3: Sender Identity & Optional Reply Forwarding
        </h4>
        <span className="text-[10px] bg-amber-950/40 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-900/50">
          Step 2 Awaiting Action ⏳
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400 font-medium">{errorMsg}</div>
      )}

      {/* Outbound Sender Fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8a8f98]">Outbound Sender Name</label>
            <input
              type="text"
              autoComplete="off"
              value={senderName}
              onChange={(e) => { setSenderName(e.target.value); setErrorMsg(''); }}
              className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
              placeholder="e.g. Acme Billing"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8a8f98]">Outbound Sender Email</label>
            <input
              type="text"
              inputMode="email"
              autoComplete="new-password"
              data-1p-ignore="true"
              value={senderEmail}
              onChange={(e) => {
                const val = e.target.value;
                setSenderEmail(val);
                setErrorMsg('');
                if (!forwardingMailbox || forwardingMailbox === senderEmail) {
                  setForwardingMailbox(val);
                }
              }}
              className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
              placeholder="billing@acme.com"
            />
          </div>
        </div>
        <p className="text-[11px] text-[#8a8f98] italic">
          * Note: Outbound Sender Email is used for sending outgoing emails and does not require an active receiving inbox.
        </p>
      </div>

      {/* Reply Copy Forwarding Checkbox */}
      <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-lg space-y-3">
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={enableForwarding}
            onChange={(e) => {
              const checked = e.target.checked;
              setEnableForwarding(checked);
              setErrorMsg('');
              if (checked && !forwardingMailbox) {
                setForwardingMailbox(senderEmail);
              }
            }}
            className="mt-0.5 rounded border-[#23252a] bg-[#010102] text-[#5e6ad2] focus:ring-[#5e69d1] h-4 w-4"
          />
          <div>
            <span className="text-xs font-bold text-[#f7f8f8] block">
              Receive customer replies in your personal/company mailbox as well
            </span>
            <span className="text-[11px] text-[#8a8f98] block leading-normal mt-0.5">
              When checked, customer replies logged in Jaktra AI will also be forwarded to your specified receiving mailbox.
            </span>
          </div>
        </label>

        {enableForwarding && (
          <div className="pt-3 border-t border-[#23252a] space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">Receiving Mailbox Email</label>
              <input
                type="text"
                inputMode="email"
                value={forwardingMailbox}
                onChange={(e) => { setForwardingMailbox(e.target.value); setErrorMsg(''); }}
                className="w-full p-2 border border-[#23252a] bg-[#0f1011] rounded-md text-xs font-mono text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                placeholder="support@acme.com"
              />
            </div>

            <div className="p-3 bg-[#0f1011] border border-amber-900/50 rounded-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#f7f8f8] font-medium">
                  Verify ownership of <strong className="font-mono">{targetMailbox || 'your receiving mailbox'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending || !targetMailbox || otpCooldown > 0}
                  className="text-xs bg-[#5e6ad2] hover:bg-[#828fff] text-white px-3 py-1 rounded font-medium transition-colors disabled:opacity-40 shadow-none"
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
                  className="w-36 px-3 py-1.5 border border-[#23252a] bg-[#010102] rounded-md text-xs font-mono text-center tracking-widest text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                />
                <button
                  type="button"
                  onClick={() => verifyOtpMutation.mutate(otpInput)}
                  disabled={verifyOtpMutation.isPending || otpInput.trim().length !== 6}
                  className="px-3.5 py-1.5 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-md text-xs font-medium shrink-0 transition-colors disabled:opacity-40"
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>

            {infoMsg && <p className="text-[11px] text-[#27a644] font-medium bg-[#27a644]/10 p-2 rounded border border-[#27a644]/20">✅ {infoMsg}</p>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-3 flex justify-between items-center border-t border-[#23252a]">
        <button
          type="button"
          onClick={() => {
            if (s.isDone) {
              setSenderName(s.senderName || '');
              setSenderEmail(s.senderEmail || '');
              setEnableForwarding(s.replyMode === 'real_mailbox');
              setForwardingMailbox(s.replyMailboxEmail || s.replyTo || s.senderEmail || '');
              setOtpInput('');
              setInfoMsg('');
              setErrorMsg('');
              setMode('view');
            } else {
              onBack();
            }
          }}
          className="px-3.5 py-1.5 border border-[#23252a] rounded-md text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] text-xs font-medium transition-colors"
        >
          {s.isDone ? '← Cancel Edit' : '← Back to Step 1'}
        </button>
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={saveSenderMutation.isPending || verifyOtpMutation.isPending}
          className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-all shadow-none flex items-center disabled:opacity-40"
        >
          {saveSenderMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          {saveSenderMutation.isPending ? 'Saving...' : 'Save & Continue to Step 3 →'}
        </button>
      </div>
    </div>
  );
}

