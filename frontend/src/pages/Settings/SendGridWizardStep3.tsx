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
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />
            Step 3 of 3: Inbound Reply Webhook
          </h4>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Inbound Reply Domain</p>
              <p className="text-slate-900 font-mono font-medium mt-0.5">{w.inboundDomain}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">MX Host Prefix</p>
              <p className="text-slate-900 font-mono font-medium mt-0.5">{getDnsHostPrefix(w.inboundDomain || '')}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <p className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider mb-1">Webhook URL</p>
            <p className="text-slate-700 font-mono text-[10px] break-all">{w.webhookUrl}</p>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">
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
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            Edit / Re-verify
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shadow-sm"
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
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="text-sm font-bold text-slate-900 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />
          Step 3 of 3: Inbound Reply Domain & Webhook Setup
        </h4>
        <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
          Awaiting Verification ⏳
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium space-y-1">
          <p className="font-bold">❌ Verification Failed:</p>
          <p>{errorMsg}</p>
          <p className="text-[11px] text-red-600 font-normal">
            Ensure you enter the full domain (e.g. <code>invoicereply.jaktra.site</code>) instead of just the host prefix. If you just added the MX record, DNS propagation can take 1–5 minutes.
          </p>
        </div>
      )}

      {/* 1. Domain input */}
      <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900">1. Full Inbound Reply Domain Name</label>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            DNS Host: <code className="font-mono">{hostPrefix}</code>
          </span>
        </div>
        <p className="text-[11px] text-slate-600">Enter your full subdomain (e.g. <code>invoicereply.jaktra.site</code> or <code>reply.acme.com</code>)</p>
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
          className="w-full p-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {domainErr && <p className="text-[11px] text-red-600 font-medium">{domainErr}</p>}
      </div>

      {/* 2. DNS MX record table */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div>
          <h5 className="text-xs font-bold text-slate-900">2. Add MX Record to your DNS Provider</h5>
          <p className="text-[11px] text-slate-600">Add this record in Cloudflare, Namecheap, GoDaddy, or Route53:</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 bg-white rounded-md">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-3 py-1.5">DNS Field</th>
                <th className="px-3 py-1.5">Value to Enter</th>
                <th className="px-3 py-1.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Type</td>
                <td className="px-3 py-2 font-bold text-blue-700">MX</td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[10px]">Select MX</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Host / Name</td>
                <td className="px-3 py-2 font-bold text-slate-900">{hostPrefix}</td>
                <td className="px-3 py-2 font-sans">
                  <button type="button" onClick={() => copy(hostPrefix, setCopiedDnsHost)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium border border-slate-300">
                    {copiedDnsHost ? 'Copied!' : 'Copy Host'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Target / Points To</td>
                <td className="px-3 py-2 text-slate-800">mx.sendgrid.net</td>
                <td className="px-3 py-2 font-sans">
                  <button type="button" onClick={() => copy('mx.sendgrid.net', setCopiedMxTarget)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium border border-slate-300">
                    {copiedMxTarget ? 'Copied!' : 'Copy Target'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Priority</td>
                <td className="px-3 py-2 text-slate-800">10</td>
                <td className="px-3 py-2 text-slate-400 font-sans text-[10px]">Set 10</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
          <p className="font-bold">💡 DNS Tip:</p>
          <p>Enter only <strong><code>{hostPrefix}</code></strong> in the Host box — not the full domain <code>{domainInput || 'reply.acme.com'}</code>.</p>
        </div>
      </div>

      {/* 3. SendGrid Parse settings */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-slate-900">3. Configure SendGrid Inbound Parse</h5>
            <p className="text-[11px] text-slate-600">Open SendGrid → Inbound Parse → Add Host & URL:</p>
          </div>
          <a href={w.sendgridSettingsUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shrink-0 transition-colors inline-flex items-center shadow-sm">
            Open SendGrid Parse Settings <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 bg-white rounded-md">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-3 py-1.5">SendGrid Field</th>
                <th className="px-3 py-1.5">Value to Enter</th>
                <th className="px-3 py-1.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Domain (Host)</td>
                <td className="px-3 py-2 text-slate-900 font-bold">{domainInput.trim() || 'reply.acme.com'}</td>
                <td className="px-3 py-2 font-sans">
                  <button type="button" onClick={() => copy(domainInput.trim(), setCopiedDomain)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium border border-slate-300">
                    {copiedDomain ? 'Copied!' : 'Copy Domain'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">URL</td>
                <td className="px-3 py-2 text-slate-800 break-all max-w-[280px] text-[10px]">{w.webhookUrl}</td>
                <td className="px-3 py-2 font-sans">
                  <button type="button" onClick={() => copy(w.webhookUrl, setCopiedWebhook)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-medium">
                    {copiedWebhook ? 'Copied!' : 'Copy URL'}
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-slate-700 font-sans font-bold">Spam Check / Send Raw</td>
                <td className="px-3 py-2 text-slate-500 font-sans text-[11px]" colSpan={2}>Leave <strong>Unchecked</strong></td>
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
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center"
          >
            {verifyWebhookMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {verifyWebhookMutation.isPending ? 'Checking DNS MX & Webhook...' : 'Re-check DNS & Webhook'}
          </button>
          <button
            type="button"
            onClick={() => rotateTokenMutation.mutate()}
            disabled={rotateTokenMutation.isPending}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-medium shrink-0 transition-colors disabled:opacity-50"
          >
            Rotate Token
          </button>
        </div>

        {infoMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-700 font-medium">
            ✅ {infoMsg}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-4 flex justify-between items-center border-t border-slate-100">
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
          className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
        >
          {w.isDone ? '← Cancel Edit' : '← Back to Step 2'}
        </button>
      </div>
    </div>
  );
}
