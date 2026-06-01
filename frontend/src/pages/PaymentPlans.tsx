import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice';
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar, RefreshCw, ChevronLeft, ChevronRight, Layers, FileText } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';

interface PaymentPlanRequest {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  invoiceAmount: string;
  currency: string;
  installments: number;
  proposedAmountPerMonth: string;
  reason?: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  createdAt: string;
}

export function PaymentPlans() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'denied' | 'cancelled' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [denyingPlan, setDenyingPlan] = useState<PaymentPlanRequest | null>(null);
  const limit = 10;

  const { data: plansResponse, isLoading, refetch } = useQuery({
    queryKey: ['paymentPlans', statusFilter, page],
    queryFn: () => invoiceService.getPaymentPlans({ page, limit, status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => invoiceService.approvePaymentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentPlans'] });
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to approve payment plan request.');
    },
  });

  const denyMutation = useMutation({
    mutationFn: (id: string) => invoiceService.denyPaymentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentPlans'] });
      setDenyingPlan(null);
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to deny payment plan request.');
    },
  });

  const formatCurrency = (amount: string, currencyCode: string) => {
    try {
      const num = parseFloat(amount);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
      }).format(num);
    } catch {
      return `${currencyCode} ${amount}`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const plansList = (plansResponse?.data || []) as PaymentPlanRequest[];
  const pagination = plansResponse?.pagination || { total: 0, totalPages: 1 };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20 rounded-full px-2.5 py-0.5 text-xs">Approved</Badge>;
      case 'denied':
        return <Badge variant="danger" className="bg-red-950/40 text-red-400 border border-red-900/50 rounded-full px-2.5 py-0.5 text-xs">Denied</Badge>;
      case 'cancelled':
        return <Badge variant="warning" className="bg-[#141516] text-[#8a8f98] border border-[#23252a] rounded-full px-2.5 py-0.5 text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="warning" className="bg-amber-950/40 text-amber-300 border border-amber-900/50 rounded-full px-2.5 py-0.5 text-xs">Pending Review</Badge>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4">
      {/* Top Fixed Area (Header & Controls) */}
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1e2025]/80">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">Payment Plan Management</h1>
            <p className="text-xs text-[#8a8f98] mt-1">
              Review and manage installment plan proposals submitted by debtors.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-xl text-xs font-semibold border border-[#1e2025] bg-[#13161c] text-[#f7f8f8] hover:bg-[#1d212a] transition-all h-9 px-3.5 shadow-none active:scale-[0.98] cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-[#0f1011] border border-[#23252a] rounded-xl flex-wrap w-fit max-w-full">
          {(['pending', 'approved', 'denied', 'cancelled', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#18191c] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                  : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
              }`}
            >
              {tab === 'pending' ? 'Pending Review' : tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl p-4 flex items-start gap-3 relative shadow-none animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-xs text-red-300">Action Failed</h3>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="absolute top-3.5 right-3.5 text-red-400 hover:text-red-300 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area (Scrollable Cards or Empty State) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-7 w-7 animate-spin text-[#5e6ad2] mb-3" />
            <p className="text-xs text-[#8a8f98]">Loading plan requests...</p>
          </div>
        ) : plansList.length === 0 ? (
          <div className="border border-dashed border-[#1e2025] bg-[#13161c]/30 rounded-2xl py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[#f7f8f8] text-sm">No proposals found</h3>
            <p className="text-xs text-[#8a8f98] max-w-sm leading-relaxed">
              There are no payment plan proposals matching the selected filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plansList.map((plan) => (
              <Card key={plan.id} className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl overflow-hidden hover:border-[#2e3444] transition-all">
                <CardHeader className="bg-[#13161c]/80 border-b border-[#1e2025]/80 py-3 px-5 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/invoices/${plan.invoiceId}`}
                      className="font-bold text-xs text-[#5e6ad2] hover:text-[#828fff] transition-colors inline-flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {plan.invoiceNo}
                    </Link>
                    {getStatusBadge(plan.status)}
                  </div>
                  <div className="text-[11px] text-[#8a8f98] flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#62666d]" />
                    Submitted {formatDate(plan.createdAt)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* 4 Metrics in 1 single horizontal row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Client Name</p>
                        <p className="text-xs font-medium text-[#f7f8f8] mt-0.5 truncate">{plan.clientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Invoice Balance</p>
                        <p className="text-xs font-semibold text-[#f7f8f8] mt-0.5 font-mono">
                          {formatCurrency(plan.invoiceAmount, plan.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Plan Terms</p>
                        <p className="text-xs font-medium text-[#f7f8f8] mt-0.5">{plan.installments} Months</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Monthly Payment</p>
                        <p className="text-xs font-bold text-[#5e6ad2] mt-0.5 font-mono">
                          {formatCurrency(plan.proposedAmountPerMonth, plan.currency)} / mo
                        </p>
                      </div>
                    </div>

                    {/* Actions pane - only visible when pending */}
                    {plan.status === 'pending' && (
                      <div className="flex items-center gap-2 lg:pl-4 lg:border-l lg:border-[#1e2025]/80 flex-shrink-0">
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                          <button
                            onClick={() => approveMutation.mutate(plan.id)}
                            disabled={approveMutation.isPending || denyMutation.isPending}
                            className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-[#27a644] hover:bg-[#208a38] text-white h-8.5 px-3.5 transition-all active:scale-[0.98] disabled:opacity-40 shadow-none cursor-pointer whitespace-nowrap"
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setDenyingPlan(plan)}
                            disabled={approveMutation.isPending || denyMutation.isPending}
                            className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-[#13161c] border border-red-900/50 hover:bg-red-950/40 text-red-400 h-8.5 px-3.5 transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Deny
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {plan.reason && (
                    <div className="mt-3 pt-2.5 border-t border-[#1e2025]/80 text-xs text-[#8a8f98] flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold text-[#8a8f98] flex-shrink-0">Reason:</span>
                      <span className="italic text-[#d0d6e0] truncate">&ldquo;{plan.reason}&rdquo;</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[#1e2025]/80">
                <span className="text-xs text-[#8a8f98]">
                  Page {page} of {pagination.totalPages} ({pagination.total} total items)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-xl text-xs font-medium border border-[#1e2025] bg-[#13161c] text-[#f7f8f8] hover:bg-[#1d212a] transition-all h-8 px-3 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="inline-flex items-center justify-center rounded-xl text-xs font-medium border border-[#1e2025] bg-[#13161c] text-[#f7f8f8] hover:bg-[#1d212a] transition-all h-8 px-3 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deny Confirmation Modal */}
      {denyingPlan && (
        <Modal
          isOpen={!!denyingPlan}
          onClose={() => setDenyingPlan(null)}
          title="Deny Payment Plan Proposal"
          className="max-w-md"
        >
          <div className="space-y-4 text-[#f7f8f8]">
            <div className="p-3.5 bg-[#0e1013]/60 border border-[#1e2025] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8a8f98]">Invoice No:</span>
                <span className="font-bold text-[#f7f8f8] font-mono">{denyingPlan.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8f98]">Client:</span>
                <span className="font-medium text-[#f7f8f8]">{denyingPlan.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8f98]">Invoice Balance:</span>
                <span className="font-semibold text-[#f7f8f8] font-mono">{formatCurrency(denyingPlan.invoiceAmount, denyingPlan.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8a8f98]">Proposed Terms:</span>
                <span className="font-semibold text-[#5e6ad2] font-mono">{denyingPlan.installments} Months ({formatCurrency(denyingPlan.proposedAmountPerMonth, denyingPlan.currency)}/mo)</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-[#1e2025]">
              <button
                type="button"
                onClick={() => setDenyingPlan(null)}
                disabled={denyMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl text-xs font-semibold border border-[#1e2025] bg-[#13161c] hover:bg-[#1d212a] text-[#f7f8f8] h-8.5 px-4 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  denyMutation.mutate(denyingPlan.id);
                }}
                disabled={denyMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 h-8.5 px-4 gap-1.5 transition-all cursor-pointer"
              >
                {denyMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Denying...
                  </>
                ) : (
                  "Confirm Deny"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}



