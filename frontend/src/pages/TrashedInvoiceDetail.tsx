import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "../services/invoice";
import { eventService } from "../services/event";
import { communicationService } from "../services/communication";
import type { InvoiceEvent } from "../types/api";
import { Badge } from "../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { ConfirmDestructiveModal } from "../components/common/ConfirmDestructiveModal";
import { CommunicationList } from "../components/invoices/CommunicationList";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/error-utils";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  AlertTriangle,
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
  XCircle,
  CheckCircle2
} from "lucide-react";

interface GroupedInvoiceEvent extends InvoiceEvent {
  isGrouped?: boolean;
  editsCount?: number;
  subEvents?: InvoiceEvent[];
}

const formatCurrency = (val: unknown) => {
  const num = typeof val === 'number' ? val : Number(val as string | number) || 0;
  return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export function TrashedInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
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
  const [accumulatedTimeline, setAccumulatedTimeline] = useState<GroupedInvoiceEvent[]>([]);
  const [totalTimelineCount, setTotalTimelineCount] = useState(0);

  const { data: invoice, isLoading: isInvoiceLoading, isError: isInvoiceError } = useQuery({
    queryKey: ["trashed-invoice", id],
    queryFn: () => invoiceService.getTrashedInvoice(id!),
    enabled: !!id,
  });

  const { data: timelineResponse, isLoading: isTimelineLoading } = useQuery({
    queryKey: ["trashed-invoice-timeline", id, timelinePage],
    queryFn: () => eventService.getInvoiceTimeline(id!, {
      page: timelinePage,
      limit: 10,
    }),
    enabled: !!id,
  });

  useEffect(() => {
    if (timelineResponse?.data) {
      Promise.resolve().then(() => {
        if (timelinePage === 1) {
          setAccumulatedTimeline(timelineResponse.data);
        } else {
          setAccumulatedTimeline(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const uniqueNew = timelineResponse.data.filter((e: GroupedInvoiceEvent) => !existingIds.has(e.id));
            return [...prev, ...uniqueNew];
          });
        }
        setTotalTimelineCount(timelineResponse.pagination.total);
      });
    }
  }, [timelineResponse, timelinePage]);

  const { data: communications } = useQuery({
    queryKey: ["trashed-invoice-communications", id],
    queryFn: () => communicationService.getInvoiceCommunications(id!),
    enabled: !!id,
  });

  const restoreMutation = useMutation({
    mutationFn: () => invoiceService.restoreInvoice(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-trash"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      navigate(`/invoices/${id}`);
    }
  });

  const hardDeleteMutation = useMutation({
    mutationFn: () => invoiceService.hardDeleteInvoice(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-trash"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      navigate('/invoices');
    }
  });

  const renderEventIcon = (event: GroupedInvoiceEvent) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    if (type.includes('received') || (event.newValues && event.newValues.paymentStatus === 'Paid')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const changedKeys = Object.keys({ ...event.oldValues, ...event.newValues });
      if (changedKeys.includes('invoiceAmount')) {
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      }
      if (changedKeys.includes('dueDate')) {
        return <Clock className="w-4 h-4 text-amber-500" />;
      }
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
    return <MessageSquare className="w-4 h-4 text-[#8a8f98]" />;
  };

  const formatDateValue = (val: unknown) => {
    if (!val) return 'None';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return String(val);
  };



  const getRecipientEmail = (event: GroupedInvoiceEvent) => {
    const explicit = event.payload?.recipient || 
                     event.payload?.recipientEmail || 
                     event.payload?.contactEmail || 
                     event.payload?.to || 
                     event.payload?.email;
    if (typeof explicit === 'string' && explicit.trim()) {
      return explicit;
    }

    if (accumulatedTimeline.length > 0) {
      const eventTime = new Date(event.createdAt).getTime();

      const updateAfter = accumulatedTimeline
        .filter(e => new Date(e.createdAt).getTime() > eventTime && e.actionType === 'invoice.updated' && e.oldValues?.contactEmail)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (updateAfter?.oldValues?.contactEmail) {
        return String(updateAfter.oldValues.contactEmail);
      }

      const updateBefore = accumulatedTimeline
        .filter(e => new Date(e.createdAt).getTime() <= eventTime && e.actionType === 'invoice.updated' && e.newValues?.contactEmail)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (updateBefore?.newValues?.contactEmail) {
        return String(updateBefore.newValues.contactEmail);
      }

      const creationEvent = accumulatedTimeline.find(e => 
        (e.actionType === 'invoice.created' || e.actionType === 'invoice.imported' || e.actionType === 'invoice.bulk_imported') && 
        (e.newValues?.contactEmail || e.oldValues?.contactEmail)
      );
      if (creationEvent) {
        const email = creationEvent.newValues?.contactEmail || creationEvent.oldValues?.contactEmail;
        if (email) return String(email);
      }
    }

    return invoice?.contactEmail || '';
  };

  const getEventHeading = (event: GroupedInvoiceEvent) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    const renderActor = () => {
      const displayName = event.actorName || (event.source === 'agent' ? 'Autopilot' : event.source === 'webhook' ? 'Webhook' : 'System');
      if (!event.actorName) {
        return <span className="font-semibold text-[#f7f8f8]">{displayName}</span>;
      }
      const isCardOpen = activeHoverCard?.eventId === event.id;
      const initials = (event.actorName || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      return (
        <span 
          className="relative inline-block"
          onMouseEnter={() => setActiveHoverCard({
            eventId: event.id,
            name: event.actorName || '',
            role: event.actorRole || null,
            email: event.actorEmail || null
          })}
          onMouseLeave={() => setActiveHoverCard(null)}
        >
          <span className="font-bold text-[#f7f8f8] border-b border-dotted border-[#8a8f98] hover:text-[#5e6ad2] transition-colors cursor-pointer">
            {event.actorName}
          </span>
          {isCardOpen && (
            <span className="absolute z-50 bottom-full left-0 mb-2 w-60 bg-[#0f1011] border border-[#23252a] rounded-xl p-3 shadow-none text-left block pointer-events-none animate-timeline-fade-in font-sans leading-normal text-[#f7f8f8]">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#5e6ad2]/20 border border-[#5e6ad2]/30 text-[#5e6ad2] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {initials}
                </span>
                <span className="block min-w-0">
                  <span className="block font-bold text-[#f7f8f8] text-xs truncate">{event.actorName}</span>
                  {event.actorRole && (
                    <span className="block text-[9px] text-[#8a8f98] font-bold uppercase tracking-wider mt-0.5">
                      {event.actorRole}
                    </span>
                  )}
                </span>
              </span>
              {event.actorEmail && (
                <span className="block mt-2 pt-1.5 border-t border-[#23252a]">
                  <span className="block text-[8px] uppercase font-bold text-[#8a8f98] tracking-wider">Email</span>
                  <span className="block text-[10px] text-[#d0d6e0] font-mono truncate select-all">{event.actorEmail}</span>
                </span>
              )}
            </span>
          )}
        </span>
      );
    };

    const actor = renderActor();

    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const keys = Object.keys({ ...event.oldValues, ...event.newValues }).filter(k => event.oldValues?.[k] !== event.newValues?.[k]);
      if (keys.length === 1) {
        const key = keys[0];
        const oldVal = event.oldValues?.[key];
        const newVal = event.newValues?.[key];
        const isFirstTime = oldVal === null || oldVal === undefined || oldVal === '' || String(oldVal).toLowerCase() === 'none';
        
        if (key === 'invoiceAmount') {
          if (isFirstTime) {
            return <span>{actor} set the invoice amount to <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(newVal)}</span></span>;
          }
          return <span>{actor} changed the invoice amount from <span className="line-through text-[#8a8f98] font-mono">{formatCurrency(oldVal)}</span> to <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(newVal)}</span></span>;
        }
        if (key === 'dueDate') {
          if (isFirstTime) {
            return <span>{actor} set the due date to <span className="font-bold text-[#f7f8f8]">{formatDateValue(newVal)}</span></span>;
          }
          return <span>{actor} pushed the due date from <span className="line-through text-[#8a8f98]">{formatDateValue(oldVal)}</span> to <span className="font-bold text-[#f7f8f8]">{formatDateValue(newVal)}</span></span>;
        }
        if (key === 'paymentStatus') {
          if (newVal === 'Paid') {
            return <span>{actor} marked this invoice as <span className="font-bold text-[#27a644] bg-[#27a644]/10 px-1.5 py-0.5 rounded text-xs border border-[#27a644]/20">Paid</span></span>;
          }
          if (isFirstTime) {
            return <span>{actor} set status to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span></span>;
          }
          return <span>{actor} changed status from <span className="line-through text-[#8a8f98]">{String(oldVal)}</span> to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span></span>;
        }
        const displayLabel = key === 'subject' ? 'invoice description' : key.replace(/([A-Z])/g, ' $1').toLowerCase();
        if (isFirstTime) {
          return <span>{actor} set the {displayLabel} to <span className="font-bold text-[#f7f8f8]">{String(newVal ?? '—')}</span></span>;
        }
        return <span>{actor} updated {displayLabel} from <span className="line-through text-[#8a8f98]">{String(oldVal ?? '—')}</span> to <span className="font-bold text-[#f7f8f8]">{String(newVal ?? '—')}</span></span>;
      } else if (keys.length > 1) {
        return <span>{actor} updated {keys.length} fields on the invoice</span>;
      }
    }

    if (type === 'invoice.created') {
      return <span>{actor} created this invoice for <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span></span>;
    }
    if (type === 'invoice.trashed') {
      return <span>{actor} moved this invoice to Trash</span>;
    }
    if (type === 'invoice.restored') {
      return <span>{actor} restored this invoice from Trash</span>;
    }
    if (type === 'invoice.permanently_deleted') {
      return <span>{actor} permanently deleted this invoice</span>;
    }
    if (type === 'invoice.imported' || type === 'invoice.bulk_imported') {
      return <span>{actor} imported this invoice</span>;
    }
    if (type === 'payment.received') {
      return <span>Payment of <span className="font-bold text-[#27a644] font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span> received successfully</span>;
    }
    if (type === 'payment.link_generated') {
      return <span>Payment link generated for <span className="font-semibold text-[#f7f8f8]">{invoice?.clientName}</span></span>;
    }
    if (type === 'followup.triggered') {
      const tone = String(event.payload?.tone || 'default');
      return <span>{actor} triggered AI follow-up (tone: <span className="font-mono bg-[#141516] text-[#f7f8f8] px-1.5 py-0.5 rounded text-[11px] border border-[#23252a]">{tone}</span>)</span>;
    }
    if (type === 'followup.sent') {
      const recipient = getRecipientEmail(event);
      return <span>Autopilot sent follow-up email to <span className="font-semibold text-[#f7f8f8]">{recipient}</span></span>;
    }
    if (type === 'followup.skipped') {
      return <span>AI follow-up skipped (already contacted recently)</span>;
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
      const recipient = getRecipientEmail(event);
      return (
        <span className="text-red-700">
          Email to {recipient} bounced
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

  const groupTimelineEvents = (events: GroupedInvoiceEvent[]) => {
    if (events.length === 0) return [];
    const grouped: GroupedInvoiceEvent[] = [];
    let currentGroup: GroupedInvoiceEvent[] = [];
    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      if (currentGroup.length === 0) {
        currentGroup.push(evt);
        continue;
      }
      const firstEvt = currentGroup[0];
      const isSameType = (evt.actionType || evt.eventType) === (firstEvt.actionType || firstEvt.eventType);
      const isUpdate = (evt.actionType || evt.eventType) === 'invoice.updated';
      const isSameActor = evt.actorId === firstEvt.actorId && evt.actorName === firstEvt.actorName;
      const firstKeys = Object.keys({ ...firstEvt.oldValues, ...firstEvt.newValues }).filter(k => firstEvt.oldValues?.[k] !== firstEvt.newValues?.[k]);
      const evtKeys = Object.keys({ ...evt.oldValues, ...evt.newValues }).filter(k => evt.oldValues?.[k] !== evt.newValues?.[k]);
      const isSameSingleField = isUpdate && firstKeys.length === 1 && evtKeys.length === 1 && firstKeys[0] === evtKeys[0];
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

  const mergeGroup = (group: GroupedInvoiceEvent[]): GroupedInvoiceEvent => {
    if (group.length === 1) return group[0];
    const sorted = [...group].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const fieldKey = Object.keys({ ...oldest.oldValues, ...oldest.newValues }).find(k => oldest.oldValues?.[k] !== oldest.newValues?.[k]) || '';
    return {
      ...newest,
      oldValues: oldest.oldValues ? { [fieldKey]: oldest.oldValues[fieldKey] } : null,
      newValues: newest.newValues ? { [fieldKey]: newest.newValues[fieldKey] } : null,
      isGrouped: true,
      editsCount: group.length,
      subEvents: group
    };
  };

  const renderEventDescription = (event: GroupedInvoiceEvent) => {
    const payload = event.payload;
    const type = (event.actionType || event.eventType || '').toLowerCase();
    if (type.includes('halted') || type.includes('bounced')) {
      if (payload?.error) {
        return (
          <div>
            <p className="font-semibold text-red-400">Follow-up failed with error</p>
            <p className="text-xs text-red-300 mt-1 bg-red-950/40 p-2 border border-red-900/50 rounded font-mono">
              {getErrorMessage(payload.error)}
            </p>
          </div>
        );
      }
    }
    if (type.includes('skipped')) {
      return (
        <div>
          <p className="font-semibold text-[#f7f8f8]">Follow-up skipped</p>
          <p className="text-xs text-[#8a8f98] mt-1">Skipped because a follow-up was recently sent.</p>
        </div>
      );
    }
    if (payload?.subject) {
      return (
        <div>
          <p className="text-xs text-[#8a8f98] font-mono bg-[#141516] p-1.5 rounded border border-[#23252a]">Subject: {String(payload.subject)}</p>
        </div>
      );
    }
    return null;
  };

  if (isInvoiceLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#f7f8f8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e6ad2] mb-3" />
        <p className="text-[#8a8f98] text-xs font-medium">Loading trashed invoice details...</p>
      </div>
    );
  }

  if (isInvoiceError || !invoice) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-[#0f1011] rounded-xl border border-[#23252a] text-center space-y-4 text-[#f7f8f8]">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
        <h2 className="text-base font-semibold text-[#f7f8f8]">Trashed Invoice Not Found</h2>
        <p className="text-[#8a8f98] text-xs">
          The trashed invoice you are looking for does not exist, belongs to another organization, or has been permanently deleted.
        </p>
        <Link to="/invoices" className="inline-flex items-center justify-center rounded-md bg-[#5e6ad2] text-white hover:bg-[#828fff] h-9 px-4 text-xs font-medium">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-[#f7f8f8]">
      {/* Back Link */}
      <div>
        <Link to="/invoices" className="inline-flex items-center text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Invoices (Trash)
        </Link>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl p-4 flex items-start gap-3 relative shadow-none">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-xs text-red-300">Action Failed</h3>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="absolute top-3.5 right-3.5 text-red-400 hover:text-red-300 transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Amber Trashed Warning Banner */}
      <div className="flex items-start gap-3 p-3.5 bg-amber-950/40 border border-amber-900/50 rounded-xl text-amber-300 shadow-none">
        <Trash2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-xs text-amber-200">This invoice is currently in the Trash</p>
          <p className="text-xs mt-0.5 text-amber-200/80 leading-relaxed">
            Moved to Trash on {invoice.deletedAt ? new Date(invoice.deletedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'unknown date'}.
            It is read-only and excluded from active schedules and payments.
          </p>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-[#0f1011] p-5 rounded-xl border border-[#23252a] shadow-none">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">{invoice.invoiceNo}</h1>
            <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Trashed ({invoice.paymentStatus})
            </Badge>
          </div>
          <p className="text-2xl font-light text-[#f7f8f8] mt-2">
            {formatCurrency(invoice.invoiceAmount)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 md:justify-end">
          {user?.role !== 'viewer' && (
            <>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => restoreMutation.mutate()}
                  disabled={restoreMutation.isPending}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] text-[#f7f8f8] h-9 px-3.5 py-1.5 disabled:opacity-40 gap-1.5"
                >
                  {restoreMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5e6ad2]" /> : <RotateCcw className="h-3.5 w-3.5 text-[#5e6ad2]" />}
                  Restore Invoice
                </button>
              )}

              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsConfirmDeleteModalOpen(true)}
                  disabled={hardDeleteMutation.isPending}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-red-900/50 bg-[#0f1011] text-red-400 hover:bg-red-950/40 h-9 px-3.5 py-1.5 disabled:opacity-40 gap-1.5"
                >
                  {hardDeleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete Permanently
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Grid */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="pb-2 border-b-0">
              <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <p className="text-xs text-[#8a8f98] mb-0.5">Company</p>
                <p className="font-medium text-xs text-[#f7f8f8]">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-[#8a8f98] mb-0.5">Contact</p>
                <div className="flex items-center text-xs text-[#f7f8f8]">
                  <Mail className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
                  <a href={`mailto:${invoice.contactEmail}`} className="hover:text-[#5e6ad2] hover:underline">{invoice.contactEmail}</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.subject && (
            <Card className="border border-[#23252a] bg-[#0f1011]">
              <CardHeader className="pb-2 border-b-0">
                <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">Invoice Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#d0d6e0] leading-relaxed">{invoice.subject}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="pb-2 border-b-0">
              <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">Aging &amp; Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <p className="text-xs text-[#8a8f98] mb-0.5">Due Date</p>
                <div className="flex items-center text-xs text-[#f7f8f8]">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
                  {new Date(invoice.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#23252a]">
                <p className="text-xs text-[#8a8f98]">Days Overdue</p>
                <p className="font-semibold text-xs text-[#f7f8f8]">
                  {invoice.daysOverdue || 0}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#23252a]">
                <p className="text-xs text-[#8a8f98]">Follow-ups Sent</p>
                <p className="font-semibold text-xs text-[#f7f8f8]">{invoice.followupCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Area */}
        <div className="md:col-span-2">
          <Card className="h-full border border-[#23252a] bg-[#0f1011]">
            <div className="p-3 border-b border-[#23252a]">
              <div className="flex items-center gap-1.5 p-1 bg-transparent border border-[#1e2025]/80 rounded-xl w-fit">
                <button
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeTab === 'timeline' 
                      ? 'bg-[#1a1e2e] text-[#5e6ad2] border border-[#282f45] font-semibold shadow-sm' 
                      : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
                  }`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Event Timeline
                </button>
                <button
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                    activeTab === 'emails' 
                      ? 'bg-[#1a1e2e] text-[#5e6ad2] border border-[#282f45] font-semibold shadow-sm' 
                      : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
                  }`}
                  onClick={() => setActiveTab('emails')}
                >
                  Emails &amp; Messages
                </button>
              </div>
            </div>
            
            <CardContent className="pt-5">
              {activeTab === 'timeline' ? (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs text-[#8a8f98] font-medium">
                      Showing {accumulatedTimeline.length} of {totalTimelineCount} events
                    </span>
                  </div>

                  {isTimelineLoading && accumulatedTimeline.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-[#5e6ad2]" />
                    </div>
                  ) : accumulatedTimeline.length === 0 ? (
                    <div className="text-center py-8 text-[#8a8f98] text-xs">
                      No events recorded matching the criteria.
                    </div>
                  ) : (
                    <div className="relative border-l border-[#23252a] ml-3.5 space-y-3.5 py-1">
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
                            <div key={event.id} className="relative pl-5">
                              <div className={`absolute -left-2.5 top-0.5 h-5 w-5 rounded-full bg-[#0f1011] border border-[#23252a] flex items-center justify-center shadow-none`}>
                                {renderEventIcon(event)}
                              </div>
                              
                              <div className="bg-[#010102] rounded-lg p-3 border border-[#23252a] hover:bg-[#141516]/60 transition-all duration-150">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <div className="text-xs text-[#f7f8f8] leading-snug">
                                    {getEventHeading(event)}
                                    {event.isGrouped && (

                                      <button 
                                        onClick={() => toggleGroup(event.id)}
                                        className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-[#141516] hover:bg-[#18191a] text-[#8a8f98] border border-[#23252a] rounded-full transition-all inline-flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <span>{event.editsCount} edits</span>
                                        <span>{isExpanded ? '▲' : '▼'}</span>
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="text-[10px] text-[#8a8f98] font-medium whitespace-nowrap self-start sm:self-center">
                                    {new Date(event.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}, {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>

                                {event.isGrouped && isExpanded && (
                                  <div className="mt-2 pl-3 border-l-2 border-[#23252a] space-y-1 py-0.5 text-[11px] text-[#8a8f98]">
                                    <p className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-wider mb-1">Edit History ({event.editsCount} revisions)</p>
                                    {event.subEvents?.map((sub: InvoiceEvent) => {
                                      const subKeys = Object.keys({ ...sub.oldValues, ...sub.newValues }).filter(k => sub.oldValues?.[k] !== sub.newValues?.[k]);
                                      const subKey = subKeys[0];
                                      const oldV = sub.oldValues?.[subKey];
                                      const newV = sub.newValues?.[subKey];
                                      const isSubFirstTime = oldV === null || oldV === undefined || oldV === '' || String(oldV).toLowerCase() === 'none';
                                      const formattedOld = subKey === 'invoiceAmount' ? formatCurrency(oldV) : subKey === 'dueDate' ? formatDateValue(oldV) : String(oldV || '—');
                                      const formattedNew = subKey === 'invoiceAmount' ? formatCurrency(newV) : subKey === 'dueDate' ? formatDateValue(newV) : String(newV || '—');
                                      
                                      return (
                                        <div key={sub.id} className="flex justify-between items-center py-0.5 border-b border-[#23252a] last:border-0 font-medium">
                                          <span className="text-[10px] text-[#8a8f98]">
                                            {new Date(sub.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                          </span>
                                          {isSubFirstTime ? (
                                            <span>Set to <span className="font-semibold text-[#f7f8f8]">{formattedNew}</span></span>
                                          ) : (
                                            <span>Changed from <span className="line-through text-[#8a8f98]">{formattedOld}</span> to <span className="font-semibold text-[#f7f8f8]">{formattedNew}</span></span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {keys.length > 1 && !event.isGrouped && (
                                  <div className="mt-2 pl-3 border-l-2 border-[#23252a] space-y-1 py-0.5 text-xs text-[#8a8f98]">
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
                                          <span className="capitalize text-[#8a8f98] font-semibold">{displayLabel}</span>
                                          <span>
                                            {isDiffFirstTime ? (
                                              <span>Set to <span className="font-semibold text-[#f7f8f8] ml-1">{formattedNew}</span></span>
                                            ) : (
                                              <span>
                                                <span className="line-through text-[#8a8f98] mr-1">{formattedOld}</span>
                                                &rarr;
                                                <span className="font-semibold text-[#f7f8f8] ml-1">{formattedNew}</span>
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {renderEventDescription(event) && (
                                  <div className="text-xs text-[#8a8f98] mt-2 pl-3 border-l-2 border-[#23252a] py-0.5">
                                    {renderEventDescription(event)}
                                  </div>
                                )}

                                {!event.oldValues && !event.newValues && event.payload && (
                                  <div className="mt-2 pl-3 border-l-2 border-[#23252a] space-y-1 py-0.5 text-[11px] text-[#8a8f98] font-mono">
                                    {Object.entries(event.payload).map(([k, v]) => {
                                      if (v === null || v === undefined || k === 'error' || k === 'reason') return null;
                                      return (
                                        <div key={k} className="flex gap-2">
                                          <span className="font-semibold text-[#8a8f98] capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                                          <span className="text-[#d0d6e0] select-all truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
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

                  {timelineResponse && accumulatedTimeline.length < totalTimelineCount && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setTimelinePage(prev => prev + 1)}
                        disabled={isTimelineLoading}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] text-[#f7f8f8] h-9 px-4 py-2 disabled:opacity-40 cursor-pointer shadow-none"
                      >
                        {isTimelineLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />}
                        Load More Events
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // EMAILS TAB
                <div>
                  <CommunicationList communications={communications || []} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDestructiveModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={async () => {
          await hardDeleteMutation.mutateAsync();
        }}
        invoiceNo={invoice.invoiceNo}
        clientName={invoice.clientName}
        amountDisplay={formatCurrency(invoice.invoiceAmount)}
      />
    </div>
  );
}
