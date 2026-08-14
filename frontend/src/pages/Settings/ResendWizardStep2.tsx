import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settings';
import { getErrorMessage } from '../../utils/error-utils';
import type { ResendSetupProgress } from '../../types/api';

interface Props {
  progress: ResendSetupProgress;
  refetch: () => Promise<unknown>;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Sender Identity & Optional Reply Forwarding for Resend
 */
export function ResendWizardStep2({ progress, refetch, onNext, onBack }: Props) {
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

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => {
      setOtpCooldown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const startCooldown = () => {
    setOtpCooldown(60);
  };

  const saveSenderMutation = useMutation({
    mutationFn: () => {
      const mode = enableForwarding ? 'real_mailbox' : 'webhook_only';
      const target = forwardingMailbox.trim() || senderEmail.trim();
      return settingsService.saveResendKey({
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

      await settingsService.saveResendKey({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: target,
        replyMode: 'real_mailbox',
        replyMailboxEmail: target,
      });

      return settingsService.sendResendReplyMailboxOtp({ replyMailboxEmail: target });
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

      await settingsService.saveResendKey({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: target,
        replyMode: 'real_mailbox',
        replyMailboxEmail: target,
      });

      return settingsService.verifyResendReplyMailboxOtp(otp);
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
        const freshData = fresh as { data?: { resendProgress?: ResendSetupProgress } | ResendSetupProgress } | undefined;
        const freshProgress = freshData?.data && 'resendProgress' in freshData.data ? freshData.data.resendProgress : progress;
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
    return (
      <div className="space-y-4 text-[#f7f8f8]">
        <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
          <h4 className="text-xs font-bold text-[#f7f8f8]">
            Outbound Sender & Forwarding
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            Completed
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
                  <span className="font-mono font-bold text-[#f7f8f8]">Enabled → {s.replyMailboxEmail}</span>
                ) : (
                  <span className="text-[#8a8f98]">Disabled (Managed inside Jaktra AI & Timeline)</span>
                )}
              </p>
            </div>
            {s.replyMode === 'real_mailbox' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#8a8f98] hover:text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
            >
              Back
            </button>
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
              className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
            >
              Edit
            </button>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            Next
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
        <h4 className="text-xs font-bold text-[#f7f8f8]">
          Outbound Sender & Forwarding
        </h4>
      </div>

      <p className="text-xs text-[#8a8f98]">
        Configure the identity customers see when receiving transactional and autopilot emails from Resend.
      </p>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 font-medium">
          {infoMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98]">
            Sender Display Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => { setSenderName(e.target.value); setErrorMsg(''); }}
            placeholder="Acme Billing"
            className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98]">
            Sender Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => { setSenderEmail(e.target.value); setErrorMsg(''); }}
            placeholder="billing@acme.com"
            className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Reply Forwarding Toggle */}
      <div className="p-3.5 bg-[#0f1011] border border-[#23252a] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#f7f8f8]">Forward Customer Replies to Real Mailbox</p>
            <p className="text-[11px] text-[#8a8f98] mt-0.5">
              Send a copy of debtor replies directly to your team's support inbox in addition to Jaktra AI timeline.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableForwarding}
              onChange={(e) => {
                setEnableForwarding(e.target.checked);
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#23252a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#27a644]"></div>
          </label>
        </div>

        {enableForwarding && (
          <div className="pt-3 border-t border-[#23252a] space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">
                Receiving Mailbox Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={forwardingMailbox}
                onChange={(e) => { setForwardingMailbox(e.target.value); setErrorMsg(''); }}
                placeholder={senderEmail || 'support@acme.com'}
                className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none font-mono"
              />
            </div>

            {/* OTP Verification Block */}
            <div className="p-3 bg-[#010102] border border-[#23252a] rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#8a8f98]">Mailbox Ownership Verification</span>
                {s.replyMailboxVerified && s.replyMailboxEmail === targetMailbox ? (
                  <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2 py-0.5 rounded-full border border-[#27a644]/20">
                    Mailbox Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendOtpMutation.mutate()}
                    disabled={sendOtpMutation.isPending || otpCooldown > 0}
                    className="px-2.5 py-1 text-[11px] font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-lg disabled:opacity-40 transition-all cursor-pointer flex items-center"
                  >
                    {sendOtpMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send Verification OTP'}
                  </button>
                )}
              </div>

              {(!s.replyMailboxVerified || s.replyMailboxEmail !== targetMailbox) && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-36 p-2 border border-[#23252a] bg-[#0f1011] rounded-lg text-xs font-mono text-center tracking-widest text-[#f7f8f8] focus:border-[#40434d] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => verifyOtpMutation.mutate(otpInput)}
                    disabled={verifyOtpMutation.isPending || otpInput.length !== 6}
                    className="px-3 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-lg text-xs font-semibold disabled:opacity-40 transition-all flex items-center cursor-pointer"
                  >
                    {verifyOtpMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Verify OTP
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#8a8f98] hover:text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
        >
          Back
        </button>
        <div className="flex items-center gap-2">
          {s.isDone && (
            <button
              type="button"
              onClick={() => {
                setSenderName(s.senderName || '');
                setSenderEmail(s.senderEmail || '');
                setEnableForwarding(s.replyMode === 'real_mailbox');
                setForwardingMailbox(s.replyMailboxEmail || s.replyTo || s.senderEmail || '');
                setOtpInput('');
                setErrorMsg('');
                setInfoMsg('');
                setMode('view');
              }}
              className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={saveSenderMutation.isPending}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center disabled:opacity-40 cursor-pointer"
          >
            {saveSenderMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {saveSenderMutation.isPending ? 'Saving...' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
