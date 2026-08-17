import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "../services/invoice";
import { eventService } from "../services/event";
import { agentService } from "../services/agent";
import { TriggerFollowupModal } from "../components/invoices/TriggerFollowupModal";
import { communicationService } from "../services/communication";
import { settingsService } from "../services/settings";
import { Badge } from "../components/ui/Badge";
import { PaymentWarningModal } from "../components/common/PaymentWarningModal";
import { usePaymentWarning } from "../hooks/usePaymentWarning";
import { useAuth } from "../contexts/AuthContext";
import { EditInvoiceModal } from "../components/invoices/EditInvoiceModal";
import { Modal } from "../components/ui/Modal";
import { ConfirmDestructiveModal } from "../components/common/ConfirmDestructiveModal";
import { CommunicationList } from "../components/invoices/CommunicationList";
import { getErrorMessage } from "../utils/error-utils";
import type { InvoiceEvent } from "../types/api";
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
  XCircle,
  Copy,
  Check,
  MoreVertical,
  Activity,
  ExternalLink
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

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'emails' | 'payment-plan'>('timeline');
  const [error, setError] = useState<string | null>(null);

  // Debtor Portal Link State & Query
  const [isCopied, setIsCopied] = useState(false);

  const { data: portalLinkData } = useQuery({
    queryKey: ["portal-link-data", id],
    queryFn: () => invoiceService.regeneratePortalLink(id!),
    enabled: !!id && (user?.role === 'admin' || user?.role === 'manager'),
  });

  const handleCopyPortalLink = async () => {
    try {
      let targetUrl = portalLinkData?.url;
      if (!targetUrl) {
        const res = await invoiceService.regeneratePortalLink(id!);
        targetUrl = res.url;
      }
      if (targetUrl) {
        await navigator.clipboard.writeText(targetUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleOpenPortal = async () => {
    try {
      let targetUrl = portalLinkData?.url;
      if (!targetUrl) {
        const res = await invoiceService.regeneratePortalLink(id!);
        targetUrl = res.url;
      }
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Timeline State
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeHoverCard, setActiveHoverCard] = useState<{
    eventId: string;
    name: string;
    role: string | null;
    email: string | null;
  } | null>(null);

  const { data: invoice, isLoading: isInvoiceLoading, error: invoiceError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
    retry: false,
  });

  const { data: installmentsResponse } = useQuery({
    queryKey: ["invoice-installments", id],
    queryFn: () => invoiceService.getInstallments(id!),
    enabled: !!id && !!invoice?.hasActivePaymentPlan,
  });

  const {
    data: infiniteTimelineData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTimelineLoading,
  } = useInfiniteQuery({
    queryKey: ["invoice-timeline", id, invoice?.updatedAt],
    queryFn: ({ pageParam = 1 }) => eventService.getInvoiceTimeline(id!, { page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!id,
  });

  const accumulatedTimeline = useMemo(() => {
    if (!infiniteTimelineData?.pages) return [];
    return infiniteTimelineData.pages.flatMap((page) => page?.data ?? []);
  }, [infiniteTimelineData]);

  const totalTimelineCount = infiniteTimelineData?.pages[0]?.pagination?.total ?? accumulatedTimeline.length;

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
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
  });

  const { showModal: showPaymentModal, runWithWarningCheck, handleConfirm: handlePaymentConfirm, handleCancel: handlePaymentCancel } =
    usePaymentWarning({ integrations, settings });

  const statusMutation = useMutation({
    mutationFn: (status: string) => invoiceService.updateInvoiceStatus(id!, status),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
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
    onError: (err: unknown) => {
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
    onError: (err: unknown) => {
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

  const restoreMutation = useMutation({
    mutationFn: () => invoiceService.restoreInvoice(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
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

  const permanentDeleteMutation = useMutation({
    mutationFn: () => invoiceService.hardDeleteInvoice(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      navigate('/invoices?status=trash');
    }
  });

  const generateLinkMutation = useMutation({
    mutationFn: () => invoiceService.generatePaymentLink(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    }
  });

  const cancelPlanMutation = useMutation({
    mutationFn: () => invoiceService.cancelPaymentPlan(id!),
    onMutate: () => setError(null),
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-installments", id] });
    }
  });

  if (isInvoiceLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#8a8f98] mb-3" />
        <p className="text-[#8a8f98] text-xs">Loading invoice details...</p>
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#f7f8f8]">Invoice Not Found</h3>
          <p className="text-xs text-[#8a8f98] mt-1">{invoiceError ? getErrorMessage(invoiceError) : "The requested invoice could not be found or has been permanently removed."}</p>
        </div>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#13161c] border border-[#1e2025] hover:bg-[#1d212a] text-[#f7f8f8] text-xs font-semibold rounded-xl transition-all mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
      </div>
    );
  }

  const isTrashed = Boolean(invoice.deletedAt);

  const renderEventIcon = (event: GroupedInvoiceEvent) => {
    const type = (event.actionType || event.eventType || '').toLowerCase();
    
    // 1. Paid status or payment received
    if (type.includes('received') || (event.newValues && event.newValues.paymentStatus === 'Paid')) {
      return <CheckCircle2 className="w-4 h-4 text-[#27a644]" />;
    }
    
    // 2. Invoice update changes
    if (type === 'invoice.updated' && (event.oldValues || event.newValues)) {
      const changedKeys = Object.keys({ ...event.oldValues, ...event.newValues });
      
      // Money change (amount)
      if (changedKeys.includes('invoiceAmount')) {
        return <DollarSign className="w-4 h-4 text-[#27a644]" />;
      }
      
      // Date change (due date)
      if (changedKeys.includes('dueDate')) {
        return <Clock className="w-4 h-4 text-amber-400" />;
      }

      // Status change
      if (changedKeys.includes('paymentStatus')) {
        return <RefreshCw className="w-4 h-4 text-[#5e6ad2]" />;
      }
    }
    if (type === 'invoice.trashed') {
      return <Trash2 className="w-4 h-4 text-amber-400" />;
    }
    if (type === 'invoice.restored') {
      return <RotateCcw className="w-4 h-4 text-[#27a644]" />;
    }
    if (type === 'invoice.permanently_deleted') {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }

    // 3. Fallbacks based on action/event types
    if (type.includes('create') || type.includes('import')) {
      return <FileText className="w-4 h-4 text-[#5e6ad2]" />;
    }
    if (type.includes('sent')) {
      return <Send className="w-4 h-4 text-[#5e6ad2]" />;
    }
    if (type.includes('opened')) {
      return <Eye className="w-4 h-4 text-[#828fff]" />;
    }
    if (type.includes('clicked')) {
      return <MousePointer className="w-4 h-4 text-[#828fff]" />;
    }
    if (type.includes('received') || type.includes('status')) {
      return <CheckCircle2 className="w-4 h-4 text-[#27a644]" />;
    }
    if (type.includes('halt') || type.includes('bounce') || type.includes('dlq') || type.includes('error')) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
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

  const FIELD_ORDER: Record<string, number> = {
    invoiceNo: 1,
    clientName: 2,
    contactEmail: 3,
    invoiceAmount: 4,
    dueDate: 5,
    paymentStatus: 6,
    importOutcome: 7,
    subject: 8,
  };

  const getEventIconStyles = (event: GroupedInvoiceEvent) => {
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
    
    return 'bg-[#141516] text-[#8a8f98] border border-[#23252a]';
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
    
    // Build JSX for Actor to clean up name repeats and fold in hover info
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
                {actor} set the invoice amount to <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} changed the invoice amount from <span className="line-through text-[#8a8f98] font-mono">{formatCurrency(oldVal)}</span> to <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(newVal)}</span>
            </span>
          );
        }
        
        if (key === 'dueDate') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set the due date to <span className="font-bold text-[#f7f8f8]">{formatDateValue(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} pushed the due date from <span className="line-through text-[#8a8f98]">{formatDateValue(oldVal)}</span> to <span className="font-bold text-[#f7f8f8]">{formatDateValue(newVal)}</span>
            </span>
          );
        }

        if (key === 'paymentStatus') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set payment status to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} changed payment status from <span className="line-through text-[#8a8f98]">{String(oldVal)}</span> to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span>
            </span>
          );
        }

        if (key === 'clientName') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set client name to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} updated client name from <span className="line-through text-[#8a8f98]">{String(oldVal)}</span> to <span className="font-bold text-[#f7f8f8]">{String(newVal)}</span>
            </span>
          );
        }

        if (key === 'contactEmail') {
          if (isFirstTime) {
            return (
              <span>
                {actor} set contact email to <span className="font-semibold text-[#f7f8f8]">{String(newVal)}</span>
              </span>
            );
          }
          return (
            <span>
              {actor} updated contact email from <span className="line-through text-[#8a8f98]">{String(oldVal)}</span> to <span className="font-semibold text-[#f7f8f8]">{String(newVal)}</span>
            </span>
          );
        }

        // Fallback for single unknown field
        return (
          <span>
            {actor} updated <span className="font-semibold text-[#f7f8f8]">{key}</span>
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
          {actor} created invoice <span className="font-semibold text-[#f7f8f8] font-mono">{invoice?.invoiceNo}</span> for <span className="font-bold text-[#f7f8f8] font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span>
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
          {actor} imported invoice <span className="font-semibold text-[#f7f8f8] font-mono">{invoice?.invoiceNo}</span>
        </span>
      );
    }
    if (type === 'payment.received') {
      return (
        <span>
          Payment of <span className="font-bold text-[#27a644] font-mono">{formatCurrency(invoice?.invoiceAmount ?? 0)}</span> received successfully
        </span>
      );
    }
    if (type === 'payment.link_generated') {
      return (
        <span>
          Payment link generated for <span className="font-semibold text-[#f7f8f8]">{invoice?.clientName}</span>
        </span>
      );
    }
    if (type === 'followup.triggered') {
      const tone = String(event.payload?.tone || 'default');
      return (
        <span>
          {actor} triggered AI follow-up (tone: <span className="font-mono bg-[#141516] text-[#f7f8f8] px-1.5 py-0.5 rounded text-[11px] border border-[#23252a]">{tone}</span>)
        </span>
      );
    }
    if (type === 'followup.sent') {
      const recipient = getRecipientEmail(event);
      return (
        <span>
          Autopilot sent follow-up email to <span className="font-semibold text-[#f7f8f8]">{recipient}</span>
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

  const mergeGroup = (group: GroupedInvoiceEvent[]): GroupedInvoiceEvent => {
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
      if (payload?.reason === 'no_automated_channel') {
        return (
          <div>
            <p className="font-semibold text-[#f7f8f8]">Follow-up halted</p>
            <p className="text-xs text-[#8a8f98] mt-1">
              No automated communication channels configured for the <span className="font-mono bg-[#141516] text-[#f7f8f8] px-1.5 py-0.5 rounded border border-[#23252a]">{String(payload.tier || 'unknown')}</span> tier.
            </p>
          </div>
        );
      }
    }
    if (type.includes('skipped')) {
      return (
        <div>
          <p className="font-semibold text-[#f7f8f8]">Follow-up skipped</p>
          <p className="text-xs text-[#8a8f98] mt-1">
            Skipped because a follow-up was recently sent.
          </p>
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

  return (
    <div className="h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4">
      {/* Top Fixed Area (Alerts & Header) */}
      <div className="flex-shrink-0 space-y-4">
        {/* Action Failed Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl p-4 flex items-start gap-3 relative shadow-none animate-in fade-in">
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

        {/* Trashed Invoice Alert Banner */}
        {isTrashed && (
          <div className="bg-amber-950/40 border border-amber-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-300 text-xs">This invoice is in Trash</h4>
                <p className="text-amber-200/80 text-xs mt-0.5">
                  Moved on {new Date(invoice.deletedAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}. Read-only and excluded from automated follow-ups.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={async () => {
                    await restoreMutation.mutateAsync();
                  }}
                  disabled={restoreMutation.isPending}
                  className="px-3.5 py-1.5 bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] border border-[#34343a] rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#27a644]" />
                  {restoreMutation.isPending ? 'Restoring...' : 'Restore Invoice'}
                </button>
              )}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsPermanentDeleteModalOpen(true)}
                  disabled={permanentDeleteMutation.isPending}
                  className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-xl text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Permanently
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Review DLQ Warning Banner */}
        {!isTrashed && invoice.needsManualReview && (
          <div className="bg-amber-950/40 border border-amber-900/50 text-amber-300 rounded-xl p-4 flex items-start gap-3 shadow-none animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-xs text-amber-200">Needs Manual Review</h3>
              <p className="text-xs mt-1 text-amber-200/80 leading-relaxed">
                This invoice is currently in the Dead Letter Queue due to multiple consecutive automated delivery failures.
                Automated follow-ups are halted. Please check the recipient email address or provider settings, then manually retry or dismiss the DLQ entry to resume automated processing.
              </p>
            </div>
          </div>
        )}

        {/* TOP HEADER ROW: Breadcrumb, Title & 3-Dots Dropdown Menu */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2025]/80">
          <div className="space-y-1">
            <Link to={isTrashed ? "/invoices?status=trash" : "/invoices"} className="inline-flex items-center text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Invoices
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">{invoice.invoiceNo}</h1>
              {isTrashed && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-900/50">
                  Trashed
                </span>
              )}
            </div>
          </div>

          {/* 3-Dots Action Dropdown for Active Invoices */}
          {!isTrashed && user?.role !== 'viewer' && (
            <div className="relative">
              <button
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className="inline-flex items-center justify-center rounded-xl border border-[#23252a] bg-[#0f1011] text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#18191c] h-9 w-9 p-0 transition-all active:scale-[0.98] cursor-pointer"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {isActionsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsActionsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#23252a] bg-[#0f1011] shadow-2xl z-30 py-1.5 text-xs text-[#f7f8f8] animate-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center px-3.5 py-2.5 hover:bg-[#18191c] text-[#f7f8f8] transition-colors cursor-pointer"
                    >
                      <Edit className="mr-2.5 h-4 w-4 text-[#8a8f98]" />
                      Edit
                    </button>

                    {invoice.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          statusMutation.mutate('Paid');
                        }}
                        disabled={statusMutation.isPending}
                        className="w-full flex items-center px-3.5 py-2.5 hover:bg-[#18191c] text-[#27a644] transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <CheckCircle2 className="mr-2.5 h-4 w-4 text-[#27a644]" />
                        Mark as Paid
                      </button>
                    )}

                    {invoice.hasActivePaymentPlan && (
                      <button
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          cancelPlanMutation.mutate();
                        }}
                        disabled={cancelPlanMutation.isPending}
                        className="w-full flex items-center px-3.5 py-2.5 hover:bg-[#18191c] text-amber-400 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <XCircle className="mr-2.5 h-4 w-4 text-amber-400" />
                        Cancel Payment Plan
                      </button>
                    )}

                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <button
                        onClick={() => {
                          setIsActionsMenuOpen(false);
                          handleDelete();
                        }}
                        className="w-full flex items-center px-3.5 py-2.5 hover:bg-[#18191c] text-red-400 transition-colors border-t border-[#23252a] mt-1 pt-2.5 cursor-pointer"
                      >
                        <Trash2 className="mr-2.5 h-4 w-4 text-red-400" />
                        Delete Invoice
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN (2/3 Width) - Tabs & Tab Panels */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0 overflow-hidden">
          {/* TABBED SUB-NAVIGATION BAR */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-[#0f1011] border border-[#23252a] rounded-xl flex-shrink-0 mb-4 w-fit">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-[#18191c] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                  : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Timeline</span>
              {accumulatedTimeline.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#23252a] text-[#8a8f98] font-bold">
                  {totalTimelineCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'emails'
                  ? 'bg-[#18191c] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                  : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Emails &amp; Messages</span>
              {communications && communications.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#23252a] text-[#8a8f98] font-bold">
                  {communications.length}
                </span>
              )}
            </button>

            {invoice.hasActivePaymentPlan && (
              <button
                onClick={() => setActiveTab('payment-plan')}
                className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'payment-plan'
                    ? 'bg-[#18191c] text-[#f7f8f8] border border-[#34343a] font-semibold shadow-xs'
                    : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Payment Plan</span>
                <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  Active
                </span>
              </button>
            )}
          </div>

          {/* TAB CONTENT AREA (FLEX FULL HEIGHT, INTERNALLY SCROLLABLE) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            {/* 1. ACTIVITY & TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {isTimelineLoading && accumulatedTimeline.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-[#8a8f98]" />
                  </div>
                ) : accumulatedTimeline.length === 0 ? (
                  <div className="text-center py-12 text-[#8a8f98] text-xs">
                    No activity recorded yet for this invoice.
                  </div>
                ) : (
                  <div className="relative border-l border-[#1e2025] ml-3.5 space-y-4 py-1">
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
                          <div key={event.id} className="relative pl-6">
                            <div className={`absolute -left-3 top-1.5 h-6 w-6 rounded-full bg-[#13161c] border border-[#1e2025] flex items-center justify-center ${getEventIconStyles(event)}`}>
                              {renderEventIcon(event)}
                            </div>

                            <div className="bg-[#13161c]/40 rounded-xl p-3.5 border border-[#1e2025]/80 hover:bg-[#13161c]/70 transition-all">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                <div className="text-xs text-[#f7f8f8] leading-snug">
                                  {getEventHeading(event)}
                                  {event.isGrouped && (
                                    <button 
                                      onClick={() => toggleGroup(event.id)}
                                      className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-[#13161c] hover:bg-[#1d212a] text-[#8a8f98] border border-[#1e2025] rounded-full transition-all inline-flex items-center gap-1 active:scale-95 cursor-pointer"
                                    >
                                      <span>{event.editsCount} edits</span>
                                      <span>{isExpanded ? '▲' : '▼'}</span>
                                    </button>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#8a8f98] font-medium whitespace-nowrap self-start sm:self-center">
                                  {new Date(event.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}, {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                              </div>

                              {event.isGrouped && isExpanded && (
                                <div className="mt-3 pl-3 border-l-2 border-[#1e2025] space-y-1.5 py-1 text-xs text-[#8a8f98]">
                                  <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-wider mb-1">Edit Revisions ({event.editsCount})</p>
                                  {event.subEvents?.map((sub: InvoiceEvent) => {
                                    const subKeys = Object.keys({ ...sub.oldValues, ...sub.newValues }).filter(k => sub.oldValues?.[k] !== sub.newValues?.[k]);
                                    const subKey = subKeys[0];
                                    const oldV = sub.oldValues?.[subKey];
                                    const newV = sub.newValues?.[subKey];

                                    const isSubFirstTime = oldV === null || oldV === undefined || oldV === '' || String(oldV).toLowerCase() === 'none';
                                    const formattedOld = subKey === 'invoiceAmount' ? formatCurrency(oldV) : subKey === 'dueDate' ? formatDateValue(oldV) : String(oldV || '—');
                                    const formattedNew = subKey === 'invoiceAmount' ? formatCurrency(newV) : subKey === 'dueDate' ? formatDateValue(newV) : String(newV || '—');

                                    return (
                                      <div key={sub.id} className="flex justify-between items-center py-1 border-b border-[#1e2025]/50 last:border-0">
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
                                <div className="mt-3 pl-3 border-l-2 border-[#1e2025] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 py-1 text-xs text-[#8a8f98]">
                                  {[...keys]
                                    .sort((a, b) => (FIELD_ORDER[a] ?? 99) - (FIELD_ORDER[b] ?? 99))
                                    .map((key) => {
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
                                              <span className="font-semibold text-[#f7f8f8] ml-1">{formattedNew}</span>
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
                                <div className="text-xs text-[#8a8f98] mt-2 pl-3 border-l-2 border-[#1e2025] py-0.5">
                                  {renderEventDescription(event)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {hasNextPage && (
                  <div className="flex justify-center pt-3">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 border border-[#1e2025] hover:border-[#2e3444] text-xs font-medium rounded-xl bg-[#13161c] text-[#f7f8f8] hover:bg-[#1d212a] transition-all disabled:opacity-40 inline-flex items-center gap-2"
                    >
                      {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin text-[#8a8f98]" />}
                      Load More Events
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. EMAILS & MESSAGES TAB (INCLUDES TRIGGER FOLLOW-UP BUTTON AT TOP) */}
            {activeTab === 'emails' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between bg-[#13161c]/40 p-4 rounded-xl border border-[#1e2025]/80">
                  <div>
                    <h3 className="text-xs font-semibold text-[#f7f8f8]">Email & Communication Log</h3>
                    <p className="text-[11px] text-[#8a8f98] mt-0.5">Automated reminders and debtor messages for this invoice.</p>
                  </div>

                  {user?.role !== 'viewer' && invoice.paymentStatus !== 'Paid' && !isTrashed && (
                    <button
                      onClick={handleTriggerFollowup}
                      disabled={agentMutation.isPending}
                      className="inline-flex items-center justify-center rounded-xl text-xs font-semibold transition-all bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] h-9 px-4 disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      {agentMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[#010102]" /> : <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" />}
                      Trigger Follow-up
                    </button>
                  )}
                </div>

                {isCommsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-[#8a8f98]" />
                  </div>
                ) : (
                  <CommunicationList communications={communications || []} />
                )}
              </div>
            )}

            {/* 3. PAYMENT PLAN TAB */}
            {activeTab === 'payment-plan' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {(() => {
                  const instList = invoice.hasActivePaymentPlan && installmentsResponse?.data
                    ? (installmentsResponse.data as Array<{ id: string; installmentNumber: number; dueDate: string; amount: string; currency: string; status: string }>)
                    : [];
                  const totalInst = instList.length;
                  const paidInst = instList.filter(i => i.status === 'paid').length;
                  const percentPaid = totalInst > 0 ? Math.round((paidInst / totalInst) * 100) : 0;

                  return (
                    <div className="bg-[#13161c]/40 p-5 rounded-2xl border border-[#1e2025]/80 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#1e2025]/80">
                        <h3 className="text-xs font-semibold text-[#f7f8f8] flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#27a644]" /> Agreed Installment Schedule
                        </h3>
                        <span className="text-xs font-bold text-[#27a644] bg-[#27a644]/10 border border-[#27a644]/20 px-2.5 py-0.5 rounded-full">
                          {paidInst} of {totalInst} Paid ({percentPaid}%)
                        </span>
                      </div>

                      <div className="flex gap-1.5 h-2.5 w-full rounded-full overflow-hidden bg-[#0e1013]/60 p-0.5 border border-[#1e2025]/80">
                        {instList.map((item, idx) => {
                          let bgColor = 'bg-[#2a2e39]';
                          if (item.status === 'paid') bgColor = 'bg-[#27a644]';
                          else if (item.status === 'overdue') bgColor = 'bg-red-500 animate-pulse';
                          else if (item.status === 'pending' && idx === paidInst) bgColor = 'bg-amber-400';

                          return (
                            <div
                              key={item.id}
                              className={`h-full flex-1 rounded-sm transition-all duration-300 ${bgColor}`}
                              title={`Installment #${item.installmentNumber}: ${item.status.toUpperCase()} (${formatCurrency(item.amount)})`}
                            />
                          );
                        })}
                      </div>

                      <div className="overflow-hidden border border-[#1e2025]/80 rounded-xl bg-[#0e1013]/40">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#13161c]/80 border-b border-[#1e2025] text-[#8a8f98]">
                            <tr>
                              <th className="px-3.5 py-2.5 font-semibold">Installment</th>
                              <th className="px-3.5 py-2.5 font-semibold">Due Date</th>
                              <th className="px-3.5 py-2.5 font-semibold">Amount</th>
                              <th className="px-3.5 py-2.5 font-semibold text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1e2025]/50 text-[#d0d6e0]">
                            {instList.map((item) => (
                              <tr key={item.id} className="hover:bg-[#13161c]/50 transition-colors">
                                <td className="px-3.5 py-2.5 font-semibold text-[#f7f8f8]">Installment #{item.installmentNumber}</td>
                                <td className="px-3.5 py-2.5">{new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                <td className="px-3.5 py-2.5 font-mono font-medium">{formatCurrency(item.amount)}</td>
                                <td className="px-3.5 py-2.5 text-right">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    item.status === 'paid' ? 'bg-[#27a644]/15 text-[#27a644] border border-[#27a644]/30' :
                                    item.status === 'overdue' ? 'bg-red-950/40 text-red-400 border border-red-900/50' :
                                    'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1/3 Width) - Unified Summary & Links Card */}
        <div className="lg:col-span-1 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
          <div className="bg-[#13161c]/40 p-6 rounded-2xl border border-[#1e2025]/80 space-y-6">
            
            {/* 1. Summary Section: Amount, Status, Company Name, Contact, Description */}
            <div className="space-y-4 pb-5 border-b border-[#1e2025]/80">
              <div>
                <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider block mb-1">Amount</span>
                <span className="text-3xl font-extrabold text-[#f7f8f8] tracking-tight">{formatCurrency(invoice.invoiceAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8a8f98]">Status</span>
                <Badge variant={
                  invoice.paymentStatus === 'Paid' ? 'success' : 
                  invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
                }>
                  {invoice.paymentStatus}
                </Badge>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[#8a8f98]">Company Name</span>
                  <span className="font-semibold text-[#f7f8f8]">{invoice.clientName}</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-[#8a8f98]">Contact</span>
                  <a href={`mailto:${invoice.contactEmail}`} className="font-medium text-[#5e6ad2] hover:underline">
                    {invoice.contactEmail}
                  </a>
                </div>

                {invoice.subject && (
                  <div className="pt-2">
                    <span className="text-[#8a8f98] text-[11px] block mb-1">Description</span>
                    <p className="text-xs text-[#d0d6e0] bg-[#0e1013]/60 p-2.5 rounded-lg border border-[#1e2025]">
                      {invoice.subject}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs pt-2 border-t border-[#1e2025]/50">
                {invoice.hasActivePaymentPlan ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8a8f98]">Original Due Date</span>
                      <span className="font-semibold text-[#f7f8f8]">
                        {new Date(invoice.originalDueDate || invoice.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {(() => {
                      const instList = installmentsResponse?.data
                        ? (installmentsResponse.data as Array<{ id: string; installmentNumber: number; dueDate: string; amount: string; currency: string; status: string }>)
                        : [];
                      const nextInst = instList.find(i => i.status === 'pending' || i.status === 'overdue');
                      return (
                        <div className="flex justify-between items-center">
                          <span className="text-[#8a8f98]">Next Installment Due Date</span>
                          <span className="font-semibold text-[#5e6ad2]">
                            {nextInst ? new Date(nextInst.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'All Paid'}
                          </span>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8f98]">Due Date</span>
                    <span className="font-semibold text-[#f7f8f8]">
                      {new Date(invoice.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {(invoice.daysOverdue ?? 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8f98]">Days Overdue</span>
                    <span className="font-bold text-red-400">
                      {invoice.daysOverdue} Days
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-[#8a8f98]">Follow-ups Sent</span>
                  <span className="font-semibold text-[#f7f8f8]">{invoice.followupCount}</span>
                </div>
              </div>
            </div>

            {/* 2. Payment Link Section */}
            <div className="space-y-2.5 text-xs pb-5 border-b border-[#1e2025]/80">
              <div className="flex items-center justify-between">
                <span className="text-[#8a8f98] font-medium">Payment Link</span>
                {invoice.paymentLink && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    invoice.paymentLink.status === 'active' ? 'bg-[#5e6ad2]/15 text-[#5e6ad2]' :
                    invoice.paymentLink.status === 'paid' ? 'bg-[#27a644]/15 text-[#27a644]' : 'bg-[#13161c] text-[#8a8f98]'
                  }`}>
                    {invoice.paymentLink.status.toUpperCase()}
                  </span>
                )}
              </div>

              {invoice.paymentLink ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={invoice.paymentLink.url} 
                      className="w-full text-xs p-2 border border-[#1e2025] rounded-lg bg-[#0e1013]/60 text-[#d0d6e0] font-mono truncate"
                      title={invoice.paymentLink.url}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(invoice.paymentLink!.url);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="px-2.5 py-2 bg-[#13161c] border border-[#1e2025] rounded-lg text-xs font-medium text-[#f7f8f8] hover:bg-[#1d212a] transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#27a644]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {invoice.paymentStatus !== 'Paid' && user?.role !== 'viewer' && !isTrashed && (
                    <button
                      onClick={() => generateLinkMutation.mutate()}
                      disabled={generateLinkMutation.isPending}
                      className="w-full inline-flex items-center justify-center rounded-xl text-xs font-medium border border-[#1e2025] bg-[#13161c] hover:bg-[#1d212a] text-[#8a8f98] hover:text-[#f7f8f8] h-7 px-3 transition-colors disabled:opacity-40"
                    >
                      {generateLinkMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                      Regenerate Payment Link
                    </button>
                  )}
                </div>
              ) : (
                invoice.paymentStatus !== 'Paid' && user?.role !== 'viewer' && !isTrashed ? (
                  <button
                    onClick={() => generateLinkMutation.mutate()}
                    disabled={generateLinkMutation.isPending}
                    className="w-full inline-flex items-center justify-center rounded-xl text-xs font-medium border border-[#1e2025] bg-[#13161c] hover:bg-[#1d212a] text-[#f7f8f8] h-8 px-3 transition-colors disabled:opacity-40"
                  >
                    {generateLinkMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                    Generate Payment Link
                  </button>
                ) : null
              )}
            </div>
            {/* 3. Debtor Portal Section */}
            {(user?.role === 'admin' || user?.role === 'manager') && !isTrashed && (
              <div className="space-y-3 text-xs pt-1">
                <span className="text-[#8a8f98] font-medium block">Debtor Portal</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenPortal}
                    className="flex-1 inline-flex items-center justify-center rounded-xl text-xs font-semibold border border-[#23252a] bg-[#0f1011] hover:bg-[#18191c] text-[#f7f8f8] h-9 px-3 transition-colors active:scale-[0.98] cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
                    Open Portal
                  </button>
                  <button
                    onClick={handleCopyPortalLink}
                    className="flex-1 inline-flex items-center justify-center rounded-xl text-xs font-semibold border border-[#23252a] bg-[#0f1011] hover:bg-[#18191c] text-[#f7f8f8] h-9 px-3 transition-colors active:scale-[0.98] cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#27a644] mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* MODALS */}
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
          <p className="text-xs text-[#8a8f98]">
            This action cannot be undone. All event logs, metrics, and associated data for Invoice <strong className="text-[#f7f8f8]">{invoice.invoiceNo}</strong> will be permanently soft-deleted.
          </p>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#1e2025]">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-[#1e2025] hover:bg-[#1d212a] text-xs font-medium rounded-xl bg-[#13161c] text-[#f7f8f8] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-xl transition-all inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete Invoice
            </button>
          </div>
        </div>
      </Modal>

      {isPermanentDeleteModalOpen && invoice && (
        <ConfirmDestructiveModal
          isOpen={isPermanentDeleteModalOpen}
          onClose={() => setIsPermanentDeleteModalOpen(false)}
          onConfirm={async () => {
            await permanentDeleteMutation.mutateAsync();
          }}
          invoiceNo={invoice.invoiceNo}
          clientName={invoice.clientName}
          amountDisplay={formatCurrency(invoice.invoiceAmount)}
        />
      )}
    </div>
  );
}
