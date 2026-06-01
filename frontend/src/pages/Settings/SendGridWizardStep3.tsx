import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
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

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => { });
}

/**
 * Step 3 — Inbound Webhook / Reply Domain
 *
 * VIEW MODE: renders only static read-only text from server data.
 * Shows domain + "Verified ✅". No editable inputs. No state comparisons.
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
      if (domain.includes('@')) throw new Error('Enter a domain name (e.g. invoicereply.jaktra.site), not an email address.');
      if (!domain.includes('.')) throw new Error(`"${domain}" is not a full domain name. Enter the full domain (e.g. ${domain}.jaktra.site).`);
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
          <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-[#8a8f98]" />
            Step 3 of 3: Inbound Reply Webhook
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Verified
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
            ✅ DNS MX record verified and inbound webhook active.
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
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
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            Setup Complete & Connected ✓
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE: full setup form
  const hostPrefix = getDnsHostPrefix(domainInput);

  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 text-[#8a8f98]" />
          Step 3 of 3: Inbound Reply Domain & Webhook Setup
        </h4>
        <span className="text-[10px] bg-amber-950/40 text-amber-300 font-semibold px-2.5 py-0.5 rounded-full border border-amber-900/50">
          Awaiting Verification ⏳
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium space-y-1">
          <p className="font-bold">❌ Verification Failed:</p>
          <p>{errorMsg}</p>
          <p className="text-[11px] text-red-300 font-normal">
            Ensure you enter the full domain (e.g. <code className="font-mono text-[#d0d6e0]">invoicereply.jaktra.site</code>) instead of just the host prefix. If you just added the MX record, DNS propagation can take 1–5 minutes.
          </p>
        </div>
      )}

      {/* 1. Domain input */}
      <div className="space-y-1.5 p-3 bg-[#010102] border border-[#23252a] rounded-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#f7f8f8]">1. Full Inbound Reply Domain Name</label>
          <span className="text-[10px] font-semibold text-[#f7f8f8] bg-[#18191c] px-2 py-0.5 rounded border border-[#34343a]">
            DNS Host: <code className="font-mono">{hostPrefix}</code>
          </span>
        </div>
        <p className="text-[11px] text-[#8a8f98]">Enter your full subdomain (e.g. <code className="text-[#d0d6e0] font-mono">invoicereply.jaktra.site</code> or <code className="text-[#d0d6e0] font-mono">reply.acme.com</code>)</p>
        <input
          type="text"
          value={domainInput}
          onChange={(e) => {
            const val = e.target.value;
            setDomainInput(val);
            if (val.includes('@')) {
              setDomainErr('Enter a domain name, not an email address.');
            } else if (val.trim() && !val.includes('.')) {
              setDomainErr(`Please enter the FULL domain name (e.g., ${val.trim()}.jaktra.site), not just the host prefix.`);
            } else {
              setDomainErr('');
            }
          }}
          placeholder="invoicereply.jaktra.site"
          className="w-full p-2.5 border border-[#23252a] rounded-xl text-xs font-mono bg-[#0f1011] text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
        />
        {domainErr && <p className="text-[11px] text-red-400 font-medium">{domainErr}</p>}
      </div>

      {/* 2. DNS MX record table */}
      <div className="p-3 bg-[#010102] border border-[#23252a] rounded-xl space-y-2.5">
        <div>
          <h5 className="text-xs font-bold text-[#f7f8f8]">2. Add MX Record to your DNS Provider</h5>
          <p className="text-[11px] text-[#8a8f98]">Add this record in Cloudflare, Namecheap, GoDaddy, or Route53:</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#23252a] bg-[#0f1011] rounded-xl">
            <thead className="bg-[#141516] text-[#8a8f98] font-semibold border-b border-[#23252a] text-[10px]">
              <tr>
                <th className="px-3 py-1.5">DNS Field</th>
                <th className="px-3 py-1.5">Value to Enter</th>
                <th className="px-3 py-1.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a] font-mono text-[11px]">
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Type</td>
                <td className="px-3 py-1.5 font-bold text-[#f7f8f8]">MX</td>
                <td className="px-3 py-1.5 text-[#62666d] font-sans text-[10px]">Select MX</td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Host / Name</td>
                <td className="px-3 py-1.5 font-bold text-[#f7f8f8]">{hostPrefix}</td>
                <td className="px-3 py-1.5 font-sans">
                  <button type="button" onClick={() => copy(hostPrefix, setCopiedDnsHost)}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] font-medium border border-[#34343a] transition-all cursor-pointer">
                    {copiedDnsHost ? 'Copied!' : 'Copy Host'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Target / Points To</td>
                <td className="px-3 py-1.5 text-[#d0d6e0]">mx.sendgrid.net</td>
                <td className="px-3 py-1.5 font-sans">
                  <button type="button" onClick={() => copy('mx.sendgrid.net', setCopiedMxTarget)}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] font-medium border border-[#34343a] transition-all cursor-pointer">
                    {copiedMxTarget ? 'Copied!' : 'Copy Target'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Priority</td>
                <td className="px-3 py-1.5 text-[#d0d6e0]">10</td>
                <td className="px-3 py-1.5 text-[#62666d] font-sans text-[10px]">Set 10</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-2.5 bg-amber-950/30 border border-amber-900/40 rounded-xl text-[11px] text-amber-300">
          <p className="font-bold">💡 DNS Tip:</p>
          <p>Enter only <strong><code className="font-mono text-amber-200">{hostPrefix}</code></strong> in the Host box — not the full domain <code className="font-mono text-amber-200">{domainInput || 'reply.acme.com'}</code>.</p>
        </div>
      </div>

      {/* 3. SendGrid Parse settings */}
      <div className="p-3 bg-[#010102] border border-[#23252a] rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-[#f7f8f8]">3. Configure SendGrid Inbound Parse</h5>
            <p className="text-[11px] text-[#8a8f98]">Open SendGrid → Inbound Parse → Add Host & URL:</p>
          </div>
          <a href={w.sendgridSettingsUrl} target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-1 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] border border-[#34343a] rounded-xl text-xs font-medium shrink-0 transition-all inline-flex items-center shadow-xs">
            Open SendGrid Parse Settings <ExternalLink className="w-3 h-3 ml-1.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#23252a] bg-[#0f1011] rounded-xl">
            <thead className="bg-[#141516] text-[#8a8f98] font-semibold border-b border-[#23252a] text-[10px]">
              <tr>
                <th className="px-3 py-1.5">SendGrid Field</th>
                <th className="px-3 py-1.5">Value to Enter</th>
                <th className="px-3 py-1.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a] font-mono text-[11px]">
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Domain (Host)</td>
                <td className="px-3 py-1.5 text-[#f7f8f8] font-bold">{domainInput.trim() || 'reply.acme.com'}</td>
                <td className="px-3 py-1.5 font-sans">
                  <button type="button" onClick={() => copy(domainInput.trim(), setCopiedDomain)}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] font-medium border border-[#34343a] transition-all cursor-pointer">
                    {copiedDomain ? 'Copied!' : 'Copy Domain'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">URL</td>
                <td className="px-3 py-1.5 text-[#d0d6e0] break-all max-w-[280px] text-[10px]">{w.webhookUrl}</td>
                <td className="px-3 py-1.5 font-sans">
                  <button type="button" onClick={() => copy(w.webhookUrl, setCopiedWebhook)}
                    className="px-2 py-0.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] rounded text-[10px] font-medium border border-[#34343a] transition-all cursor-pointer">
                    {copiedWebhook ? 'Copied!' : 'Copy URL'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans font-bold">Spam Check / Send Raw</td>
                <td className="px-3 py-1.5 text-[#8a8f98] font-sans text-[11px]" colSpan={2}>Leave <strong>Unchecked</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify & Rotate */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => verifyWebhookMutation.mutate()}
            disabled={verifyWebhookMutation.isPending || !!domainErr}
            className="flex-1 py-2 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-xl text-xs font-medium transition-all shadow-xs disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            {verifyWebhookMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {verifyWebhookMutation.isPending ? 'Checking DNS MX & Webhook...' : 'Re-check DNS & Webhook'}
          </button>
          <button
            type="button"
            onClick={() => rotateTokenMutation.mutate()}
            disabled={rotateTokenMutation.isPending}
            className="px-3 py-2 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] border border-[#34343a] rounded-xl text-xs font-medium shrink-0 transition-all disabled:opacity-40 cursor-pointer"
          >
            Rotate Token
          </button>
        </div>

        {infoMsg && (
          <div className="p-3 bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl text-xs text-[#27a644] font-medium">
            ✅ {infoMsg}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-3 flex justify-between items-center border-t border-[#23252a]">
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
          {w.isDone ? '← Cancel Edit' : '← Back to Step 2'}
        </button>
      </div>
    </div>
  );
}

