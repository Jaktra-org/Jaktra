import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { settingsService } from '../../services/settings';
import { getErrorMessage } from '../../utils/error-utils';
import type { ResendSetupProgress } from '../../types/api';

interface Props {
  progress: ResendSetupProgress;
  refetch: () => Promise<unknown>;
  onBack: () => void;
  onComplete: () => void;
}

function extractBaseDomain(senderEmail?: string | null, fallbackDomain?: string | null): string {
  if (senderEmail && senderEmail.includes('@')) {
    const parts = senderEmail.split('@')[1]?.toLowerCase().trim();
    if (parts) return parts;
  }
  if (fallbackDomain && fallbackDomain.includes('.')) {
    const parts = fallbackDomain.toLowerCase().trim().split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
  }
  return '';
}

function getInitialHost(savedDomain?: string | null): string {
  if (!savedDomain) return 'reply';
  const parts = savedDomain.trim().toLowerCase().split('.');
  return parts.length > 2 ? parts[0] : 'reply';
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

/**
 * Step 3 — Inbound Webhook / Receiving Domain Setup for Resend
 */
export function ResendWizardStep3({ progress, refetch, onBack, onComplete }: Props) {
  const w = progress.step3InboundWebhook;
  const s2 = progress.step2SenderAndMode;
  const [mode, setMode] = useState<'view' | 'edit'>(w.isDone ? 'view' : 'edit');

  const baseDomain = extractBaseDomain(s2?.senderEmail, w.inboundDomain);
  const [hostPrefix, setHostPrefix] = useState(() => getInitialHost(w.inboundDomain));
  const [copiedSubdomain, setCopiedSubdomain] = useState(false);
  const [copiedDnsHost, setCopiedDnsHost] = useState(false);
  const [copiedMxTarget, setCopiedMxTarget] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();

  const fullSubdomain = hostPrefix.trim()
    ? (baseDomain ? `${hostPrefix.trim()}.${baseDomain}` : hostPrefix.trim())
    : (baseDomain ? `reply.${baseDomain}` : 'reply.yourdomain.com');

  const copy = (text: string, setter: (v: boolean) => void) => {
    copyToClipboard(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const verifyWebhookMutation = useMutation({
    mutationFn: () => {
      const domain = fullSubdomain.trim().toLowerCase();
      if (!domain || domain.split('.').length < 3) {
        throw new Error(`Please provide a valid subdomain (e.g. reply.${baseDomain || 'yourdomain.com'}).`);
      }
      return settingsService.verifyResendInbound({ inboundDomain: domain });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      await refetch();
      setInfoMsg(data.message);
      setErrorMsg('');
      setMode('view');
      onComplete();
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
      setInfoMsg('');
    },
  });

  if (mode === 'view') {
    return (
      <div className="space-y-4 text-[#f7f8f8]">
        <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
          <h4 className="text-xs font-bold text-[#f7f8f8]">Inbound Domain & Webhook</h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            Verified
          </span>
        </div>

        <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">Subdomain</p>
              <p className="text-[#f7f8f8] font-mono font-medium mt-0.5">{w.inboundDomain}</p>
            </div>
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">MX Host</p>
              <p className="text-[#f7f8f8] font-mono font-medium mt-0.5">{getInitialHost(w.inboundDomain)}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#23252a]">
            <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider mb-1">Webhook URL</p>
            <p className="text-[#d0d6e0] font-mono text-[10px] break-all">{w.webhookUrl}</p>
          </div>
          <p className="text-[11px] text-[#27a644] font-semibold bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl px-2.5 py-1.5">
            DNS MX record verified and inbound reply receiving active.
          </p>
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
                setErrorMsg('');
                setInfoMsg('');
                setMode('edit');
              }}
              className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
            >
              Reconfigure Domain
            </button>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE
  const mxTarget = w.expectedMxTarget || 'inbound-smtp.ap-northeast-1.amazonaws.com';
  const mxPriority = w.expectedPriority ?? 10;

  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8]">Inbound Domain & Webhook Setup</h4>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium space-y-1">
          <p className="font-bold">Verification Failed:</p>
          <p className="whitespace-pre-wrap leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {infoMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 font-medium">
          {infoMsg}
        </div>
      )}

      {/* Host Prefix Input */}
      <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-2">
        <label className="text-xs font-bold text-[#f7f8f8] block">
          Subdomain Host Name
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={hostPrefix}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
              setHostPrefix(val);
              setErrorMsg('');
            }}
            placeholder="reply"
            className="w-36 p-2 border border-[#23252a] bg-[#0f1011] rounded-lg text-xs text-[#f7f8f8] font-mono focus:border-[#40434d] focus:outline-none"
          />
          <span className="text-xs font-mono text-[#8a8f98]">
            .{baseDomain || 'yourdomain.com'}
          </span>
        </div>
      </div>

      {/* Step 1: Add Subdomain in Resend */}
      <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#f7f8f8]">1. Add Subdomain in Resend</p>
          <a
            href="https://resend.com/domains"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#f7f8f8] hover:underline inline-flex items-center gap-1 font-medium"
          >
            Open Resend Domains <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-[#8a8f98]">
          Under <strong>Domains</strong>, add this subdomain and enable <strong>Receiving</strong>:
        </p>
        <div className="flex items-center gap-2 p-2 bg-[#0f1011] border border-[#23252a] rounded-lg">
          <span className="text-[11px] font-mono text-[#f7f8f8] flex-1 font-bold">
            {fullSubdomain}
          </span>
          <button
            type="button"
            onClick={() => copy(fullSubdomain, setCopiedSubdomain)}
            className="px-2 py-1 text-[11px] font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-md transition-all cursor-pointer flex items-center gap-1"
          >
            {copiedSubdomain ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3 text-[#8a8f98]" />}
            {copiedSubdomain ? 'Copied' : 'Copy Subdomain'}
          </button>
        </div>
      </div>

      {/* Step 2: Add DNS MX Record */}
      <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-2.5">
        <p className="text-xs font-bold text-[#f7f8f8]">2. Add DNS MX Record at DNS Provider</p>
        <p className="text-[11px] text-[#8a8f98]">
          Add this MX record in your DNS provider (e.g. GoDaddy, Cloudflare):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border border-[#23252a] bg-[#0f1011] rounded-lg">
            <thead>
              <tr className="bg-[#141516] text-[#8a8f98] border-b border-[#23252a] text-[10px]">
                <th className="px-2.5 py-1.5 font-semibold">TYPE</th>
                <th className="px-2.5 py-1.5 font-semibold">HOST</th>
                <th className="px-2.5 py-1.5 font-semibold">VALUE / TARGET</th>
                <th className="px-2.5 py-1.5 font-semibold">PRIORITY</th>
                <th className="px-2.5 py-1.5 text-right font-semibold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]/40 text-[11px]">
              <tr>
                <td className="px-2.5 py-2 text-[#f7f8f8]">MX</td>
                <td className="px-2.5 py-2 font-bold text-[#f7f8f8]">{hostPrefix || 'reply'}</td>
                <td className="px-2.5 py-2 text-[#d0d6e0]">{mxTarget}</td>
                <td className="px-2.5 py-2 text-[#8a8f98]">{mxPriority}</td>
                <td className="px-2.5 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      onClick={() => copy(hostPrefix || 'reply', setCopiedDnsHost)}
                      className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer"
                    >
                      {copiedDnsHost ? 'Copied Host' : 'Copy Host'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(mxTarget, setCopiedMxTarget)}
                      className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer"
                    >
                      {copiedMxTarget ? 'Copied Target' : 'Copy Target'}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 3: Configure Webhook */}
      <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#f7f8f8]">3. Configure Webhook in Resend</p>
          <a
            href="https://resend.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#f7f8f8] hover:underline inline-flex items-center gap-1 font-medium"
          >
            Open Resend Webhooks <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-[#8a8f98]">
          Under <strong>Webhooks</strong>, add this URL for event <code className="text-[#d0d6e0] font-mono">email.received</code>:
        </p>
        <div className="flex items-center gap-2 p-2 bg-[#0f1011] border border-[#23252a] rounded-lg">
          <span className="text-[11px] font-mono text-[#8a8f98] flex-1 break-all select-all">
            {w.webhookUrl}
          </span>
          <button
            type="button"
            onClick={() => copy(w.webhookUrl, setCopiedWebhook)}
            className="px-2 py-1 text-[11px] font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-md transition-all cursor-pointer flex items-center gap-1"
          >
            {copiedWebhook ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3 text-[#8a8f98]" />}
            {copiedWebhook ? 'Copied' : 'Copy'}
          </button>
        </div>
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
          {w.isDone && (
            <button
              type="button"
              onClick={() => {
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
            onClick={() => verifyWebhookMutation.mutate()}
            disabled={verifyWebhookMutation.isPending || !hostPrefix.trim()}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center disabled:opacity-40 cursor-pointer"
          >
            {verifyWebhookMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {verifyWebhookMutation.isPending ? 'Verifying DNS...' : 'Verify DNS & Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
