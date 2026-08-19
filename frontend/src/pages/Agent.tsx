import { useState, useEffect } from 'react';
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

const RUNNING_TEXTS = [
  'Autopilot Running...',
  'Processing Batch...',
  'Dispatching Emails...',
];

export function Agent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [runningTextIdx, setRunningTextIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: integrations, isLoading: isIntegrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: settingsService.getIntegrations,
    retry: false,
  });

  const emailReady = !!(
    integrations?.sendgrid?.isConfigured ||
    integrations?.smtp?.isConfigured ||
    integrations?.resend?.isConfigured ||
    integrations?.sendgridProgress?.isActive ||
    integrations?.smtpProgress?.isActive ||
    integrations?.resendProgress?.isActive
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
  const totalInvoicesProcessed = runsList.reduce((acc, run) => acc + (run?.invoicesProcessed || 0), 0);

  const isDataLoading = isIntegrationsLoading || isSettingsLoading;

  useEffect(() => {
    if (!isRunning) {
      setRunningTextIdx(0);
      setIsFading(false);
      return;
    }

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setRunningTextIdx((prev) => (prev + 1) % RUNNING_TEXTS.length);
        setIsFading(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4">
      {/* Top Fixed Header */}
      <div className="flex-shrink-0 space-y-3 pb-3 border-b border-[#1e2025]/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">
              Autopilot
            </h1>

            {/* Top-Left Integrated Status & Total Processed Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#13161c] border border-[#1e2025] rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                {isRunning ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#62666d]"></span>
                )}
              </span>
              <span className="text-[#8a8f98] font-medium">
                {isRunning ? (
                  <span className="text-emerald-400 font-semibold">Running</span>
                ) : (
                  'Idle'
                )}
              </span>
              <span className="text-[#3e3e44]">•</span>
              <span className="text-[#f7f8f8] font-semibold font-mono">{totalInvoicesProcessed}</span>
              <span className="text-[#8a8f98]">Processed</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {user?.role !== 'viewer' && (
              <div className="flex items-center gap-2">
                <ToneSelector
                  value={selectedTone}
                  onChange={setSelectedTone}
                  disabled={isRunning || isDataLoading || !emailReady}
                  className="h-9 border-[#1e2025] bg-[#13161c] text-[#f7f8f8] text-xs rounded-xl"
                />
                <button
                  onClick={handleRunAgent}
                  disabled={isRunning || isDataLoading || !emailReady}
                  title={!isDataLoading && !emailReady ? 'Email is not configured. Set up an email provider in Settings first.' : undefined}
                  className={`inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all h-9 px-4 py-2 disabled:cursor-not-allowed shadow-xs cursor-pointer ${
                    isRunning
                      ? 'bg-[#5e6ad2] text-white border border-[#6e7be2]'
                      : 'bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] disabled:opacity-40'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin flex-shrink-0" />
                      <span
                        className={`transition-opacity duration-300 inline-block min-w-[125px] text-left ${
                          isFading ? 'opacity-0' : 'opacity-100'
                        }`}
                      >
                        {RUNNING_TEXTS[runningTextIdx]}
                      </span>
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
            {!isIntegrationsLoading && !isSettingsLoading && settings && !emailReady && (
              <div className="bg-amber-950/40 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-amber-300 text-xs">Email not configured</h4>
                  <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
                    Autopilot cannot run because no email provider is set up.
                    Connect <strong>Resend</strong>, <strong>SendGrid</strong>, or <strong>SMTP</strong> and set a sender email address —
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
              <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#1e2025]/80">
                  <h3 className="text-sm font-semibold text-[#f7f8f8]">Run History</h3>
                </div>
                <div className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" />
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

