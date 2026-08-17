import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dlqService } from '../services/dlq';
import { agentService } from '../services/agent';
import { AlertTriangle, MailX, RefreshCw, X, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/error-utils';
import { Modal } from '../components/ui/Modal';

export function DLQ({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { data: dlqEntries, isLoading, isError } = useQuery({
    queryKey: ['dlq-entries'],
    queryFn: () => dlqService.getEntries(),
    refetchInterval: 30000,
  });

  const dismissMutation = useMutation({
    mutationFn: (invoiceId: string) => dlqService.deleteEntry(invoiceId),
    onMutate: () => {
      setMutationError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq-entries'] });
      setDismissingId(null);
    },
    onError: (err: unknown) => {
      setMutationError(getErrorMessage(err));
      setDismissingId(null);
    }
  });

  const retryMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await agentService.runAgentForInvoice(invoiceId);
    },
    onMutate: () => {
      setMutationError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dlq-entries'] });
    },
    onError: (err: unknown) => {
      setMutationError(getErrorMessage(err));
    },
    onSettled: () => {
      setRetryingId(null);
    },
  });

  const handleRetry = (invoiceId: string) => {
    setRetryingId(invoiceId);
    retryMutation.mutate(invoiceId);
  };

  const handleDismiss = (invoiceId: string) => {
    dismissMutation.mutate(invoiceId);
  };

  const entries = Array.isArray(dlqEntries) ? dlqEntries : [];
  const sortedEntries = [...entries].sort((a, b) => (b?.consecutiveFailures || 0) - (a?.consecutiveFailures || 0));
  const criticalCount = entries.filter(e => (e?.consecutiveFailures || 0) >= 3).length;

  const targetDismissEntry = entries.find(e => e.invoiceId === dismissingId);

  return (
    <div className={embedded ? "space-y-4" : "h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4"}>
      {!embedded && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1e2025]/80">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">
              Dead Letter Queue
            </h1>
            <p className="text-xs text-[#8a8f98] mt-1">Manage and resolve invoices that failed to process automatically.</p>
          </div>
        </div>
      )}

      {criticalCount > 0 && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3.5 rounded-2xl flex items-start flex-shrink-0 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-xs text-red-300">Critical Delivery Failures</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              You have {criticalCount} invoice(s) that have failed delivery 3 or more times. They require immediate manual intervention.
            </p>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3.5 rounded-2xl flex items-start flex-shrink-0 justify-between animate-in fade-in">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-red-300">Operation Failed</h4>
              <p className="text-xs mt-0.5 opacity-90">{mutationError}</p>
            </div>
          </div>
          <button onClick={() => setMutationError(null)} className="text-red-400 hover:text-red-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="flex-1 min-h-0 flex flex-col bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2025]/80 flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#f7f8f8] tracking-tight">Failed Invoices</h2>
          <p className="text-xs text-[#8a8f98] mt-0.5">Invoices are removed from this list when a follow-up is successfully processed.</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#13161c]/60 text-[#8a8f98] font-medium border-b border-[#1e2025]/80 sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="px-5 py-3">Client & Invoice</th>
                <th className="px-5 py-3">Failures</th>
                <th className="px-5 py-3">Last Error</th>
                <th className="px-5 py-3 whitespace-nowrap">Last Attempt</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2025]/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-[#8a8f98]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8a8f98]" />
                    Loading queue...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-red-400">Failed to load Dead Letter Queue.</td>
                </tr>
              ) : sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center text-[#8a8f98]">
                    <div className="w-12 h-12 rounded-2xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] mx-auto mb-3">
                      <MailX className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#f7f8f8]">Queue is empty</p>
                    <p className="text-xs mt-1 text-[#8a8f98]">No failed invoices found. Everything is healthy!</p>
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry) => {
                  const isRetrying = retryingId === entry.invoiceId;
                  
                  return (
                    <tr key={entry.invoiceId} className="hover:bg-[#13161c]/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link to={`/invoices/${entry.invoiceId}`} className="font-medium text-[#5e6ad2] hover:text-[#828fff] flex items-center group truncate max-w-[250px]">
                          {entry.clientName || 'Unknown Client'}
                          <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="text-[11px] text-[#8a8f98] font-mono mt-0.5">
                          {entry.invoiceNo || entry.invoiceId.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${entry.consecutiveFailures >= 3 ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                          {entry.consecutiveFailures} {entry.consecutiveFailures === 1 ? 'time' : 'times'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#d0d6e0]">
                        <div className="truncate max-w-[300px]" title={entry.lastErrorDisplay || entry.lastError || 'Unknown Error'}>
                          {entry.lastErrorDisplay || entry.lastError || 'Unknown Error'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#8a8f98] whitespace-nowrap font-mono text-[11px]">
                        {entry.lastFailure && !isNaN(new Date(entry.lastFailure).getTime()) ? new Date(entry.lastFailure).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          {isRetrying ? (
                            <button disabled className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-[#13161c] text-[#8a8f98] px-3.5 py-1.5 opacity-70 cursor-not-allowed border border-[#1e2025]">
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#8a8f98]" />
                              Retrying...
                            </button>
                          ) : (
                            user?.role !== 'viewer' && (
                              <>
                                <button
                                  onClick={() => handleRetry(entry.invoiceId)}
                                  disabled={retryingId !== null || dismissingId !== null}
                                  className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] hover:bg-[#5e6ad2]/20 px-3.5 py-1.5 transition-all disabled:opacity-40 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                  Retry Processing
                                </button>
                                <button
                                  onClick={() => setDismissingId(entry.invoiceId)}
                                  disabled={retryingId !== null || dismissingId !== null}
                                  className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-[#13161c] border border-[#1e2025] text-[#8a8f98] hover:bg-[#1d212a] hover:text-[#f7f8f8] px-3.5 py-1.5 transition-all disabled:opacity-40 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />
                                  Dismiss
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dismiss Confirmation Dialog Modal */}
      {dismissingId && (
        <Modal
          isOpen={!!dismissingId}
          onClose={() => setDismissingId(null)}
          title="Dismiss DLQ Entry?"
          className="max-w-md"
        >
          <div className="space-y-4 text-[#f7f8f8]">
            <p className="text-xs text-[#8a8f98] leading-relaxed">
              Invoice <strong className="text-[#f7f8f8] font-mono">{targetDismissEntry?.invoiceNo || dismissingId.substring(0, 8)}</strong> will be removed from the queue. This does not fix the underlying issue.
            </p>

            <div className="flex gap-3 justify-end pt-3 border-t border-[#1e2025]">
              <button
                type="button"
                onClick={() => setDismissingId(null)}
                disabled={dismissMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl text-xs font-semibold border border-[#1e2025] bg-[#13161c] hover:bg-[#1d212a] text-[#f7f8f8] h-8.5 px-4 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDismiss(dismissingId)}
                disabled={dismissMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/50 disabled:opacity-40 h-8.5 px-4 gap-1.5 transition-all cursor-pointer"
              >
                {dismissMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
