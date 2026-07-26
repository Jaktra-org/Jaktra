import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalService } from '../services/portal';
import { Loader2, AlertCircle, Calendar, CreditCard, FileText } from 'lucide-react';

export function DebtorPortal() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['portal-invoice', token],
    queryFn: () => portalService.getInvoiceDetails(token!),
    enabled: !!token,
    retry: false,
  });

  const [payError, setPayError] = useState<string | null>(null);

  const payMutation = useMutation({
    mutationFn: () => portalService.payInvoice(token!),
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
    onError: () => {
      setPayError("Something went wrong generating your payment link, please try again.");
    }
  });

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pay' | 'plan' | 'dispute'>('pay');
  const [installments, setInstallments] = useState(3);
  const [reason, setReason] = useState('');
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState(false);

  const [disputeReason, setDisputeReason] = useState('');
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const planMutation = useMutation({
    mutationFn: () => portalService.submitPaymentPlan(token!, { installments, reason }),
    onSuccess: () => {
      setPlanSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['portal-invoice', token] });
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.error?.message || "Something went wrong submitting your request, please try again.";
      setPlanError(errMsg);
    }
  });

  const disputeMutation = useMutation({
    mutationFn: () => portalService.submitDispute(token!, { body: disputeReason }),
    onSuccess: () => {
      setDisputeSuccess(true);
      setDisputeReason('');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.error?.message || "Something went wrong submitting your dispute, please try again.";
      setDisputeError(errMsg);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm font-medium">Retrieving invoice details...</p>
      </div>
    );
  }

  // Handle all validation failures (404, 410, or other connection errors) with the identical message
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="h-14 w-14 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            This link is no longer valid or does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { invoice, tenant } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Paid
          </span>
        );
      case 'Written Off':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            No payment due
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
    }
  };

  const formatCurrency = (amount: string, code: string) => {
    try {
      const num = parseFloat(amount);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: code || 'INR',
      }).format(num);
    } catch {
      return `${code} ${amount}`;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isResolved = invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Written Off';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {tenant.companyName}
          </span>
        </div>

        {/* Invoice Main Dashboard */}
        <div className="bg-slate-900/40 backdrop-blur-lg border border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/10 overflow-hidden">
          {/* Hero Header Area */}
          <div className="p-8 text-center border-b border-slate-800 bg-slate-900/20">
            <div className="mb-3">{getStatusBadge(invoice.paymentStatus)}</div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
              Outstanding Amount
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent">
              {formatCurrency(invoice.invoiceAmount, invoice.currency)}
            </h1>
            <p className="text-xs text-slate-500 mt-2">
              Invoice #{invoice.invoiceNo}
            </p>
          </div>

          {/* Details Section */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Client Info */}
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 bg-slate-800/80 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Billed To</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{invoice.clientName}</p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 bg-slate-800/80 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Pay Now or Plan Section */}
            {!isResolved && (
              <div className="pt-6 border-t border-slate-800 space-y-6">
                {/* Tab Headers */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                  <button
                    onClick={() => setActiveTab('pay')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                      activeTab === 'pay'
                        ? 'bg-slate-900 text-slate-100 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pay Invoice
                  </button>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                      activeTab === 'plan'
                        ? 'bg-slate-900 text-slate-100 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Payment Plan
                  </button>
                  <button
                    onClick={() => setActiveTab('dispute')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                      activeTab === 'dispute'
                        ? 'bg-slate-900 text-slate-100 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raise Dispute
                  </button>
                </div>

                {/* Pay Invoice Tab Pane */}
                {activeTab === 'pay' && (
                  <div className="space-y-4">
                    {payError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-xs">{payError}</p>
                      </div>
                    )}
                    {invoice.hasActivePaymentPlan ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-emerald-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Payment Plan Active</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            This invoice is currently under an active payment plan. Automated collection reminders are paused.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setPayError(null);
                          payMutation.mutate();
                        }}
                        disabled={payMutation.isPending}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
                      >
                        {payMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating payment checkout...</span>
                          </>
                        ) : (
                          <span>Pay Invoice Now</span>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Request Payment Plan Tab Pane */}
                {activeTab === 'plan' && (
                  <div className="space-y-4">
                    {invoice.hasActivePaymentPlan ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-emerald-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Payment Plan Active</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            This invoice is currently under an active payment plan. normal collection calls have been paused.
                          </p>
                        </div>
                      </div>
                    ) : invoice.hasPendingPaymentPlan ? (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-amber-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Request Pending Review</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Your request for a payment plan is pending review by our management team. We will notify you once a decision is made.
                          </p>
                        </div>
                      </div>
                    ) : planSuccess ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-emerald-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Request Submitted</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Your request for a payment plan has been submitted successfully.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Installment Count</label>
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value={3}>3 Months</option>
                            <option value={6}>6 Months</option>
                            <option value={9}>9 Months</option>
                            <option value={12}>12 Months</option>
                            <option value={18}>18 Months</option>
                            <option value={24}>24 Months</option>
                          </select>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                          <span className="text-slate-400">Monthly Amount:</span>
                          <span className="font-semibold text-slate-200">
                            {formatCurrency((parseFloat(invoice.invoiceAmount) / installments).toString(), invoice.currency)} / month
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Reason for request</label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Please provide a brief reason..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {planError && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="text-xs">{planError}</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setPlanError(null);
                            planMutation.mutate();
                          }}
                          disabled={planMutation.isPending}
                          className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition duration-200 flex items-center justify-center space-x-2"
                        >
                          {planMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              <span>Submitting Plan...</span>
                            </>
                          ) : (
                            <span>Submit Plan Request</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Raise Dispute Tab Pane */}
                {activeTab === 'dispute' && (
                  <div className="space-y-4">
                    {disputeSuccess ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3 text-emerald-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Dispute Submitted</h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Your dispute has been submitted and will be reviewed by our team.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Reason for dispute</label>
                          <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={4}
                            placeholder="Please explain the reason for raising a dispute..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {disputeError && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3 text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="text-xs">{disputeError}</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setDisputeError(null);
                            disputeMutation.mutate();
                          }}
                          disabled={disputeMutation.isPending}
                          className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition duration-200 flex items-center justify-center space-x-2"
                        >
                          {disputeMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              <span>Submitting Dispute...</span>
                            </>
                          ) : (
                            <span>Submit Dispute</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Success Banner if Resolved */}
            {invoice.paymentStatus === 'Paid' && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <div className="h-6 w-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400">Payment Resolved</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Thank you. This invoice is settled and requires no further action.
                    {invoice.paymentStatusChangedAt && (
                      <span className="block mt-1 text-[11px] text-slate-500">
                        Resolved on {formatDate(invoice.paymentStatusChangedAt)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {invoice.paymentStatus === 'Written Off' && (
              <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-4 flex items-start space-x-3">
                <div className="h-6 w-6 bg-slate-500/10 text-slate-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">Invoice Inactive</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No payment is currently due on this invoice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mt-12 relative z-10">
        <p className="text-xs text-slate-500">
          Secured by Jaktra Payment Infrastructure.
        </p>
      </div>
    </div>
  );
}
