import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { settingsService } from '../../services/settings';
import { getErrorMessage } from '../../utils/error-utils';
import type { SendgridSetupProgress } from '../../types/api';

interface Props {
  progress: SendgridSetupProgress;
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

function formatTruncatedUrl(url: string, startLen = 26, endLen = 12): string {
  if (!url) return '';
  if (url.length <= startLen + endLen + 3) return url;
  return `${url.slice(0, startLen)}...${url.slice(-endLen)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => { });
}

/**
 * Step 3 — Inbound Webhook / Reply Domain
 *
 * VIEW MODE: renders only static read-only text from server data.
 * Shows domain + "Verified". No editable inputs. No state comparisons.
 *
 * EDIT MODE: domain input + DNS table + Verify button.
 * On verification success: await refetch() -> setMode('view') -> onComplete().
 *
 * MODE SAFETY: mode is seeded from progress.step3InboundWebhook.isDone at mount.
 * Safe because parent blocks render until sendgridProgress has resolved.
 * Fully unmounts on modal close — no stale mode state persists.
 */
export function SendGridWizardStep3({ progress, refetch, onBack, onComplete }: Props) {
  const w = progress.step3InboundWebhook;
  const [mode, setMode] = useState<'view' | 'edit'>(w.isDone ? 'view' : 'edit');

  const defaultDomain = w.inboundDomain || '';
  const [domainInput, setDomainInput] = useState(defaultDomain);
  const [domainErr, setDomainErr] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedDnsHost, setCopiedDnsHost] = useState(false);
  const [copiedMxTarget, setCopiedMxTarget] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
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
      if (domain.includes('@')) throw new Error('Enter a domain name (e.g. invoice-reply.yourdomain.com), not an email address.');
      if (!domain.includes('.')) throw new Error(`"${domain}" is not a full domain name. Enter the full domain (e.g. ${domain}.yourdomain.com).`);
      return settingsService.verifyInboundWebhook({ inboundDomain: domain });
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

  const rotateTokenMutation = useMutation({
    mutationFn: () => settingsService.rotateWebhookToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      refetch();
      setInfoMsg('Webhook token rotated. Update SendGrid Inbound Parse with the new URL, then click Verify.');
      setErrorMsg('');
    },
  });

  if (mode === 'view') {
    // VIEW MODE: static read-only text only
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
                setDomainErr('');
                setInfoMsg('');
                setErrorMsg('');
                setMode('edit');
              }}
              className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
            >
              Edit / Re-verify
            </button>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            Setup Complete & Connected
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE: full setup form
  const hasDomain = Boolean(domainInput.trim());
  const hostPrefix = hasDomain ? getDnsHostPrefix(domainInput) : '';

  return (
    <div className="space-y-3 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8]">
          Inbound Domain & Webhook
        </h4>
        <span className="text-[10px] bg-amber-950/40 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-900/50">
          Awaiting Verification
        </span>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
          <p className="font-bold">Verification Failed:</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 1. Domain input */}
      <div className="p-3 bg-[#010102] border border-[#23252a] rounded-xl space-y-1.5">
        <label className="text-xs font-bold text-[#f7f8f8] block">1. Inbound Reply Domain</label>
        <input
          type="text"
          value={domainInput}
          onChange={(e) => {
            const val = e.target.value;
            setDomainInput(val);
            if (val.includes('@')) {
              setDomainErr('Enter a domain name, not an email address.');
            } else if (val.trim() && !val.includes('.')) {
              setDomainErr(`Enter full domain (e.g., ${val.trim()}.yourdomain.com).`);
            } else {
              setDomainErr('');
            }
          }}
          placeholder="invoice-reply.yourdomain.com"
          className="w-full p-2 border border-[#23252a] rounded-lg text-xs font-mono bg-[#0f1011] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:outline-none"
        />
        {domainErr && <p className="text-[11px] text-red-400">{domainErr}</p>}
      </div>

      {/* 2. Consolidated DNS & SendGrid Parse Table */}
      <div className="p-3 bg-[#010102] border border-[#23252a] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#f7f8f8]">2. DNS Records & SendGrid Parse Settings</span>
          <a
            href={w.sendgridSettingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#f7f8f8] underline hover:text-white font-medium"
          >
            Open SendGrid Parse Settings
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#23252a] bg-[#0f1011] rounded-lg">
            <thead className="bg-[#141516] text-[#8a8f98] font-semibold border-b border-[#23252a] text-[10px]">
              <tr>
                <th className="px-2.5 py-1">Type / Setting</th>
                <th className="px-2.5 py-1">Host / Key</th>
                <th className="px-2.5 py-1">Value / Destination</th>
                <th className="px-2.5 py-1 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a] font-mono text-[11px]">
              <tr>
                <td className="px-2.5 py-1 text-[#8a8f98] font-sans font-medium">DNS MX Record</td>
                <td className="px-2.5 py-1 font-bold text-[#f7f8f8]">
                  {hasDomain ? hostPrefix : <span className="text-[#62666d] italic font-sans text-[10px]">Enter domain above</span>}
                </td>
                <td className="px-2.5 py-1 text-[#d0d6e0]">mx.sendgrid.net <span className="text-[9px] text-[#8a8f98] font-sans">(Priority 10)</span></td>
                <td className="px-2.5 py-1 text-right font-sans">
                  <div className="inline-flex gap-1">
                    <button type="button" onClick={() => copy(hostPrefix, setCopiedDnsHost)} disabled={!hasDomain}
                      className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      {copiedDnsHost ? 'Copied Host' : 'Copy Host'}
                    </button>
                    <button type="button" onClick={() => copy('mx.sendgrid.net', setCopiedMxTarget)}
                      className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer">
                      {copiedMxTarget ? 'Copied Target' : 'Copy Target'}
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-2.5 py-1 text-[#8a8f98] font-sans font-medium">SendGrid Parse Domain</td>
                <td className="px-2.5 py-1 font-bold text-[#f7f8f8]">
                  {hasDomain ? domainInput.trim() : <span className="text-[#62666d] italic font-sans text-[10px]">Enter domain above</span>}
                </td>
                <td className="px-2.5 py-1 text-[#8a8f98] font-sans text-[10px]">Add Host in SendGrid</td>
                <td className="px-2.5 py-1 text-right font-sans">
                  <button type="button" onClick={() => copy(domainInput.trim(), setCopiedDomain)} disabled={!hasDomain}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                    {copiedDomain ? 'Copied' : 'Copy Domain'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-2.5 py-1 text-[#8a8f98] font-sans font-medium">SendGrid Parse Webhook</td>
                <td className="px-2.5 py-1 text-[#8a8f98] font-sans text-[10px]">Destination URL</td>
                <td className="px-2.5 py-1 text-[#d0d6e0] text-[10px] whitespace-nowrap" title={w.webhookUrl}>{formatTruncatedUrl(w.webhookUrl, 26, 12)}</td>
                <td className="px-2.5 py-1 text-right font-sans">
                  <button type="button" onClick={() => copy(w.webhookUrl, setCopiedWebhook)}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] border border-[#34343a] transition-all cursor-pointer">
                    {copiedWebhook ? 'Copied' : 'Copy URL'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-amber-300/90 font-mono pt-0.5">
          {hasDomain ? (
            <>* DNS Tip: Enter only <strong>{hostPrefix}</strong> as the Host/Name in Cloudflare/GoDaddy.</>
          ) : (
            <>* Enter your full inbound reply domain above to generate DNS host & parse settings.</>
          )}
        </p>
      </div>

      {infoMsg && (
        <div className="p-2.5 bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl text-xs text-[#27a644] font-medium">
          {infoMsg}
        </div>
      )}

      {/* Navigation */}
      <div className="pt-2.5 flex justify-between items-center border-t border-[#23252a]">
        <button
          type="button"
          onClick={() => {
            if (w.isDone) {
              setDomainInput(w.inboundDomain || '');
              setDomainErr('');
              setInfoMsg('');
              setErrorMsg('');
              setMode('view');
            } else {
              onBack();
            }
          }}
          className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
        >
          {w.isDone ? 'Cancel Edit' : 'Back'}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => rotateTokenMutation.mutate()}
            disabled={rotateTokenMutation.isPending}
            className="px-3 py-1.5 bg-[#18191c] hover:bg-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8] border border-[#34343a] rounded-xl text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
          >
            Rotate Token
          </button>
          <button
            type="button"
            onClick={() => verifyWebhookMutation.mutate()}
            disabled={verifyWebhookMutation.isPending || !!domainErr}
            className="px-4 py-1.5 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-xl text-xs font-semibold transition-all shadow-xs disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            {verifyWebhookMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {verifyWebhookMutation.isPending ? 'Verifying...' : 'Verify DNS & Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
}

