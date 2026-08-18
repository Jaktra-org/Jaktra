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

function getDnsHostPrefix(fullDomain: string): string {
  const trimmed = fullDomain.trim().toLowerCase();
  if (!trimmed) return 'reply';
  const parts = trimmed.split('.');
  return parts.length > 2 ? parts.slice(0, parts.length - 2).join('.') : trimmed;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => { });
}

/**
 * Step 3 — Inbound Webhook / Receiving Domain Setup for Resend
 */
export function ResendWizardStep3({ progress, refetch, onBack, onComplete }: Props) {
  const w = progress.step3InboundWebhook;
  const [mode, setMode] = useState<'view' | 'edit'>(w.isDone ? 'view' : 'edit');

  const defaultDomain = w.inboundDomain || '';
  const [domainInput, setDomainInput] = useState(defaultDomain);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDnsHost, setCopiedDnsHost] = useState(false);
  const [copiedMxTarget, setCopiedMxTarget] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const queryClient = useQueryClient();

  const copy = (text: string, setter: (v: boolean) => void) => {
    copyToClipboard(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const verifyWebhookMutation = useMutation({
    mutationFn: () => {
      const domain = domainInput.trim().toLowerCase();
      if (!domain) throw new Error('Inbound reply domain is required.');
      if (domain.includes('@')) throw new Error('Enter a domain name (e.g. reply.yourdomain.com), not an email address.');
      if (!domain.includes('.')) throw new Error(`"${domain}" is not a full domain name. Enter the full domain (e.g. ${domain}.yourdomain.com).`);
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
          <h4 className="text-xs font-bold text-[#f7f8f8]">
            Inbound Domain & Webhook
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            Verified
          </span>
        </div>

        <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">Inbound Reply Domain</p>
              <p className="text-[#f7f8f8] font-mono font-medium mt-0.5">{w.inboundDomain}</p>
            </div>
            <div>
              <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider">MX Host Prefix</p>
              <p className="text-[#f7f8f8] font-mono font-medium mt-0.5">{getDnsHostPrefix(w.inboundDomain || '')}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-[#23252a]">
            <p className="font-semibold text-[#8a8f98] text-[10px] uppercase tracking-wider mb-1">Webhook URL</p>
            <p className="text-[#d0d6e0] font-mono text-[10px] break-all">{w.webhookUrl}</p>
          </div>
          <p className="text-[11px] text-[#27a644] font-semibold bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl px-2.5 py-1.5">
            DNS MX record verified and inbound webhook active.
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
                setDomainInput(w.inboundDomain || '');
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
  const dnsPrefix = getDnsHostPrefix(domainInput || 'reply');
  const mxTarget = 'inbound-smtp.us-east-1.amazonaws.com';

  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8]">
          Inbound Domain & Webhook Setup
        </h4>
      </div>

      <p className="text-xs text-[#8a8f98]">
        Configure a dedicated subdomain for inbound reply receiving. Debtor replies to collection emails will be parsed and registered automatically in Jaktra.
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

      {/* Domain Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#8a8f98]">
          Inbound Receiving Domain <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={domainInput}
          onChange={(e) => { setDomainInput(e.target.value); setErrorMsg(''); }}
          placeholder="reply.acme.com"
          className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none font-mono"
        />
      </div>

      {/* DNS Instructions Table */}
      <div className="p-3.5 bg-[#0f1011] border border-[#23252a] rounded-xl space-y-2.5">
        <p className="text-xs font-semibold text-[#f7f8f8]">1. Add DNS MX Record at your DNS provider</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#8a8f98] border-b border-[#23252a] text-[10px]">
                <th className="pb-1.5 font-semibold">TYPE</th>
                <th className="pb-1.5 font-semibold">HOST</th>
                <th className="pb-1.5 font-semibold">VALUE / TARGET</th>
                <th className="pb-1.5 font-semibold">PRIORITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]/40 text-[11px]">
              <tr>
                <td className="py-2 text-[#f7f8f8]">MX</td>
                <td className="py-2 text-[#d0d6e0]">
                  <span className="inline-flex items-center gap-1">
                    {dnsPrefix}
                    <button
                      type="button"
                      onClick={() => copy(dnsPrefix, setCopiedDnsHost)}
                      className="text-[#8a8f98] hover:text-[#f7f8f8] cursor-pointer"
                    >
                      {copiedDnsHost ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                </td>
                <td className="py-2 text-[#d0d6e0]">
                  <span className="inline-flex items-center gap-1">
                    {mxTarget}
                    <button
                      type="button"
                      onClick={() => copy(mxTarget, setCopiedMxTarget)}
                      className="text-[#8a8f98] hover:text-[#f7f8f8] cursor-pointer"
                    >
                      {copiedMxTarget ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                </td>
                <td className="py-2 text-[#8a8f98]">10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhook Configuration in Resend Dashboard */}
      <div className="p-3.5 bg-[#0f1011] border border-[#23252a] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#f7f8f8]">2. Configure Webhook in Resend</p>
          <a
            href="https://resend.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#f7f8f8] hover:underline inline-flex items-center gap-1"
          >
            Open Resend Webhooks <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-[#8a8f98]">
          In your Resend dashboard, add a webhook with event <code className="text-[#d0d6e0] font-mono">email.received</code> pointing to your endpoint URL:
        </p>
        <div className="flex items-center gap-2 p-2 bg-[#010102] border border-[#23252a] rounded-lg">
          <span className="text-[11px] font-mono text-[#8a8f98] flex-1 break-all select-all">
            {w.webhookUrl}
          </span>
          <button
            type="button"
            onClick={() => copy(w.webhookUrl, setCopiedWebhook)}
            className="px-2 py-1 text-[11px] font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-md transition-all cursor-pointer flex items-center gap-1"
          >
            {copiedWebhook ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
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
                setDomainInput(w.inboundDomain || '');
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
            disabled={verifyWebhookMutation.isPending || !domainInput.trim()}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center disabled:opacity-40 cursor-pointer"
          >
            {verifyWebhookMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {verifyWebhookMutation.isPending ? 'Verifying MX & Webhook...' : 'Verify DNS & Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
