import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Key, CheckCircle2 } from 'lucide-react';
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
 *
 * Constraint: `mode` is seeded from `progress.step1ApiKey.isDone` at mount time.
 * This is safe because the parent (SendGridSetupModal) blocks rendering this
 * component until `sendgridProgress` has resolved at least once.
 *
 * Constraint: `onNext()` is the only mechanism that advances `wizardStep` after
 * the parent's one-time init effect. No duplicate step-advance logic lives here.
 *
 * Constraint: `await refetch()` before calling `onNext()` so the parent always
 * receives fresh `progress` before navigating.
 */
export function SendGridWizardStep1({ progress, refetch, onNext }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>(
    progress.step1ApiKey.isDone ? 'view' : 'edit'
  );
  const [apiKeyInput, setApiKeyInput] = useState('');
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
      setErrorMsg(getErrorMessage(err));
    },
  });

  if (mode === 'view') {
    // VIEW MODE: render only static text from server data — no inputs
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="text-sm font-bold text-slate-900 flex items-center">
            <Key className="w-4 h-4 mr-2 text-blue-600" />
            Step 1 of 3: SendGrid API Key
          </h4>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-slate-700">SendGrid API Key</p>
          <p className="text-xs font-mono text-slate-500">SG.••••••••••••••••••••••••••••••••••</p>
          <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
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
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            Replace API Key
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm"
          >
            Continue to Step 2 →
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE: plain form, no verified/unverified state, no comparisons
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h4 className="text-sm font-bold text-slate-900 flex items-center">
          <Key className="w-4 h-4 mr-2 text-blue-600" />
          Step 1 of 3: Save SendGrid API Key
        </h4>
      </div>

      <p className="text-xs text-slate-600">
        Enter your SendGrid API Key to connect your account. Must be a restricted API Key starting with{' '}
        <code>SG.</code> containing <strong>Mail Send</strong> permissions.
      </p>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">SendGrid API Key</label>
        <input
          type="password"
          value={apiKeyInput}
          onChange={(e) => { setApiKeyInput(e.target.value); setErrorMsg(''); }}
          autoComplete="new-password"
          className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="SG.xxxxxxxxxxxxxxxxxx"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        {progress.step1ApiKey.isDone && (
          <button
            type="button"
            onClick={() => { setApiKeyInput(''); setErrorMsg(''); setMode('view'); }}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            ← Cancel
          </button>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              const key = apiKeyInput.trim();
              if (!key || !key.startsWith('SG.')) {
                setErrorMsg('SendGrid API Key must start with SG.');
                return;
              }
              saveKeyMutation.mutate(key);
            }}
            disabled={saveKeyMutation.isPending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center disabled:opacity-50"
          >
            {saveKeyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saveKeyMutation.isPending ? 'Validating Key...' : 'Save Key & Continue to Step 2 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
