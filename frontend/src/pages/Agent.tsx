import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { agentService } from '../services/agent';
import { dlqService } from '../services/dlq';
import { ToneSelector } from '../components/agent/ToneSelector';
import { settingsService } from '../services/settings';
import { RunList } from '../components/agent/RunList';
import { PaymentWarningModal } from '../components/common/PaymentWarningModal';
import { usePaymentWarning } from '../hooks/usePaymentWarning';
import { useAuth } from '../contexts/AuthContext';
import { Bot, Play, AlertCircle, Loader2, AlertTriangle, Settings } from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';
import { DLQ } from './DLQ';

export function Agent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTone, setSelectedTone] = useState<string>('');

  const activeTab = searchParams.get('tab') === 'dlq' ? 'dlq' : 'overview';

  const setActiveTab = (tab: 'overview' | 'dlq') => {
    if (tab === 'overview') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tab');
      setSearchParams(newParams);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', 'dlq');
      setSearchParams(newParams);
    }
  };

  const { data: runsResponse, isLoading } = useQuery({
    queryKey: ['agent-runs'],
    queryFn: agentService.getRuns,
    refetchInterval: 10000,
  });

  const { data: dlqEntries } = useQuery({
    queryKey: ['dlq-entries'],
    queryFn: () => dlqService.getEntries(),
    refetchInterval: 30000,
  });

  const dlqList = Array.isArray(dlqEntries) ? dlqEntries : [];
  const dlqCount = dlqList.length;
  const dlqCriticalCount = dlqList.filter(e => (e?.consecutiveFailures || 0) >= 3).length;

  const { data: settings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: settingsService.getIntegrations,
    retry: false,
  });

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
      queryClient.invalidateQueries({ queryKey: ['dlq-entries'] });
    },
  });

  const { showModal, runWithWarningCheck, handleConfirm, handleCancel } =
    usePaymentWarning({ integrations, settings });

  const handleRunAgent = () => {
    runWithWarningCheck(() => runMutation.mutate(selectedTone || undefined));
  };

  const runsList = Array.isArray(runsResponse?.runs) ? runsResponse.runs : [];
  const isRunning = runsList[0]?.status === 'running' || runMutation.isPending;

  return (
    <div className="h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4">
      {/* Top Fixed Header */}
      <div className="flex-shrink-0 space-y-3 pb-3 border-b border-[#1e2025]/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">
              Autopilot
            </h1>
            <p className="text-xs text-[#8a8f98] mt-1">AI Agent Control — Manage and monitor automated invoice processing, AI triage, and follow-up dispatching.</p>
          </div>
          <div className="flex items-center space-x-3 self-start md:self-auto">
            {user?.role !== 'viewer' && (
              <div className="flex items-center gap-2">
                <ToneSelector
                  value={selectedTone}
                  onChange={setSelectedTone}
                  disabled={isRunning || !emailReady}
                  className="h-9 border-[#1e2025] bg-[#13161c] text-[#f7f8f8] text-xs rounded-xl"
                />
                <button
                  onClick={handleRunAgent}
                  disabled={isRunning || !emailReady}
                  title={!emailReady ? 'Email is not configured. Set up an email provider in Settings first.' : undefined}
                  className="inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] h-9 px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Autopilot Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-2 fill-current" />
                      Run Autopilot
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Overview vs DLQ) */}
        <div className="flex items-center gap-1.5 p-1 bg-transparent border border-[#1e2025]/80 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#18191a] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
            }`}
          >
            Overview &amp; Runs
          </button>
          <button
            onClick={() => setActiveTab('dlq')}
            className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'dlq'
                ? 'bg-[#18191a] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
            }`}
          >
            <span>Failed Invoices (DLQ)</span>
            {dlqCount > 0 && (
              <span className={`px-2 py-0.2 text-[10px] font-bold rounded-full ${
                dlqCriticalCount > 0 ? 'bg-red-950/60 text-red-400 border border-red-900/50' : 'bg-[#23252a] text-[#f7f8f8]'
              }`}>
                {dlqCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        {activeTab === 'dlq' ? (
          <DLQ embedded />
        ) : (
          <>
            {/* Email not configured warning */}
            {settings && !emailReady && (
              <div className="bg-amber-950/40 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-300 text-xs">Email not configured</h4>
                  <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
                    Autopilot cannot run because no email provider is set up.
                    Connect <strong>SendGrid</strong> or <strong>SMTP</strong> and set a sender email address —
                    otherwise follow-up emails would be generated but never delivered.
                  </p>
                </div>
                <Link
                  to="/settings"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 border border-amber-800/60 bg-[#13161c] rounded-xl px-3 py-1.5 transition-all whitespace-nowrap"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Go to Settings
                </Link>
              </div>
            )}

            {runMutation.isError && (
              <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3 rounded-2xl flex items-start animate-in fade-in">
                <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-xs">Failed to start autopilot</h4>
                  <p className="text-xs mt-0.5 opacity-90">{getErrorMessage(runMutation.error)}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">Autopilot Status</div>
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

                <div className="pt-4 border-t border-[#1e2025]/80">
                  <p className="text-xs text-[#8a8f98] mb-1">Total Invoices Processed (All Time)</p>
                  <p className="text-2xl font-bold text-[#f7f8f8] font-mono">
                    {runsList.reduce((acc, run) => acc + (run?.invoicesProcessed || 0), 0)}
                  </p>
                </div>
              </div>

              <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#1e2025]/80">
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">Run History</h3>
                </div>
                <div className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
                    </div>
                  ) : runsList.length > 0 ? (
                    <RunList runs={runsList} />
                  ) : (
                    <div className="text-center py-12 text-[#8a8f98]">
                      <Bot className="w-10 h-10 text-[#3e3e44] mx-auto mb-3" />
                      <p className="text-sm font-semibold text-[#f7f8f8]">No autopilot runs recorded yet.</p>
                      <p className="text-xs mt-1">Click "Run Autopilot" to trigger the first batch.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
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
