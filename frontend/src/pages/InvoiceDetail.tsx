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
  Trash2,
  DollarSign,
  Clock,
  Send,
  Eye,
  MousePointer,
  FileText,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  XCircle
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

  // Timeline Pagination State
  const [timelinePage, setTimelinePage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeHoverCard, setActiveHoverCard] = useState<{
    eventId: string;
    name: string;
    role: string | null;
    email: string | null;
  } | null>(null);
  const [accumulatedTimeline, setAccumulatedTimeline] = useState<any[]>([]);
  const [totalTimelineCount, setTotalTimelineCount] = useState(0);

  const { data: invoice, isLoading: isInvoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
  });

  const { data: timelineResponse, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["invoice-timeline", id, timelinePage],
    queryFn: () => eventService.getInvoiceTimeline(id!, {
      page: timelinePage,
      limit: 10,
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
    }
  }, [invoice?.updatedAt]);

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

  const renderEventIcon = (event: any) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    // 1. Paid status or payment received
    if (type.includes('received') || (event.newValues && event.newValues.paymentStatus === 'Paid')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    
    // 2. Invoice update changes
    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const changedKeys = Object.keys({ ...event.oldValues, ...event.newValues });
      
      // Money change (amount)
      if (changedKeys.includes('invoiceAmount')) {
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      }
      
      // Date change (due date)
      if (changedKeys.includes('dueDate')) {
        return <Clock className="w-4 h-4 text-amber-500" />;
      }

      // Status change
      if (changedKeys.includes('paymentStatus')) {
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      }
    }
    if (type === 'invoice.trashed') {
      return <Trash2 className="w-4 h-4 text-amber-500" />;
    }
    if (type === 'invoice.restored') {
      return <RotateCcw className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'invoice.permanently_deleted') {
      return <XCircle className="w-4 h-4 text-rose-600" />;
    }

    // 3. Fallbacks based on action/event types
    if (type.includes('create') || type.includes('import')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    }
    if (type.includes('sent')) {
      return <Send className="w-4 h-4 text-indigo-600" />;
    }
    if (type.includes('opened')) {
      return <Eye className="w-4 h-4 text-purple-600" />;
    }
    if (type.includes('clicked')) {
      return <MousePointer className="w-4 h-4 text-indigo-600" />;
    }
    if (type.includes('received') || type.includes('status')) {
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    }
    if (type.includes('halt') || type.includes('bounce') || type.includes('dlq') || type.includes('error')) {
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    }
    return <MessageSquare className="w-4 h-4 text-slate-500" />;
  };

  const formatDateValue = (val: any) => {
    if (!val) return 'None';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return String(val);
  };

  const getEventIconStyles = (event: any) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    if (type.includes('received') || (event.newValues && event.newValues.paymentStatus === 'Paid')) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
    
    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const changedKeys = Object.keys({ ...event.oldValues, ...event.newValues });
      if (changedKeys.includes('invoiceAmount')) {
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      }
      if (changedKeys.includes('dueDate')) {
        return 'bg-amber-50 text-amber-600 border-amber-100';
      }
      if (changedKeys.includes('paymentStatus')) {
        return 'bg-blue-50 text-blue-600 border-blue-100';
      }
    }
    if (type === 'invoice.trashed') {
      return 'bg-amber-50 text-amber-600 border-amber-100';
    }
    if (type === 'invoice.restored') {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
    if (type === 'invoice.permanently_deleted') {
      return 'bg-red-50 text-red-600 border-red-100';
    }

    if (type.includes('create') || type.includes('import')) {
      return 'bg-blue-50 text-blue-600 border-blue-100';
    }
    if (type.includes('sent') || type.includes('open') || type.includes('click')) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    }
    if (type.includes('halt') || type.includes('bounce') || type.includes('dlq') || type.includes('error')) {
      return 'bg-red-50 text-red-600 border-red-100';
    }
    
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  const getEventHeading = (event: any) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    // Build JSX for Actor to clean up name repeats and fold in hover info
    const renderActor = () => {
      const displayName = event.actorName || (event.source === 'agent' ? 'AI Agent' : event.source === 'webhook' ? 'Webhook' : 'System');
      
      if (!event.actorName) {
        return <span className="font-semibold text-slate-900">{displayName}</span>;
      }
      
      const isCardOpen = activeHoverCard?.eventId === event.id;
      const initials = event.actorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      
      return (
        <span 
          className="relative inline-block"
          onMouseEnter={() => setActiveHoverCard({
            eventId: event.id,
            name: event.actorName,
            role: event.actorRole,
            email: event.actorEmail
          })}
          onMouseLeave={() => setActiveHoverCard(null)}
        >
          <span className="font-bold text-slate-955 border-b border-dotted border-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
            {event.actorName}
          </span>
          
          {isCardOpen && (
            <span className="absolute z-50 bottom-full left-0 mb-2 w-60 bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-left block pointer-events-none animate-timeline-fade-in font-sans leading-normal">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {initials}
                </span>
                <span className="block min-w-0">
                  <span className="block font-bold text-slate-900 text-xs truncate">{event.actorName}</span>
                  {event.actorRole && (
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {event.actorRole}
                    </span>
                  )}
                </span>
              </span>
              {event.actorEmail && (
                <span className="block mt-2 pt-1.5 border-t border-slate-100">
                  <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Email</span>
                  <span className="block text-[10px] text-slate-600 font-mono truncate select-all">{event.actorEmail}</span>
                </span>
              )}
            </span>
          )}
        </span>
      );
    };

    const actor = renderActor();

    // 1. Updates
    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const keys = Object.keys({ ...event.oldValues, ...event.newValues }).filter(k => event.oldValues?.[k] !== event.newValues?.[k]);
      
      if (keys.length === 1) {
        const key = keys[0];
        const oldVal = event.oldValues?.[key];
        const newVal = event.newValues?.[key];
        
        const isFirstTime = oldVal === null || oldVal === undefined || oldVal === '' || String(oldVal).toLowerCase() === 'none';
        
        if (key === 'invoiceAmount') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set the invoice amount to <span className="font-bold text-slate-950 font-mono">{formatCurrency(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} changed the invoice amount from <span className="line-through text-slate-400 font-mono">{formatCurrency(oldVal)}</span> to <span className="font-bold text-slate-955 font-mono">{formatCurrency(newVal)}</span>
            </span>
          );
        }
        
        if (key === 'dueDate') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set the due date to <span className="font-bold text-slate-955">{formatDateValue(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} pushed the due date from <span className="line-through text-slate-400">{formatDateValue(oldVal)}</span> to <span className="font-bold text-slate-955">{formatDateValue(newVal)}</span>
            </span>
          );
        }

        if (key === 'paymentStatus') {
          if (newVal === 'Paid') {
            return (
              <span>
                {actor} marked this invoice as <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-xs border border-emerald-100">Paid</span>
              </span>
            );
          }
          if (isFirstTime) {
            return (
              <span>
                {actor} set status to <span className="font-bold text-slate-955">{String(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} changed status from <span className="line-through text-slate-400">{String(oldVal)}</span> to <span className="font-bold text-slate-955">{String(newVal)}</span>
            </span>
          );
        }
        
        // Sanity-check: Ambiguous "subject" -> "invoice description"
        const displayLabel = key === 'subject' ? 'invoice description' : key.replace(/([A-Z])/g, ' $1').toLowerCase();
        
        if (isFirstTime) {
          return (
            <span>
              {actor} set the {displayLabel} to <span className="font-bold text-slate-955">{String(newVal ?? '—')}</span>
            </span>
          );
        }
        return (
          <span>
            {actor} updated {displayLabel} from <span className="line-through text-slate-400">{String(oldVal ?? '—')}</span> to <span className="font-bold text-slate-955">{String(newVal ?? '—')}</span>
          </span>
        );
      } else if (keys.length > 1) {
        return (
          <span>
            {actor} updated {keys.length} fields on the invoice
          </span>
        );
      }
    }

    // 2. Specific Action types
    if (type === 'invoice.created') {
      return (
        <span>
          {actor} created this invoice for <span className="font-bold text-slate-950 font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span>
        </span>
      );
    }
    if (type === 'invoice.trashed') {
      return (
        <span>
          {actor} moved this invoice to Trash
        </span>
      );
    }
    if (type === 'invoice.restored') {
      return (
        <span>
          {actor} restored this invoice from Trash
        </span>
      );
    }
    if (type === 'invoice.permanently_deleted') {
      return (
        <span>
          {actor} permanently deleted this invoice
        </span>
      );
    }
    if (type === 'invoice.imported' || type === 'invoice.bulk_imported') {
      return (
        <span>
          {actor} imported this invoice
        </span>
      );
    }
    if (type === 'payment.received') {
      return (
        <span>
          Payment of <span className="font-bold text-emerald-600 font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span> received successfully
        </span>
      );
    }
    if (type === 'payment.link_generated') {
      return (
        <span>
          Payment link generated for <span className="font-semibold text-slate-900">{invoice?.clientName}</span>
        </span>
      );
    }
    if (type === 'followup.triggered') {
      const tone = event.payload?.tone || 'default';
      return (
        <span>
          {actor} triggered AI follow-up (tone: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">{tone}</span>)
        </span>
      );
    }
    if (type === 'followup.sent') {
      return (
        <span>
          AI agent sent follow-up email to <span className="font-semibold text-slate-900">{invoice?.contactEmail}</span>
        </span>
      );
    }
    if (type === 'followup.skipped') {
      return (
        <span>
          AI follow-up skipped (already contacted recently)
        </span>
      );
    }
    if (type === 'followup.halted') {
      return (
        <span>
          AI follow-up halted (no active email channel configured)
        </span>
      );
    }
    if (type === 'followup.email_opened') {
      return (
        <span>
          Client opened follow-up email
        </span>
      );
    }
    if (type === 'followup.email_clicked') {
      return (
        <span>
          Client clicked payment link in email
        </span>
      );
    }
    if (type === 'followup.bounced') {
      return (
        <span className="text-red-700">
          Email to {invoice?.contactEmail} bounced
        </span>
      );
    }
    if (type.startsWith('dlq.')) {
      return (
        <span className="text-amber-700">
          Invoice added to DLQ: {event.description || 'Automation limit reached'}
        </span>
      );
    }

    return <span>{event.description || event.actionType || event.eventType}</span>;
  };

  const groupTimelineEvents = (events: any[]) => {
    if (events.length === 0) return [];
    
    const grouped: any[] = [];
    let currentGroup: any[] = [];
    
    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      
      if (currentGroup.length === 0) {
        currentGroup.push(evt);
        continue;
      }
      
      const firstEvt = currentGroup[0];
      
      // Check grouping suitability
      const isSameType = (evt.actionType || evt.eventType) === (firstEvt.actionType || firstEvt.eventType);
      const isUpdate = (evt.actionType || evt.eventType) === 'invoice.updated';
      const isSameActor = evt.actorId === firstEvt.actorId && evt.actorName === firstEvt.actorName;
      
      // Check fields changed
      const firstKeys = Object.keys({ ...firstEvt.oldValues, ...firstEvt.newValues }).filter(k => firstEvt.oldValues?.[k] !== firstEvt.newValues?.[k]);
      const evtKeys = Object.keys({ ...evt.oldValues, ...evt.newValues }).filter(k => evt.oldValues?.[k] !== evt.newValues?.[k]);
      
      const isSameSingleField = isUpdate && firstKeys.length === 1 && evtKeys.length === 1 && firstKeys[0] === evtKeys[0];
      
      // Time difference within 15 minutes
      const timeDiff = Math.abs(new Date(evt.createdAt).getTime() - new Date(firstEvt.createdAt).getTime());
      const isWithinTime = timeDiff <= 15 * 60 * 1000;
      
      if (isSameType && isUpdate && isSameActor && isSameSingleField && isWithinTime) {
        currentGroup.push(evt);
      } else {
        grouped.push(mergeGroup(currentGroup));
        currentGroup = [evt];
      }
    }
    
    if (currentGroup.length > 0) {
      grouped.push(mergeGroup(currentGroup));
    }
    
    return grouped;
  };

  const mergeGroup = (group: any[]) => {
    if (group.length === 1) return group[0];
    
    // Sort group chronological ascending to determine transition
    const sorted = [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    
    const fieldKey = Object.keys({ ...oldest.oldValues, ...oldest.newValues }).find(k => oldest.oldValues?.[k] !== oldest.newValues?.[k]) || '';
    
    return {
      ...newest, // keeps the latest metadata
      oldValues: oldest.oldValues ? { [fieldKey]: oldest.oldValues[fieldKey] } : null,
      newValues: newest.newValues ? { [fieldKey]: newest.newValues[fieldKey] } : null,
      isGrouped: true,
      editsCount: group.length,
      subEvents: group
    };
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
                    <div className="relative border-l border-slate-200 ml-3.5 space-y-4 py-1">
                      {(() => {
                        const displayTimeline = groupTimelineEvents(accumulatedTimeline);
                        const toggleGroup = (id: string) => {
                          setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
                        };
                        return displayTimeline.map((event) => {
                          const type = (event.actionType || event.eventType || '').toLowerCase();
                          const keys = (type === 'invoice.trashed' || type === 'invoice.restored')
                            ? []
                            : Object.keys({ ...event.oldValues, ...event.newValues }).filter(k => event.oldValues?.[k] !== event.newValues?.[k]);
                          const isExpanded = !!expandedGroups[event.id];
                          
                          return (
                            <div key={event.id} className="relative pl-6 animate-timeline-fade-in">
                              {/* Color-coded Circular Icon Marker */}
                              <div className={`absolute -left-3 top-1 h-6 w-6 rounded-full bg-white border flex items-center justify-center shadow-sm ${getEventIconStyles(event)}`}>
                                {renderEventIcon(event)}
                              </div>
                              
                              {/* Card Content with reduced padding */}
                              <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 hover:bg-slate-50 hover:shadow-sm transition-all duration-150">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                  {/* Primary Text */}
                                  <div className="text-sm text-slate-800 leading-snug">
                                    {getEventHeading(event)}
                                    
                                    {/* Collapsible edit revisions trigger */}
                                    {event.isGrouped && (
                                      <button 
                                        onClick={() => toggleGroup(event.id)}
                                        className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-full transition-all inline-flex items-center gap-0.5 active:scale-95 cursor-pointer shadow-xs"
                                      >
                                        <span>{event.editsCount} edits</span>
                                        <span>{isExpanded ? '▲' : '▼'}</span>
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Secondary metadata row */}
                                  <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap self-start sm:self-center">
                                    {new Date(event.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}, {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>

                                {/* Collapsible edits expansion panel */}
                                {event.isGrouped && isExpanded && (
                                  <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1 py-0.5 text-[11px] text-slate-500">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Edit History ({event.editsCount} revisions)</p>
                                    {event.subEvents.map((sub: any) => {
                                      const subKeys = Object.keys({ ...sub.oldValues, ...sub.newValues }).filter(k => sub.oldValues?.[k] !== sub.newValues?.[k]);
                                      const subKey = subKeys[0];
                                      const oldV = sub.oldValues?.[subKey];
                                      const newV = sub.newValues?.[subKey];
                                      
                                      const isSubFirstTime = oldV === null || oldV === undefined || oldV === '' || String(oldV).toLowerCase() === 'none';
                                      
                                      const formattedOld = subKey === 'invoiceAmount' ? formatCurrency(oldV) : subKey === 'dueDate' ? formatDateValue(oldV) : String(oldV || '—');
                                      const formattedNew = subKey === 'invoiceAmount' ? formatCurrency(newV) : subKey === 'dueDate' ? formatDateValue(newV) : String(newV || '—');
                                      
                                      return (
                                        <div key={sub.id} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0 font-medium">
                                          <span className="text-[10px] text-slate-400">
                                            {new Date(sub.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                          </span>
                                          {isSubFirstTime ? (
                                            <span>
                                              Set to <span className="font-semibold text-slate-800">{formattedNew}</span>
                                            </span>
                                          ) : (
                                            <span>
                                              Changed from <span className="line-through text-slate-400">{formattedOld}</span> to <span className="font-semibold text-slate-800">{formattedNew}</span>
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Diff List for Multi-field changes */}
                                {keys.length > 1 && !event.isGrouped && (
                                  <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1 py-0.5 text-xs text-slate-500">
                                    {keys.map((key) => {
                                      const oldVal = event.oldValues?.[key];
                                      const newVal = event.newValues?.[key];
                                      if (oldVal === newVal) return null;
                                      
                                      const isDiffFirstTime = oldVal === null || oldVal === undefined || oldVal === '' || String(oldVal).toLowerCase() === 'none';
                                      const displayLabel = key === 'subject' ? 'Invoice Description' : key.replace(/([A-Z])/g, ' $1');
                                      
                                      const formattedOld = key === 'invoiceAmount' ? formatCurrency(oldVal) : key === 'dueDate' ? formatDateValue(oldVal) : String(oldVal ?? '—');
                                      const formattedNew = key === 'invoiceAmount' ? formatCurrency(newVal) : key === 'dueDate' ? formatDateValue(newVal) : String(newVal ?? '—');
                                      return (
                                        <div key={key} className="flex justify-between items-center py-0.5 font-medium">
                                          <span className="capitalize text-slate-500 font-semibold">{displayLabel}</span>
                                          <span>
                                            {isDiffFirstTime ? (
                                              <span>
                                                Set to <span className="font-semibold text-slate-800 ml-1">{formattedNew}</span>
                                              </span>
                                            ) : (
                                              <span>
                                                <span className="line-through text-slate-400 mr-1">{formattedOld}</span>
                                                &rarr;
                                                <span className="font-semibold text-slate-800 ml-1">{formattedNew}</span>
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Payload descriptions if any */}
                                {renderEventDescription(event) && (
                                  <div className="text-xs text-slate-500 mt-2 pl-3 border-l-2 border-slate-200 py-0.5">
                                    {renderEventDescription(event)}
                                  </div>
                                )}

                                {/* Legacy/Generic payloads */}
                                {!event.oldValues && !event.newValues && event.payload && (
                                  <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1 py-0.5 text-[11px] text-slate-500 font-mono">
                                    {Object.entries(event.payload).map(([k, v]) => {
                                      if (v === null || v === undefined || k === 'error' || k === 'reason') return null;
                                      return (
                                        <div key={k} className="flex gap-2">
                                          <span className="font-semibold text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                          <span className="text-slate-600 select-all truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
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
                    <CommunicationStats 
                      communications={communications || []} 
                      defaultEmailProvider={settings?.defaultEmailProvider} 
                    />
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
