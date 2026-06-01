import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Key, CheckCircle2, Eye, EyeOff } from 'lucide-react';
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
        lower.includes('credential') ||
        lower.includes('auth') ||
        lower.includes('unauthorized') ||
        lower.includes('forbidden')
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
          <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
            <Key className="w-4 h-4 mr-2 text-[#8a8f98]" />
            Step 1 of 3: SendGrid API Key
          </h4>
          <span className="text-[10px] bg-[#27a644]/10 text-[#27a644] font-semibold px-2.5 py-0.5 rounded-full border border-[#27a644]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        </div>

        <div className="p-3.5 bg-[#010102] border border-[#23252a] rounded-lg space-y-1.5">
          <p className="text-xs font-semibold text-[#f7f8f8]">SendGrid API Key</p>
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
            className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all"
          >
            Replace API Key
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Continue to Step 2 →
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE: plain form, no verified/unverified state, no comparisons
  return (
    <div className="space-y-4 text-[#f7f8f8]">
      <div className="flex items-center justify-between border-b border-[#23252a] pb-2">
        <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
          <Key className="w-4 h-4 mr-2 text-[#8a8f98]" />
          Step 1 of 3: Save SendGrid API Key
        </h4>
      </div>

      <p className="text-xs text-[#8a8f98]">
        Enter your SendGrid API Key to connect your account. Must be a restricted API Key starting with{' '}
        <code className="text-[#d0d6e0] font-mono">SG.</code> containing <strong>Mail Send</strong> permissions.
      </p>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#8a8f98]">SendGrid API Key</label>
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
            title={showApiKey ? "Hide API Key" : "View API Key"}
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
            className="px-3.5 py-1.5 border border-[#34343a] rounded-xl text-[#f7f8f8] bg-[#18191c] hover:bg-[#23252a] text-xs font-medium transition-all"
          >
            ← Cancel
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
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center disabled:opacity-40"
          >
            {saveKeyMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {saveKeyMutation.isPending ? 'Validating Key...' : 'Save Key & Continue to Step 2 →'}
          </button>
        </div>
      </div>
    </div>
  );
}

