import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "../services/invoice";
import { eventService } from "../services/event";
import { agentService } from "../services/agent";
import { TriggerFollowupModal } from "../components/invoices/TriggerFollowupModal";
import { communicationService } from "../services/communication";
import { settingsService } from "../services/settings";
import { Badge } from "../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { PaymentWarningModal } from "../components/common/PaymentWarningModal";
import { usePaymentWarning } from "../hooks/usePaymentWarning";
import { useAuth } from "../contexts/AuthContext";
import { EditInvoiceModal } from "../components/invoices/EditInvoiceModal";
import { Modal } from "../components/ui/Modal";
import { CommunicationList } from "../components/invoices/CommunicationList";
import { CommunicationStats } from "../components/invoices/CommunicationStats";
import { getErrorMessage } from "../utils/error-utils";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  AlertTriangle,
  Edit,
  CheckCircle2,
  Zap,
  Loader2,
  Send,
  MessageSquare,
  FileText,
  Trash2
} from "lucide-react";



const formatCurrency = (val: string | number) => {
  return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
};

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'emails'>('timeline');
  const [error, setError] = useState<string | null>(null);

  // Timeline Filters & Pagination State
  const [timelinePage, setTimelinePage] = useState(1);
  const [timelineSourceFilter, setTimelineSourceFilter] = useState<string>('all');
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<string>('all');
  const [accumulatedTimeline, setAccumulatedTimeline] = useState<any[]>([]);
  const [totalTimelineCount, setTotalTimelineCount] = useState(0);

  const { data: invoice, isLoading: isInvoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
  });

  const getActionTypesForCategory = (category: string): string[] | undefined => {
    switch (category) {
      case 'status':
        return ['invoice.status_changed'];
      case 'emails':
        return [
          'followup.triggered',
          'followup.sent',
          'followup.skipped',
          'followup.halted',
          'followup.email_opened',
          'followup.email_clicked',
          'followup.bounced',
        ];
      case 'payments':
        return ['payment.link_generated', 'payment.received'];
      default:
        return undefined;
    }
  };

  const activeActionTypes = getActionTypesForCategory(timelineCategoryFilter);
  const activeSources = timelineSourceFilter !== 'all' ? [timelineSourceFilter] : undefined;

  const { data: timelineResponse, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["invoice-timeline", id, timelinePage, timelineSourceFilter, timelineCategoryFilter],
    queryFn: () => eventService.getInvoiceTimeline(id!, {
      page: timelinePage,
      limit: 10,
      actionTypes: activeActionTypes,
      sources: activeSources,
    }),
    enabled: !!id,
  });

  useEffect(() => {
    if (timelineResponse?.data) {
      if (timelinePage === 1) {
        setAccumulatedTimeline(timelineResponse.data);
      } else {
        setAccumulatedTimeline(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniqueNew = timelineResponse.data.filter((e: any) => !existingIds.has(e.id));
          return [...prev, ...uniqueNew];
        });
      }
      setTotalTimelineCount(timelineResponse.pagination.total);
    }
  }, [timelineResponse, timelinePage]);

  // Reset timeline to page 1 whenever the invoice data updates (indicates a mutation occurred)
  useEffect(() => {
    if (invoice) {
      setTimelinePage(1);
      setAccumulatedTimeline([]);
    }
  }, [invoice?.updatedAt]);

  const handleSourceFilterChange = (source: string) => {
    setTimelineSourceFilter(source);
    setTimelinePage(1);
    setAccumulatedTimeline([]);
  };

  const handleCategoryFilterChange = (category: string) => {
    setTimelineCategoryFilter(category);
    setTimelinePage(1);
    setAccumulatedTimeline([]);
  };

  const { data: communications, isLoading: isCommsLoading } = useQuery({
    queryKey: ["invoice-communications", id],
    queryFn: () => communicationService.getInvoiceCommunications(id!),
    enabled: !!id,
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

  const { showModal: showPaymentModal, runWithWarningCheck, handleConfirm: handlePaymentConfirm, handleCancel: handlePaymentCancel } =
    usePaymentWarning({ integrations, settings });

  const statusMutation = useMutation({
    mutationFn: (status: string) => invoiceService.updateInvoiceStatus(id!, status),
    onMutate: () => setError(null),
    onError: (err: any) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-timeline", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
    }
  });

  const agentMutation = useMutation({
    mutationFn: (tone?: string) => agentService.runAgentForInvoice(id!, tone),
    onMutate: () => setError(null),
    onError: (err: any) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-timeline", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-communications", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    }
  });

  const handleTriggerFollowup = () => {
    setIsFollowupModalOpen(true);
  };

  const handleConfirmFollowup = (tone: string) => {
    setIsFollowupModalOpen(false);
    runWithWarningCheck(() => agentMutation.mutate(tone));
  };

  const deleteMutation = useMutation({
    mutationFn: () => invoiceService.deleteInvoice(id!),
    onMutate: () => setError(null),
    onError: (err: any) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      navigate('/invoices');
    }
  });

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const generateLinkMutation = useMutation({
    mutationFn: () => invoiceService.generatePaymentLink(id!),
    onMutate: () => setError(null),
    onError: (err: any) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    }
  });

  if (isInvoiceLoading || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Loading invoice details...</p>
      </div>
    );
  }

  const renderEventIcon = (actionOrEventType: string) => {
    const type = actionOrEventType.toLowerCase();
    if (type.includes('create') || type.includes('import')) {
      return <FileText className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes('sent')) {
      return <Send className="w-4 h-4 text-blue-600" />;
    }
    if (type.includes('opened') || type.includes('clicked')) {
      return <Mail className="w-4 h-4 text-purple-600" />;
    }
    if (type.includes('received') || type.includes('status')) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (type.includes('halt') || type.includes('bounce') || type.includes('dlq') || type.includes('error')) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return <MessageSquare className="w-4 h-4 text-slate-600" />;
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ui':
        return <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Human</span>;
      case 'agent':
        return <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Agent</span>;
      case 'webhook':
        return <span className="bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Webhook</span>;
      case 'system':
      default:
        return <span className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">System</span>;
    }
  };

  const getEventTitle = (event: any) => {
    if (event.description) return event.description;
    const action = event.actionType || event.eventType || 'event';
    return action
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderEventDescription = (event: any) => {
    const payload = event.payload;
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    if (type.includes('halted') || type.includes('bounced')) {
      if (payload?.error) {
        return (
          <div>
            <p className="font-semibold text-red-600">Follow-up failed with error</p>
            <p className="text-xs text-slate-600 mt-1 bg-red-50 p-2 border border-red-100 rounded font-mono">
              {getErrorMessage(payload.error)}
            </p>
          </div>
        );
      }
      if (payload?.reason === 'no_automated_channel') {
        return (
          <div>
            <p className="font-semibold text-slate-800">Follow-up halted</p>
            <p className="text-xs text-slate-600 mt-1">
              No automated communication channels configured for the <span className="font-mono bg-slate-100 px-1 rounded">{payload.tier || 'unknown'}</span> tier.
            </p>
          </div>
        );
      }
    }
    if (type.includes('skipped')) {
      return (
        <div>
          <p className="font-semibold text-slate-800">Follow-up skipped</p>
          <p className="text-xs text-slate-600 mt-1">
            Skipped because a follow-up was recently sent.
          </p>
        </div>
      );
    }
    if (payload?.subject) {
      return (
        <div>
          <p className="text-xs text-slate-500 font-mono bg-slate-50 p-1 rounded">Subject: {payload.subject}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Link */}
      <div>
        <Link to="/invoices" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3 relative shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Action Failed</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{invoice.invoiceNo}</h1>
            <Badge variant={
              invoice.paymentStatus === 'Paid' ? 'success' : 
              invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
            }>
              {invoice.paymentStatus}
            </Badge>
          </div>
          <p className="text-3xl font-light text-slate-900 mt-4">
            {formatCurrency(invoice.invoiceAmount)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 md:justify-end">
          
          {user?.role !== 'viewer' && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </button>

              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 h-10 px-4 py-2 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </button>
              )}

              {invoice.paymentStatus !== 'Paid' && (
                <>
                  <button
                    onClick={() => statusMutation.mutate('Paid')}
                    disabled={statusMutation.isPending}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 h-10 px-4 py-2 disabled:opacity-50"
                  >
                    {statusMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Mark as Paid
                  </button>

                  <button
                    onClick={handleTriggerFollowup}
                    disabled={agentMutation.isPending}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 disabled:opacity-50"
                  >
                    {agentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Trigger Follow-up
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Grid */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Company</p>
                <p className="font-medium text-slate-900">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Contact</p>
                <div className="flex items-center text-slate-900">
                  <Mail className="mr-2 h-4 w-4 text-slate-400" />
                  <a href={`mailto:${invoice.contactEmail}`} className="hover:text-blue-600 hover:underline">{invoice.contactEmail}</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.subject && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Invoice Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{invoice.subject}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Aging &amp; Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Due Date</p>
                <div className="flex items-center text-slate-900">
                  <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                  {new Date(invoice.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500">Days Overdue</p>
                <p className={`font-semibold ${invoice.daysOverdue && invoice.daysOverdue > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {invoice.daysOverdue || 0}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500">Follow-ups Sent</p>
                <p className="font-semibold text-slate-900">{invoice.followupCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-2">Payment Link</p>
                {invoice.paymentLink ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        invoice.paymentLink.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        invoice.paymentLink.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        invoice.paymentLink.status === 'cancelled' ? 'bg-slate-100 text-slate-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.paymentLink.status.charAt(0).toUpperCase() + invoice.paymentLink.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={invoice.paymentLink.url} 
                        className="w-full text-xs p-1.5 border border-slate-200 rounded bg-slate-50 text-slate-600 truncate"
                        title={invoice.paymentLink.url}
                      />
                      {invoice.paymentLink.status === 'active' && invoice.paymentStatus !== 'Paid' && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(invoice.paymentLink!.url)}
                          className="px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50 transition-colors flex-shrink-0"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 italic">
                      No active payment link generated yet.
                      {invoice.paymentStatus !== 'Paid' && <p className="text-xs text-slate-400 mt-1">A fallback link from settings may be used in emails.</p>}
                    </div>
                    {invoice.paymentStatus !== 'Paid' && user?.role !== 'viewer' && (
                      <button
                        onClick={() => generateLinkMutation.mutate()}
                        disabled={generateLinkMutation.isPending}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 h-8 px-3 disabled:opacity-50"
                      >
                        {generateLinkMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Generate Payment Link
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Area */}
        <div className="md:col-span-2">
          <Card id="history-tabs" className="h-full">
            <div className="flex border-b border-slate-200">
              <button
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'timeline' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('timeline')}
              >
                Event Timeline
              </button>
              <button
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'emails' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                onClick={() => setActiveTab('emails')}
              >
                Emails & Messages
              </button>
            </div>
            
            <CardContent className="pt-6">
              {activeTab === 'timeline' ? (
                // TIMELINE TAB
                <div>
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-slate-100 justify-between items-start sm:items-center">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Source</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { value: 'all', label: 'All' },
                          { value: 'ui', label: 'Human' },
                          { value: 'agent', label: 'Agent' },
                          { value: 'webhook', label: 'Webhook' },
                          { value: 'system', label: 'System' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSourceFilterChange(opt.value)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                              timelineSourceFilter === opt.value
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Category</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { value: 'all', label: 'All' },
                          { value: 'status', label: 'Status' },
                          { value: 'emails', label: 'Emails' },
                          { value: 'payments', label: 'Payments' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleCategoryFilterChange(opt.value)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                              timelineCategoryFilter === opt.value
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs text-slate-500 font-medium">
                      Showing {accumulatedTimeline.length} of {totalTimelineCount} events
                    </span>
                  </div>

                  {isTimelineLoading && accumulatedTimeline.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : accumulatedTimeline.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No events recorded matching the criteria.
                    </div>
                  ) : (
                    <div className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
                      {accumulatedTimeline.map((event) => (
                        <div key={event.id} className="relative pl-8">
                          <div className="absolute -left-3.5 top-1.5 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            {renderEventIcon(event.actionType || event.eventType)}
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-all duration-200">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1.5 mb-2">
                              <span className="font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                                {getEventTitle(event)}
                              </span>
                              <div className="flex items-center gap-2">
                                {getSourceBadge(event.source)}
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                  {new Date(event.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Event details and payload description */}
                            {renderEventDescription(event) && (
                              <div className="text-sm text-slate-600 mt-2 bg-white/50 p-2.5 rounded-lg border border-slate-100">
                                {renderEventDescription(event)}
                              </div>
                            )}

                            {/* Diff Viewer Table */}
                            {(event.oldValues || event.newValues) && (
                              <div className="mt-3 border-t border-slate-100 pt-3">
                                <table className="min-w-full divide-y divide-slate-100 text-xs">
                                  <thead>
                                    <tr>
                                      <th className="text-left font-semibold text-slate-500 py-1 uppercase tracking-wider">Field</th>
                                      <th className="text-left font-semibold text-slate-500 py-1 uppercase tracking-wider">Before</th>
                                      <th className="text-left font-semibold text-slate-500 py-1 uppercase tracking-wider">&rarr;</th>
                                      <th className="text-left font-semibold text-slate-500 py-1 uppercase tracking-wider">After</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {Object.keys({ ...event.oldValues, ...event.newValues }).map((key) => {
                                      const oldVal = event.oldValues?.[key];
                                      const newVal = event.newValues?.[key];
                                      if (oldVal === newVal) return null;
                                      return (
                                        <tr key={key} className="hover:bg-slate-100/50">
                                          <td className="font-semibold text-slate-700 py-1.5 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                                          <td className="text-slate-500 py-1.5 font-mono max-w-[120px] truncate" title={String(oldVal ?? '-')}>{String(oldVal ?? '-')}</td>
                                          <td className="text-slate-400 py-1.5">&rarr;</td>
                                          <td className="text-slate-800 font-semibold py-1.5 font-mono max-w-[120px] truncate" title={String(newVal ?? '-')}>{String(newVal ?? '-')}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Legacy / agent run payload view */}
                            {!event.oldValues && !event.newValues && event.payload && (
                              <div className="mt-2 text-xs text-slate-500 bg-slate-100/40 border border-slate-100 rounded-lg p-2.5 space-y-1 font-mono">
                                {Object.entries(event.payload).map(([k, v]) => {
                                  if (v === null || v === undefined || k === 'error' || k === 'reason') return null;
                                  return (
                                    <div key={k} className="flex gap-2">
                                      <span className="font-semibold text-slate-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                      <span className="text-slate-700 select-all truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Actor Circle Initials Chip */}
                            {event.actorName && (
                              <div className="mt-3 flex items-center">
                                <div 
                                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium cursor-help transition-colors"
                                  title={`${event.actorName} (${event.actorEmail || ''})`}
                                >
                                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold flex items-center justify-center">
                                    {event.actorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </span>
                                  <span>{event.actorName} · <span className="text-[10px] text-slate-500 capitalize">{event.actorRole || 'Member'}</span></span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Load More Button */}
                  {totalTimelineCount > accumulatedTimeline.length && (
                    <div className="flex justify-center pt-6 border-t border-slate-100 mt-6">
                      <button
                        onClick={() => setTimelinePage(prev => prev + 1)}
                        disabled={isTimelineLoading}
                        className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-sm font-semibold rounded-lg bg-white text-slate-700 shadow-sm hover:shadow transition-all disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {isTimelineLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                        Load More Events
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // EMAILS TAB
                isCommsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div>
                    <CommunicationStats communications={communications || []} />
                    <CommunicationList communications={communications || []} />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {invoice && (
        <EditInvoiceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          invoice={invoice}
        />
      )}

      {invoice && (
        <TriggerFollowupModal
          isOpen={isFollowupModalOpen}
          onClose={() => setIsFollowupModalOpen(false)}
          onConfirm={handleConfirmFollowup}
          invoice={invoice}
          isPending={agentMutation.isPending}
        />
      )}

      {showPaymentModal && (
        <PaymentWarningModal
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This action cannot be undone. All event logs, metrics, and associated data for Invoice <strong>{invoice.invoiceNo}</strong> will be permanently soft-deleted.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-sm font-semibold rounded-lg bg-white text-slate-700 shadow-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold text-white rounded-lg shadow-sm transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Invoice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
