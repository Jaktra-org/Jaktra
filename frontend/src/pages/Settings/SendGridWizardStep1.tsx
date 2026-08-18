import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settings';
import { getErrorMessage } from '../../utils/error-utils';
import type { SendgridSetupProgress } from '../../types/api';

interface Props {
  progress: SendgridSetupProgress;
  refetch: () => Promise<unknown>;
  onNext: () => void;
}

/**
 * Step 1 — API Key
 */
export function SendGridWizardStep1({ progress, refetch, onNext }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>(
    progress.step1ApiKey.isDone ? 'view' : 'edit'
  );
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const saveKeyMutation = useMutation({
    mutationFn: (key: string) => settingsService.saveSendgridKey({ apiKey: key }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      // MUST await refetch so parent has fresh progress before onNext fires
      await refetch();
      setApiKeyInput('');
      setErrorMsg('');
      setMode('view');
      onNext();
    },
    onError: (err: unknown) => {
      const serverMsg = getErrorMessage(err);
      const lower = serverMsg.toLowerCase();
      if (
        lower.includes('full access') ||
        lower.includes('scope') ||
        lower.includes('permission') ||
        lower.includes('access')
      ) {
        setErrorMsg(serverMsg || 'The SendGrid API key lacks required permissions. Please provide an API key with "Full access".');
      } else if (
        lower.includes('credential') ||
        lower.includes('unauthorized') ||
        lower.includes('invalid')
      ) {
        setErrorMsg('Invalid SendGrid API Key.');
      } else {
        setErrorMsg(serverMsg || 'Invalid SendGrid API Key.');
      }
    },
  });

  if (mode === 'view') {
    // VIEW MODE: render only static text from server data — no inputs
    return (
      <div className="space-y-4 text-[#f7f8f8]">
        <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
          <h4 className="text-xs font-bold text-[#f7f8f8]">
            API Key
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            Connected
          </span>
        </div>

        <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-lg space-y-1.5">
          <p className="text-xs font-mono text-[#8a8f98]">SG.••••••••••••••••••••••••••••••••••</p>
          <p className="text-[11px] text-[#8a8f98] border-t border-[#23252a] pt-2 mt-1">
            Your SendGrid account is connected and verified. You can replace the key at any time.
          </p>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => {
              setApiKeyInput('');
              setErrorMsg('');
              setMode('edit');
            }}
            className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
          >
            Replace Key
          </button>
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

  // EDIT MODE: plain form, no verified/unverified state, no comparisons
  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8]">
          API Key
        </h4>
      </div>

      <p className="text-xs text-[#8a8f98]">
        Enter your SendGrid Key to connect your account. Must be an API Key starting with{' '}
        <code className="text-[#d0d6e0] font-mono">SG.</code> (Full Access or Restricted with <strong>Mail Send</strong> permissions). You can copy your key from{' '}
        <a
          href="https://app.sendgrid.com/settings/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f7f8f8] underline hover:text-white font-medium inline-flex items-center gap-0.5"
        >
          SendGrid Settings
        </a>.
      </p>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#8a8f98]">API Key</label>
        <div className="relative flex items-center">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKeyInput}
            onChange={(e) => { setApiKeyInput(e.target.value); setErrorMsg(''); }}
            autoComplete="new-password"
            className="w-full p-2.5 pr-10 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none font-mono"
            placeholder="SG.xxxxxxxxxxxxxxxxxx"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
            title={showApiKey ? "Hide Key" : "View Key"}
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        {progress.step1ApiKey.isDone && (
          <button
            type="button"
            onClick={() => { setApiKeyInput(''); setErrorMsg(''); setMode('view'); }}
            className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              const key = apiKeyInput.trim();
              if (!key) {
                setErrorMsg('Please enter a SendGrid API Key.');
                return;
              }
              if (!key.startsWith('SG.')) {
                setErrorMsg('Invalid API Key format. SendGrid API keys must start with "SG." (including the dot, e.g. SG.xxxxxxxx).');
                return;
              }
              saveKeyMutation.mutate(key);
            }}
            disabled={saveKeyMutation.isPending}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center disabled:opacity-40 cursor-pointer"
          >
            {saveKeyMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {saveKeyMutation.isPending ? 'Validating Key...' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

