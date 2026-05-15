import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dlqService } from '../services/dlq';
import { agentService } from '../services/agent';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { AlertTriangle, MailX, RefreshCw, X, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/error-utils';


export function DLQ() {
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

  const entries = dlqEntries || [];
  const sortedEntries = [...entries].sort((a, b) => b.consecutiveFailures - a.consecutiveFailures);
  const criticalCount = entries.filter(e => e.consecutiveFailures >= 3).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8] flex items-center">
            <MailX className="w-6 h-6 text-red-400 mr-2.5" />
            Dead Letter Queue
          </h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">Manage and resolve invoices that failed to process automatically.</p>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3.5 rounded-xl flex items-start shadow-none">
          <AlertTriangle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-xs text-red-300">Critical Delivery Failures</h4>
            <p className="text-xs mt-0.5 opacity-90">
              You have {criticalCount} invoice(s) that have failed delivery 3 or more times. They require immediate manual intervention.
            </p>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3.5 rounded-xl flex items-start shadow-none justify-between">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-red-300">Operation Failed</h4>
              <p className="text-xs mt-0.5 opacity-90">{mutationError}</p>
            </div>
          </div>
          <button onClick={() => setMutationError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle>Failed Invoices</CardTitle>
          <CardDescription>Invoices are removed from this list when a follow-up is successfully processed.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0f1011] text-[#8a8f98] font-medium border-y border-[#23252a]">
                <tr>
                  <th className="px-5 py-3">Client & Invoice</th>
                  <th className="px-5 py-3">Failures</th>
                  <th className="px-5 py-3">Last Error</th>
                  <th className="px-5 py-3 whitespace-nowrap">Last Attempt</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]/50 bg-[#0f1011]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-[#8a8f98]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5e6ad2]" />
                      Loading queue...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-red-400">Failed to load Dead Letter Queue.</td>
                  </tr>
                ) : sortedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-[#8a8f98]">
                      <MailX className="w-10 h-10 text-[#3e3e44] mx-auto mb-3" />
                      <p className="text-sm font-medium text-[#f7f8f8]">Queue is empty</p>
                      <p className="text-xs mt-0.5">No failed invoices found. Everything is healthy!</p>
                    </td>
                  </tr>
                ) : (
                  sortedEntries.map((entry) => {
                    const isRetrying = retryingId === entry.invoiceId;
                    
                    return (
                      <tr key={entry.invoiceId} className="hover:bg-[#141516]/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link to={`/invoices/${entry.invoiceId}`} className="font-medium text-[#5e6ad2] hover:text-[#828fff] flex items-center group truncate max-w-[250px]">
                            {entry.clientName || 'Unknown Client'}
                            <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <div className="text-[11px] text-[#8a8f98] font-normal mt-0.5">
                            {entry.invoiceNo || entry.invoiceId.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${entry.consecutiveFailures >= 3 ? 'bg-red-950/50 text-red-400 border border-red-900/50' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                            {entry.consecutiveFailures} {entry.consecutiveFailures === 1 ? 'time' : 'times'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#d0d6e0]">
                          <div className="truncate max-w-[300px]" title={entry.lastErrorDisplay || entry.lastError || 'Unknown Error'}>
                            {entry.lastErrorDisplay || entry.lastError || 'Unknown Error'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#8a8f98] whitespace-nowrap">
                          {new Date(entry.lastFailure).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex justify-end items-center space-x-2">
                            {isRetrying ? (
                              <button disabled className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-[#141516] text-[#8a8f98] px-3 py-1.5 opacity-70 cursor-not-allowed border border-[#23252a]">
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#5e6ad2]" />
                                Retrying...
                              </button>
                            ) : (
                              user?.role !== 'viewer' && (
                                <>
                                  <button
                                    onClick={() => handleRetry(entry.invoiceId)}
                                    disabled={retryingId !== null || dismissingId !== null}
                                    className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#5e6ad2] hover:bg-[#5e6ad2]/20 px-3 py-1.5 transition-colors disabled:opacity-40"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                    Retry Processing
                                  </button>
                                  <button
                                    onClick={() => setDismissingId(entry.invoiceId)}
                                    disabled={retryingId !== null || dismissingId !== null}
                                    className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-[#0f1011] border border-[#23252a] text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] px-3 py-1.5 transition-colors disabled:opacity-40"
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
        </CardContent>
      </Card>

      {/* Dismiss Confirmation Dialog */}
      {dismissingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f1011] border border-[#23252a] text-[#f7f8f8] rounded-xl shadow-2xl max-w-sm w-full p-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-[#f7f8f8] mb-1.5 tracking-tight">Dismiss DLQ Entry?</h3>
            <p className="text-xs text-[#8a8f98] mb-5 leading-relaxed">
              Invoice <strong>{entries.find(e => e.invoiceId === dismissingId)?.invoiceNo || dismissingId.substring(0, 8)}</strong> will be removed from the queue. This does not fix the underlying issue.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDismissingId(null)}
                disabled={dismissMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] rounded-md hover:bg-[#141516]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDismiss(dismissingId)}
                disabled={dismissMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/40 border border-red-900/50 rounded-md hover:bg-red-900/50 inline-flex items-center"
              >
                {dismissMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

