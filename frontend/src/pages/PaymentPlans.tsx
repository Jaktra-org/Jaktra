import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../services/invoice';
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar, RefreshCw } from 'lucide-react';
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
  createdAt: string;
}

export function PaymentPlans() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: plansResponse, isLoading, refetch } = useQuery({
    queryKey: ['pendingPaymentPlans'],
    queryFn: () => invoiceService.getPendingPaymentPlans({ limit: 25 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => invoiceService.approvePaymentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPaymentPlans'] });
    },
    onError: (err: unknown) => {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to approve payment plan request.');
    },
  });

  const denyMutation = useMutation({
    mutationFn: (id: string) => invoiceService.denyPaymentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPaymentPlans'] });
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Plan Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage installment plan proposals submitted by debtors.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 h-9 px-3"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3 relative shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm font-medium">Action Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700 focus:outline-none"
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Loading plan requests...</p>
        </div>
      ) : plansList.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-800 text-base">All caught up!</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              There are no pending payment plan requests awaiting review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {plansList.map((plan) => (
            <Card key={plan.id} className="border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-slate-900">{plan.invoiceNo}</span>
                  <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">
                    Pending Review
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Submitted {formatDate(plan.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Proposal details */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Client Name</p>
                        <p className="text-sm font-medium text-slate-900 mt-1">{plan.clientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Invoice Balance</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          {formatCurrency(plan.invoiceAmount, plan.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Plan Terms</p>
                        <p className="text-sm font-medium text-slate-950 mt-1">{plan.installments} Months</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Monthly Payment</p>
                        <p className="text-sm font-semibold text-indigo-600 mt-1">
                          {formatCurrency(plan.proposedAmountPerMonth, plan.currency)} / mo
                        </p>
                      </div>
                    </div>

                    {plan.reason && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Reason Submitted</p>
                        <p className="text-sm text-slate-700 mt-1 leading-relaxed italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          &ldquo;{plan.reason}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions pane */}
                  <div className="flex flex-col justify-center space-y-2 md:border-l md:border-slate-100 md:pl-6">
                    <button
                      onClick={() => approveMutation.mutate(plan.id)}
                      disabled={approveMutation.isPending || denyMutation.isPending}
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-10 transition disabled:opacity-50"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
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
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-white border border-red-200 hover:bg-red-50 text-red-700 h-10 transition disabled:opacity-50"
                    >
                      {denyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Deny Proposal
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
