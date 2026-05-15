import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { agentService } from '../services/agent';
import { ToneSelector } from '../components/agent/ToneSelector';
import { settingsService } from '../services/settings';
import { RunList } from '../components/agent/RunList';
import { ActivityFeed } from '../components/agent/ActivityFeed';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PaymentWarningModal } from '../components/common/PaymentWarningModal';
import { usePaymentWarning } from '../hooks/usePaymentWarning';
import { useAuth } from '../contexts/AuthContext';
import { Bot, Play, AlertCircle, Loader2, AlertTriangle, Settings } from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';

export function Agent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTone, setSelectedTone] = useState<string>('');

  const { data: runsResponse, isLoading } = useQuery({
    queryKey: ['agent-runs'],
    queryFn: agentService.getRuns,
    refetchInterval: 10000,
  });

  const { data: settings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: settingsService.getIntegrations,
    retry: false,
  });

  // Email is ready when any active email integration (SendGrid or SMTP) or tenant email settings are configured
  const emailReady = !!(
    integrations?.sendgrid?.isConfigured ||
    integrations?.smtp?.isConfigured ||
    integrations?.sendgridProgress?.isActive ||
    integrations?.smtpProgress?.isActive ||
    (settings?.defaultEmailProvider && settings?.senderEmail)
  );

  const runMutation = useMutation({
    mutationFn: (tone?: string) => agentService.runAgent(tone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-runs'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['agent-feed'] });
    },
  });

  const { showModal, runWithWarningCheck, handleConfirm, handleCancel } =
    usePaymentWarning({ integrations, settings });

  const handleRunAgent = () => {
    runWithWarningCheck(() => runMutation.mutate(selectedTone || undefined));
  };

  const isRunning = runsResponse?.runs[0]?.status === 'running' || runMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8] flex items-center">
            <Bot className="w-6 h-6 text-[#5e6ad2] mr-2.5" />
            AI Agent Control
          </h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">Manage and monitor automated invoice processing and follow-ups.</p>
        </div>
        <div className="flex items-center space-x-3">
          {user?.role !== 'viewer' && (
            <div className="flex items-center gap-2">
              <ToneSelector
                value={selectedTone}
                onChange={setSelectedTone}
                disabled={isRunning || !emailReady}
                className="h-9 border-[#23252a] bg-[#0f1011] text-[#f7f8f8] text-xs"
              />
              <button
                onClick={handleRunAgent}
                disabled={isRunning || !emailReady}
                title={!emailReady ? 'Email is not configured. Set up an email provider in Settings first.' : undefined}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all bg-[#5e6ad2] text-white hover:bg-[#828fff] h-9 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Agent Running...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Run Agent Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Email not configured warning */}
      {settings && !emailReady && (
        <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-amber-300 text-xs">Email not configured</h4>
            <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
              The agent cannot run because no email provider is set up.
              Connect <strong>SendGrid</strong> or <strong>SMTP</strong> and set a sender email address —
              otherwise follow-up emails would be generated but never delivered.
            </p>
          </div>
          <Link
            to="/settings"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-100 border border-amber-800/60 bg-[#0f1011] rounded-md px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5" />
            Go to Settings
          </Link>
        </div>
      )}

      {runMutation.isError && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-xs">Failed to start agent</h4>
            <p className="text-xs mt-0.5 opacity-90">{getErrorMessage(runMutation.error)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="pb-2 border-b-0">
              <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="relative flex h-3.5 w-3.5">
                  {isRunning ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5e6ad2] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#5e6ad2]"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#3e3e44]"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#f7f8f8] text-base">
                    {isRunning ? 'Processing Batch...' : 'Idle / Ready'}
                  </p>
                  <p className="text-xs text-[#8a8f98] mt-0.5">
                    {isRunning ? 'Analyzing invoices and dispatching emails.' : 'Waiting for next scheduled run or manual trigger.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#23252a]">
                <p className="text-xs text-[#8a8f98] mb-1">Total Invoices Processed (All Time)</p>
                <p className="text-2xl font-bold text-[#f7f8f8]">
                  {runsResponse?.runs.reduce((acc, run) => acc + run.invoicesProcessed, 0) || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="border-b border-[#23252a]">
              <CardTitle>Run History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
                </div>
              ) : runsResponse && runsResponse.runs.length > 0 ? (
                <RunList runs={runsResponse.runs} />
              ) : (
                <div className="text-center py-12 text-[#8a8f98]">
                  <Bot className="w-10 h-10 text-[#3e3e44] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#f7f8f8]">No agent runs recorded yet.</p>
                  <p className="text-xs mt-1">Click "Run Agent Now" to trigger the first batch.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 h-[800px]">
          <ActivityFeed isRunning={isRunning} />
        </div>
      </div>

      {/* Payment warning modal — shown once per batch run when Razorpay is not configured */}
      {showModal && (
        <PaymentWarningModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

