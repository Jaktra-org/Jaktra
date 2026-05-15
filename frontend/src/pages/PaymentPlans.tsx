import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice';
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

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
        return <Badge variant="success" className="bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">Approved</Badge>;
      case 'denied':
        return <Badge variant="danger" className="bg-red-950/40 text-red-400 border border-red-900/50">Denied</Badge>;
      case 'cancelled':
        return <Badge variant="warning" className="bg-[#141516] text-[#8a8f98] border border-[#23252a]">Cancelled</Badge>;
      default:
        return <Badge variant="warning" className="bg-amber-950/40 text-amber-300 border border-amber-900/50">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">Payment Plan Management</h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">
            Review and manage installment plan proposals submitted by debtors.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] h-8 px-3 self-start sm:self-auto"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#23252a] pb-3">
        {(['pending', 'approved', 'denied', 'cancelled', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusFilter(tab);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              statusFilter === tab
                ? 'bg-[#5e6ad2] text-white shadow-none'
                : 'bg-[#0f1011] border border-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#141516]'
            }`}
          >
            {tab === 'pending' ? 'Pending Review' : tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl p-4 flex items-start gap-3 relative shadow-none">
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-7 w-7 animate-spin text-[#5e6ad2] mb-3" />
          <p className="text-xs text-[#8a8f98]">Loading plan requests...</p>
        </div>
      ) : plansList.length === 0 ? (
        <Card className="border-dashed border border-[#23252a] bg-[#0f1011]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-9 w-9 text-[#3e3e44] mb-2.5" />
            <h3 className="font-semibold text-[#f7f8f8] text-sm">No proposals found</h3>
            <p className="text-xs text-[#8a8f98] mt-1 max-w-sm">
              There are no payment plan proposals matching the selected filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plansList.map((plan) => (
            <Card key={plan.id} className="border border-[#23252a] bg-[#0f1011] overflow-hidden">
              <CardHeader className="bg-[#010102]/60 border-b border-[#23252a] py-3 px-5 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/invoices/${plan.invoiceId}`}
                    className="font-semibold text-xs text-[#5e6ad2] hover:text-[#828fff] transition-colors"
                  >
                    {plan.invoiceNo}
                  </Link>
                  {getStatusBadge(plan.status)}
                </div>
                <div className="text-[11px] text-[#8a8f98] flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Submitted {formatDate(plan.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Proposal details */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Client Name</p>
                        <p className="text-xs font-medium text-[#f7f8f8] mt-1">{plan.clientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Invoice Balance</p>
                        <p className="text-xs font-semibold text-[#f7f8f8] mt-1">
                          {formatCurrency(plan.invoiceAmount, plan.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#23252a]">
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Plan Terms</p>
                        <p className="text-xs font-medium text-[#f7f8f8] mt-1">{plan.installments} Months</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Monthly Payment</p>
                        <p className="text-xs font-semibold text-[#5e6ad2] mt-1">
                          {formatCurrency(plan.proposedAmountPerMonth, plan.currency)} / mo
                        </p>
                      </div>
                    </div>

                    {plan.reason && (
                      <div className="pt-3 border-t border-[#23252a]">
                        <p className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold">Reason Submitted</p>
                        <p className="text-xs text-[#d0d6e0] mt-1 leading-relaxed italic bg-[#010102] p-2.5 rounded-lg border border-[#23252a]">
                          &ldquo;{plan.reason}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions pane */}
                  <div className="flex flex-col justify-center space-y-2 md:border-l md:border-[#23252a] md:pl-5">
                    {plan.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(plan.id)}
                          disabled={approveMutation.isPending || denyMutation.isPending}
                          className="w-full inline-flex items-center justify-center rounded-md text-xs font-medium bg-[#27a644] hover:bg-[#27a644]/90 text-white h-9 transition disabled:opacity-40"
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Approve Proposal
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to deny this payment plan proposal? The customer will be expected to settle the full balance.')) {
                              denyMutation.mutate(plan.id);
                            }
                          }}
                          disabled={approveMutation.isPending || denyMutation.isPending}
                          className="w-full inline-flex items-center justify-center rounded-md text-xs font-medium bg-[#0f1011] border border-red-900/50 hover:bg-red-950/40 text-red-400 h-9 transition disabled:opacity-40"
                        >
                          {denyMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Deny Proposal
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2.5 bg-[#010102] rounded-lg border border-[#23252a] text-xs text-[#8a8f98]">
                        Status: <span className="font-semibold capitalize text-[#f7f8f8]">{plan.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#23252a]">
              <span className="text-xs text-[#8a8f98]">
                Page {page} of {pagination.totalPages} ({pagination.total} total items)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] h-7 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] h-7 px-3 disabled:opacity-40"
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
  );
}

