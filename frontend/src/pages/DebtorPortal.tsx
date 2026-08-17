import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalService } from '../services/portal';
import { Loader2, AlertCircle, Calendar, CreditCard, FileText, Check } from 'lucide-react';

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

  const { data: installmentsData } = useQuery({
    queryKey: ['portal-installments', token],
    queryFn: () => portalService.getInstallments(token!),
    enabled: !!token && !!data?.invoice?.hasActivePaymentPlan,
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
    onError: (err: unknown) => {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Something went wrong submitting your request, please try again.";
      setPlanError(errMsg);
    }
  });

  const disputeMutation = useMutation({
    mutationFn: () => portalService.submitDispute(token!, { body: disputeReason }),
    onSuccess: () => {
      setDisputeSuccess(true);
      setDisputeReason('');
    },
    onError: (err: unknown) => {
      const errMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Something went wrong submitting your dispute, please try again.";
      setDisputeError(errMsg);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#010102] flex flex-col items-center justify-center text-[#f7f8f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8a8f98] mb-3" />
        <p className="text-[#8a8f98] text-xs font-medium">Retrieving invoice details...</p>
      </div>
    );
  }

  // Handle all validation failures (404, 410, or other connection errors) with the identical message
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#010102] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#0f1011] border border-[#23252a] rounded-2xl p-8 text-center shadow-none">
          <div className="h-12 w-12 bg-red-950/40 border border-red-900/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#f7f8f8] mb-1.5">Access Denied</h2>
          <p className="text-[#8a8f98] text-xs leading-relaxed">
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">
            Paid
          </span>
        );
      case 'Written Off':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#141516] text-[#8a8f98] border border-[#23252a]">
            No payment due
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-950/40 text-red-400 border border-red-900/50 animate-pulse">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
    <div className="min-h-screen bg-[#010102] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-[#f7f8f8] font-sans selection:bg-[#5e6ad2]/30 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative">
        {/* Brand Header */}
        <div className="flex items-center justify-center space-x-2.5 mb-8">
          <div className="h-9 w-9 bg-[#5e6ad2] rounded-lg flex items-center justify-center shadow-none">
            <FileText className="h-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#f7f8f8]">
            {tenant.companyName}
          </span>
        </div>

        {/* Invoice Main Dashboard */}
        <div className="bg-[#0f1011] border border-[#23252a] rounded-2xl shadow-none overflow-hidden">
          {/* Hero Header Area */}
          <div className="p-8 text-center border-b border-[#23252a] bg-[#010102]/40">
            <div className="mb-3">{getStatusBadge(invoice.paymentStatus)}</div>
            <p className="text-[11px] text-[#8a8f98] uppercase tracking-wider font-semibold mb-1">
              Outstanding Amount
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#f7f8f8]">
              {formatCurrency(invoice.invoiceAmount, invoice.currency)}
            </h1>
            <p className="text-xs text-[#8a8f98] mt-2 font-mono">
              Invoice #{invoice.invoiceNo}
            </p>
          </div>

          {/* Details Section */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="flex items-start space-x-3 p-3 bg-[#010102]/60 rounded-xl border border-[#23252a]">
                <div className="h-8 w-8 bg-[#141516] rounded-lg flex items-center justify-center text-[#5e6ad2] shrink-0 mt-0.5">
                  <CreditCard className="h-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8a8f98] font-medium uppercase tracking-wider">Billed To</p>
                  <p className="text-xs font-semibold text-[#f7f8f8] mt-0.5">{invoice.clientName}</p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-start space-x-3 p-3 bg-[#010102]/60 rounded-xl border border-[#23252a]">
                <div className="h-8 w-8 bg-[#141516] rounded-lg flex items-center justify-center text-[#5e6ad2] shrink-0 mt-0.5">
                  <Calendar className="h-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-[#8a8f98] font-medium uppercase tracking-wider">Due Date</p>
                  <p className="text-xs font-semibold text-[#f7f8f8] mt-0.5">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>

            {/* Pay Now or Plan Section */}
            {!isResolved && (
              <div className="pt-5 border-t border-[#23252a] space-y-5">
                {/* Tab Headers */}
                <div className="flex bg-[#010102] p-1 rounded-xl border border-[#23252a]">
                  <button
                    onClick={() => setActiveTab('pay')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      activeTab === 'pay'
                        ? 'bg-[#141516] text-[#f7f8f8] border border-[#23252a]'
                        : 'text-[#8a8f98] hover:text-[#f7f8f8]'
                    }`}
                  >
                    Pay Invoice
                  </button>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      activeTab === 'plan'
                        ? 'bg-[#141516] text-[#f7f8f8] border border-[#23252a]'
                        : 'text-[#8a8f98] hover:text-[#f7f8f8]'
                    }`}
                  >
                    Payment Plan
                  </button>
                  <button
                    onClick={() => setActiveTab('dispute')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      activeTab === 'dispute'
                        ? 'bg-[#141516] text-[#f7f8f8] border border-[#23252a]'
                        : 'text-[#8a8f98] hover:text-[#f7f8f8]'
                    }`}
                  >
                    Raise Dispute
                  </button>
                </div>

                {/* Pay Invoice Tab Pane */}
                {activeTab === 'pay' && (
                  <div className="space-y-4">
                    {payError && (
                      <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3.5 flex items-start space-x-3 text-red-400">
                        <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-xs">{payError}</p>
                      </div>
                    )}
                    {invoice.hasActivePaymentPlan ? (
                      <div className="bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl p-4 flex items-start space-x-3 text-[#27a644]">
                        <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Payment Plan Active</h4>
                          <p className="text-[11px] text-[#8a8f98] mt-0.5">
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
                        className="w-full py-3 px-5 rounded-md bg-[#5e6ad2] hover:bg-[#828fff] text-white font-medium text-xs shadow-none disabled:opacity-40 transition duration-150 flex items-center justify-center space-x-2"
                      >
                        {payMutation.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
                      <div className="space-y-4">
                        <div className="bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl p-4 flex items-start space-x-3 text-[#27a644]">
                          <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-semibold">Payment Plan Active</h4>
                            <p className="text-[11px] text-[#8a8f98] mt-0.5">
                              This invoice is currently under an active payment plan. Automated collection reminders are paused.
                            </p>
                          </div>
                        </div>

                        {installmentsData?.data && installmentsData.data.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider">Agreed Installment Schedule</h4>
                            <div className="bg-[#010102] border border-[#23252a] rounded-xl overflow-hidden divide-y divide-[#23252a] text-xs">
                              {installmentsData.data.map((item) => (
                                <div key={item.id} className="p-3 flex justify-between items-center">
                                  <div>
                                    <span className="font-semibold text-[#f7f8f8]">Installment #{item.installmentNumber}</span>
                                    <span className="block text-[11px] text-[#8a8f98]">Due {formatDate(item.dueDate)}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-[#5e6ad2]">{formatCurrency(item.amount, item.currency)}</span>
                                    <span className={`block text-[10px] font-semibold uppercase ${
                                      item.status === 'paid' ? 'text-[#27a644]' : item.status === 'overdue' ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : invoice.hasPendingPaymentPlan ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-amber-400">
                        <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Request Pending Review</h4>
                          <p className="text-[11px] text-[#8a8f98] mt-0.5">
                            Your request for a payment plan is pending review by our management team. We will notify you once a decision is made.
                          </p>
                        </div>
                      </div>
                    ) : planSuccess ? (
                      <div className="bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl p-4 flex items-start space-x-3 text-[#27a644]">
                        <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Request Submitted</h4>
                          <p className="text-[11px] text-[#8a8f98] mt-0.5">
                            Your request for a payment plan has been submitted successfully.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-[#8a8f98] mb-1">Installment Count</label>
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(parseInt(e.target.value))}
                            className="w-full bg-[#010102] border border-[#23252a] rounded-md px-3 py-2 text-xs text-[#f7f8f8] focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
                          >
                            <option value={3}>3 Months</option>
                            <option value={6}>6 Months</option>
                            <option value={9}>9 Months</option>
                            <option value={12}>12 Months</option>
                            <option value={18}>18 Months</option>
                            <option value={24}>24 Months</option>
                          </select>
                        </div>

                        <div className="bg-[#010102] p-2.5 rounded-lg border border-[#23252a] flex justify-between items-center text-xs">
                          <span className="text-[#8a8f98]">Monthly Amount:</span>
                          <span className="font-semibold text-[#f7f8f8]">
                            {formatCurrency((parseFloat(invoice.invoiceAmount) / installments).toString(), invoice.currency)} / month
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#8a8f98] mb-1">Reason for request</label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Please provide a brief reason..."
                            className="w-full bg-[#010102] border border-[#23252a] rounded-md px-3 py-2 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
                          />
                        </div>

                        {planError && (
                          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 flex items-start space-x-2.5 text-red-400">
                            <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs">{planError}</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setPlanError(null);
                            planMutation.mutate();
                          }}
                          disabled={planMutation.isPending}
                          className="w-full py-2.5 px-4 rounded-md bg-[#5e6ad2] hover:bg-[#828fff] text-white font-medium text-xs transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-40"
                        >
                          {planMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
                      <div className="bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl p-4 flex items-start space-x-3 text-[#27a644]">
                        <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-semibold">Dispute Submitted</h4>
                          <p className="text-[11px] text-[#8a8f98] mt-0.5">
                            Your dispute has been submitted and will be reviewed by our team.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-medium text-[#8a8f98] mb-1">Reason for dispute</label>
                          <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={4}
                            placeholder="Please explain the reason for raising a dispute..."
                            className="w-full bg-[#010102] border border-[#23252a] rounded-md px-3 py-2 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
                          />
                        </div>

                        {disputeError && (
                          <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-3 flex items-start space-x-2.5 text-red-400">
                            <AlertCircle className="h-4 h-4 shrink-0 mt-0.5" />
                            <p className="text-xs">{disputeError}</p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setDisputeError(null);
                            disputeMutation.mutate();
                          }}
                          disabled={disputeMutation.isPending}
                          className="w-full py-2.5 px-4 rounded-md bg-[#5e6ad2] hover:bg-[#828fff] text-white font-medium text-xs transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-40"
                        >
                          {disputeMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
              <div className="bg-[#27a644]/10 border border-[#27a644]/20 rounded-xl p-4 flex items-start space-x-3">
                <div className="h-5 w-5 bg-[#27a644]/20 text-[#27a644] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#27a644]">Payment Resolved</h4>
                  <p className="text-xs text-[#8a8f98] mt-0.5">
                    Thank you. This invoice is settled and requires no further action.
                    {invoice.paymentStatusChangedAt && (
                      <span className="block mt-1 text-[11px] text-[#8a8f98]">
                        Resolved on {formatDate(invoice.paymentStatusChangedAt)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {invoice.paymentStatus === 'Written Off' && (
              <div className="bg-[#141516] border border-[#23252a] rounded-xl p-4 flex items-start space-x-3">
                <div className="h-5 w-5 bg-[#23252a] text-[#8a8f98] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#f7f8f8]">Invoice Inactive</h4>
                  <p className="text-xs text-[#8a8f98] mt-0.5">
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
        <p className="text-[11px] text-[#8a8f98]">
          Secured by Jaktra Payment Infrastructure.
        </p>
      </div>
    </div>
  );
}

