import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService, type InboundEmailReview, type DisputeStatus, type ThreadItem } from '../services/dispute';
import { 
  MessageSquare, CheckCircle, RefreshCw, Edit3, Clock, ChevronDown, ChevronUp, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle, Send, RotateCcw, Archive
} from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';
import { parseEmailBody, stripHtml } from '../utils/email-utils';

function getAiSummary(item: InboundEmailReview): string {
  if (item.aiSummary && item.aiSummary.trim()) {
    return item.aiSummary.trim();
  }
  if (item.summary && item.summary.trim()) {
    return item.summary.trim();
  }
  if (item.reasoning && item.reasoning.trim()) {
    return item.reasoning.trim();
  }
  return parseEmailBody(item.body || item.subject || '').replyText || '';
}

export type DisputeTab = 'all' | 'dispute' | 'question' | 'payment_promise' | 'unclear';

const CATEGORY_QUICK_INSTRUCTIONS: Record<string, { chips: string[]; placeholder: string }> = {
  dispute: {
    chips: [
      "Amount is correct",
      "Service delivered in full",
      "Offer 5% discount if paid today",
      "Issue credit note",
      "Request PO / contract proof",
    ],
    placeholder: "e.g., Amount is correct as per contract section 3, or offer 5% discount if paid today...",
  },
  question: {
    chips: [
      "Send online payment portal link",
      "Provide bank transfer details",
      "Attach invoice PDF copy",
      "Clarify line items & terms",
      "Send account statement",
    ],
    placeholder: "e.g., You can pay online via portal link, or wire to bank account XYZ...",
  },
  payment_promise: {
    chips: [
      "Confirm extension approved",
      "Send payment reminder on agreed date",
      "Request partial payment now",
      "Thank customer for update",
    ],
    placeholder: "e.g., Extended payment date to Friday, please confirm payment confirmation...",
  },
  unclear: {
    chips: [
      "Ask customer to clarify issue",
      "Request invoice reference number",
      "Offer phone callback",
    ],
    placeholder: "e.g., Please clarify invoice number and payment date...",
  },
};

import { useLocation } from 'react-router-dom';

export function Disputes() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [activeStatus, setActiveStatus] = useState<DisputeStatus>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const s = searchParams.get('status');
    if (s === 'pending' || s === 'resolved' || s === 'all') return s as DisputeStatus;
    return 'pending';
  });
  const [activeCategory, setActiveCategory] = useState<DisputeTab>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const cat = searchParams.get('category') || searchParams.get('classification');
    if (cat === 'dispute' || cat === 'question' || cat === 'payment_promise' || cat === 'unclear' || cat === 'all') {
      return cat as DisputeTab;
    }
    return 'all';
  });
  const [page, setPage] = useState(1);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [failedDraftId, setFailedDraftId] = useState<string | null>(null);
  const [prevSearch, setPrevSearch] = useState(location.search);

  if (prevSearch !== location.search) {
    setPrevSearch(location.search);
    const searchParams = new URLSearchParams(location.search);
    const s = searchParams.get('status');
    const cat = searchParams.get('category') || searchParams.get('classification');
    if (s === 'pending' || s === 'resolved' || s === 'all') {
      setActiveStatus(s as DisputeStatus);
    }
    if (cat === 'dispute' || cat === 'question' || cat === 'payment_promise' || cat === 'unclear' || cat === 'all') {
      setActiveCategory(cat as DisputeTab);
    }
  }

  // 1. Fetch disputes with status and classification parameters
  const { data: disputesData, isLoading: isDisputesLoading, error: disputesError, refetch: refetchDisputes } = useQuery({
    queryKey: ['disputes', activeStatus, activeCategory, page],
    queryFn: () => disputeService.getDisputes({
      status: activeStatus,
      classification: activeCategory,
      page,
      limit: 25,
    }),
  });

  // 2. Generate Draft Mutation
  const generateDraftMutation = useMutation({
    mutationFn: ({ id, tenantInstruction }: { id: string; tenantInstruction: string }) =>
      disputeService.generateDraft(id, tenantInstruction),
    onMutate: ({ id }) => {
      setGeneratingId(id);
      setFailedDraftId(null);
    },
    onSuccess: (data, variables) => {
      setEditingId(variables.id);
      setDraftResponse(data.suggestedResponse);
      setFailedDraftId(null);
    },
    onError: (_err, variables) => {
      setFailedDraftId(variables.id);
    },
    onSettled: () => {
      setGeneratingId(null);
    },
  });

  // 3. Send Reply Mutation
  const sendReplyMutation = useMutation({
    mutationFn: ({ id, responseBody }: { id: string; responseBody: string }) => 
      disputeService.sendReply(id, responseBody),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setEditingId(null);
      setDraftResponse('');
    },
  });

  // 4. Status Transition Mutation (Pending <-> Resolved <-> Archived)
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DisputeStatus }) =>
      disputeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      setEditingId(null);
    },
  });

  const handleGenerateDraft = (id: string, tenantInstruction: string) => {
    generateDraftMutation.mutate({ id, tenantInstruction });
  };

  const handleStartEdit = (item: InboundEmailReview) => {
    setEditingId(item.id);
    setDraftResponse(item.suggestedResponse || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSendReply = (item: InboundEmailReview) => {
    const replyContent = (editingId === item.id ? draftResponse : (draftResponse || item.suggestedResponse || '')).trim();
    if (!replyContent) return;
    sendReplyMutation.mutate({ id: item.id, responseBody: replyContent });
  };

  const handleMarkStatus = (id: string, status: DisputeStatus) => {
    statusMutation.mutate({ id, status });
  };

  const toggleExpandGroup = (groupKey: string) => {
    setExpandedGroupKey(prev => (prev === groupKey ? null : groupKey));
  };

  if (isDisputesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const disputesList = disputesData?.data || [];
  const pagination = disputesData?.pagination;
  const statusCounts = disputesData?.statusCounts || { pending: 0, resolved: 0, archived: 0 };
  const categoryCounts = disputesData?.categoryCounts || { all: 0, dispute: 0, question: 0, payment_promise: 0, unclear: 0 };

  // Group items by invoice / groupKey
  interface InboundGroup {
    groupKey: string;
    invoiceId?: string | null;
    invoiceNo?: string | null;
    clientName?: string | null;
    sender: string;
    items: InboundEmailReview[];
    latestCreatedAt: string;
  }

  const groupMap = new Map<string, InboundGroup>();
  const groupedList: InboundGroup[] = [];

  for (const item of disputesList) {
    const groupKey = item.invoiceId 
      ? item.invoiceId 
      : (item.invoiceNo ? item.invoiceNo : item.id);

    if (!groupMap.has(groupKey)) {
      const group: InboundGroup = {
        groupKey,
        invoiceId: item.invoiceId,
        invoiceNo: item.invoiceNo,
        clientName: item.clientName,
        sender: item.sender,
        items: [],
        latestCreatedAt: item.createdAt,
      };
      groupMap.set(groupKey, group);
      groupedList.push(group);
    }
    const group = groupMap.get(groupKey)!;
    group.items.push(item);
    if (new Date(item.createdAt) > new Date(group.latestCreatedAt)) {
      group.latestCreatedAt = item.createdAt;
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 bg-[#010102] text-[#f7f8f8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f7f8f8] tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#5e6ad2]" />
            Disputes Review Queue
          </h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">
            Review inbound customer communications, generate AI draft replies, and manage dispute resolution lifecycle.
          </p>
        </div>

        <button
          onClick={() => refetchDisputes()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516] hover:border-[#34343a] rounded-md transition-all shadow-none self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#8a8f98]" />
          <span>Refresh</span>
        </button>
      </div>

      {disputesError && (
        <div className="p-3.5 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Failed to load disputes: {getErrorMessage(disputesError)}</span>
        </div>
      )}

      {/* Primary Navigation Tabs (Status) */}
      <div className="border-b border-[#23252a]">
        <nav className="flex space-x-4">
          <button
            onClick={() => { setActiveStatus('pending'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-medium text-xs flex items-center space-x-2 transition-colors ${
              activeStatus === 'pending'
                ? 'border-[#5e6ad2] text-[#5e6ad2]'
                : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
              activeStatus === 'pending' ? 'bg-[#5e6ad2]/10 text-[#5e6ad2] border border-[#5e6ad2]/20' : 'bg-[#141516] text-[#8a8f98] border border-[#23252a]'
            }`}>
              {statusCounts.pending}
            </span>
          </button>

          <button
            onClick={() => { setActiveStatus('resolved'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-medium text-xs flex items-center space-x-2 transition-colors ${
              activeStatus === 'resolved'
                ? 'border-[#27a644] text-[#27a644]'
                : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]'
            }`}
          >
            <span>Resolved</span>
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
              activeStatus === 'resolved' ? 'bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20' : 'bg-[#141516] text-[#8a8f98] border border-[#23252a]'
            }`}>
              {statusCounts.resolved}
            </span>
          </button>

          <button
            onClick={() => { setActiveStatus('archived'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-medium text-xs flex items-center space-x-2 transition-colors ${
              activeStatus === 'archived'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]'
            }`}
          >
            <span>Archived</span>
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
              activeStatus === 'archived' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-[#141516] text-[#8a8f98] border border-[#23252a]'
            }`}>
              {statusCounts.archived}
            </span>
          </button>
        </nav>
      </div>

      {/* Secondary Sub-Category Filters */}
      <div className="flex flex-wrap gap-2 pt-1">
        {([
          { id: 'all', label: 'All', count: categoryCounts.all },
          { id: 'dispute', label: 'Disputes', count: categoryCounts.dispute },
          { id: 'question', label: 'Questions', count: categoryCounts.question },
          { id: 'payment_promise', label: 'Payment Promises', count: categoryCounts.payment_promise },
          { id: 'unclear', label: 'Unclear', count: categoryCounts.unclear },

        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveCategory(tab.id as DisputeTab); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-1.5 border ${
              activeCategory === tab.id
                ? 'bg-[#5e6ad2]/20 text-[#5e6ad2] border-[#5e6ad2]/30 shadow-none'
                : 'bg-[#141516] text-[#8a8f98] border-[#23252a] hover:bg-[#18191a] hover:text-[#f7f8f8]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
              activeCategory === tab.id ? 'bg-[#5e6ad2]/30 text-[#f7f8f8]' : 'bg-[#23252a] text-[#8a8f98]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Review Queue List */}
      {groupedList.length === 0 ? (
        <div className="bg-[#0f1011] border border-[#23252a] rounded-xl p-12 text-center space-y-3">
          <CheckCircle className="w-10 h-10 text-[#5e6ad2] mx-auto opacity-80" />
          <h3 className="text-sm font-semibold text-[#f7f8f8]">
            No {activeStatus} items found
          </h3>
          <p className="text-xs text-[#8a8f98] max-w-sm mx-auto">
            {activeStatus === 'pending'
              ? 'All customer replies have been processed and resolved.'
              : `There are currently no items marked as ${activeStatus}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] text-[#8a8f98] font-semibold uppercase tracking-wider px-1">
            <span className="capitalize">{activeStatus} Items ({groupedList.length})</span>
          </div>

          {groupedList.map((group) => {
            const isGroupExpanded = expandedGroupKey === group.groupKey;
            const primaryItem = group.items[0];
            const uniqueClassifications = Array.from(
              new Set(group.items.map((i) => i.classification).filter(Boolean))
            );

            return (
              <div
                key={group.groupKey}
                className="bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] rounded-xl transition-all overflow-hidden shadow-none"
              >
                {/* Group Box Header */}
                <div
                  onClick={() => toggleExpandGroup(group.groupKey)}
                  className="p-4 cursor-pointer hover:bg-[#141516]/60 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {group.clientName && (
                        <span className="font-bold text-[#f7f8f8] bg-[#141516] px-2.5 py-1 rounded-md border border-[#23252a] shadow-none">
                          {group.clientName}
                        </span>
                      )}
                      {group.invoiceId ? (
                        <Link 
                          to={`/invoices/${group.invoiceId}`} 
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          className="inline-flex items-center font-bold text-[#5e6ad2] hover:text-[#828fff] bg-[#5e6ad2]/10 hover:bg-[#5e6ad2]/20 px-2.5 py-1 rounded-md border border-[#5e6ad2]/20 transition-colors shadow-none"
                        >
                          Invoice: #{group.invoiceNo || group.invoiceId}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      ) : group.invoiceNo ? (
                        <span className="font-bold text-[#5e6ad2] bg-[#5e6ad2]/10 px-2.5 py-1 rounded-md border border-[#5e6ad2]/20 shadow-none">
                          Invoice: #{group.invoiceNo}
                        </span>
                      ) : null}
                      <span className="font-medium text-[#8a8f98] bg-[#010102] px-2.5 py-1 rounded-md border border-[#23252a]">
                        {group.sender}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Render all unique classification tags for this invoice */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {uniqueClassifications.map((cat) => (
                          <span
                            key={cat}
                            className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${
                              classificationConfigs[cat]?.bg || classificationConfigs.unclear.bg
                            }`}
                          >
                            {classificationConfigs[cat]?.label || 'Unclear'}
                          </span>
                        ))}
                      </div>

                      <span className="text-[#8a8f98] text-xs font-medium flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#62666d]" />
                        {new Date(group.latestCreatedAt).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className="p-1 hover:bg-[#141516] rounded text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                      >
                        {isGroupExpanded ? <ChevronUp className="w-4 h-4 text-[#8a8f98]" /> : <ChevronDown className="w-4 h-4 text-[#8a8f98]" />}
                      </button>
                    </div>
                  </div>

                  {/* One Line Summary of latest customer reply */}
                  <div className="bg-[#010102] border border-[#23252a] rounded-lg p-2.5 text-xs text-[#d0d6e0] font-medium truncate">
                    {getAiSummary(primaryItem) || '(No preview content)'}
                  </div>
                </div>

                {/* Expanded Box Content */}
                {isGroupExpanded && (() => {
                  // Build a single unified, strictly chronological timeline for the invoice group
                  const groupTimelineItems: Array<{
                    id: string;
                    kind: 'inbound' | 'outbound';
                    timestamp: number;
                    inboundItem?: InboundEmailReview;
                    outboundMsg?: ThreadItem;
                  }> = [];

                  // 1. Add all inbound emails in group.items
                  for (const item of group.items) {
                    groupTimelineItems.push({
                      id: item.id,
                      kind: 'inbound',
                      timestamp: new Date(item.createdAt).getTime(),
                      inboundItem: item,
                    });
                  }

                  // 2. Add all unique outbound replies from item.thread across group.items
                  const outboundMap = new Map<string, ThreadItem>();
                  for (const item of group.items) {
                    for (const msg of item.thread || []) {
                      if (msg.direction === 'outbound' && !outboundMap.has(msg.id)) {
                        outboundMap.set(msg.id, msg);
                      }
                    }
                  }

                  for (const msg of outboundMap.values()) {
                    groupTimelineItems.push({
                      id: msg.id,
                      kind: 'outbound',
                      timestamp: new Date(msg.createdAt).getTime(),
                      outboundMsg: msg,
                    });
                  }

                  // 3. Sort strictly by timestamp ascending (earliest to latest)
                  groupTimelineItems.sort((a, b) => a.timestamp - b.timestamp);

                  return (
                    <div className="border-t border-[#23252a] bg-[#010102] p-4 space-y-4">
                      {/* Unified Conversation Timeline for all items of this invoice */}
                      <div className="space-y-3">
                        {groupTimelineItems.map((tItem) => {
                          if (tItem.kind === 'inbound' && tItem.inboundItem) {
                            return <InboundChatBubble key={tItem.id} item={tItem.inboundItem} />;
                          }
                          if (tItem.kind === 'outbound' && tItem.outboundMsg) {
                            return <OutboundChatBubble key={tItem.id} msg={tItem.outboundMsg} />;
                          }
                          return null;
                        })}
                      </div>

                    {/* Single Reply & Auto-Generate Action Area */}
                    <ItemActionArea
                      item={primaryItem}
                      activeStatus={activeStatus}
                      isEditingThisItem={editingId === primaryItem.id}
                      draftResponse={editingId === primaryItem.id ? draftResponse : (primaryItem.suggestedResponse || '')}
                      setDraftResponse={setDraftResponse}
                      onStartEdit={handleStartEdit}
                      onCancelEdit={handleCancelEdit}
                      onSendReply={handleSendReply}
                      onGenerateDraft={handleGenerateDraft}
                      isGeneratingThisItem={generatingId === primaryItem.id}
                      failedDraftId={failedDraftId}
                      sendReplyPending={sendReplyMutation.isPending}
                    />

                    {/* Single Invoice Group Resolution Actions Bar (Once per Invoice Box) */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#23252a]">
                      {activeStatus === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'resolved'))}
                            className="px-3.5 py-1.5 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-none cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>

                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'archived'))}
                            className="px-3.5 py-1.5 bg-[#141516] hover:bg-[#18191a] text-[#f7f8f8] border border-[#23252a] rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5 text-[#8a8f98]" />
                            <span>Archive</span>
                          </button>
                        </>
                      )}

                      {activeStatus === 'resolved' && (
                        <>
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'pending'))}
                            className="px-3.5 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-none cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reopen to Pending</span>
                          </button>

                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'archived'))}
                            className="px-3.5 py-1.5 bg-[#141516] hover:bg-[#18191a] text-[#f7f8f8] border border-[#23252a] rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5 text-[#8a8f98]" />
                            <span>Archive</span>
                          </button>
                        </>
                      )}

                      {activeStatus === 'archived' && (
                        <>
                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'pending'))}
                            className="px-3.5 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-none cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reopen to Pending</span>
                          </button>

                          <button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => group.items.forEach((i) => handleMarkStatus(i.id, 'resolved'))}
                            className="px-3.5 py-1.5 bg-[#27a644] hover:bg-[#27a644]/80 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-none cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#23252a]">
          <p className="text-xs text-[#8a8f98]">
            Page <span className="font-semibold text-[#f7f8f8]">{pagination.page}</span> of{' '}
            <span className="font-semibold text-[#f7f8f8]">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1.5 text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] rounded-md border border-[#23252a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="p-1.5 text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] rounded-md border border-[#23252a] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Badge classification styling maps
const classificationConfigs: Record<string, { bg: string, text: string, label: string }> = {
  dispute: { bg: 'bg-red-950/40 text-red-400 border-red-900/50', label: 'Dispute', text: 'text-red-400' },
  question: { bg: 'bg-[#5e6ad2]/20 text-[#5e6ad2] border-[#5e6ad2]/30', label: 'Question', text: 'text-[#5e6ad2]' },
  payment_promise: { bg: 'bg-[#27a644]/10 text-[#27a644] border-[#27a644]/20', label: 'Payment Promise', text: 'text-[#27a644]' },
  unclear: { bg: 'bg-amber-950/40 text-amber-300 border-amber-900/50', label: 'Unclear', text: 'text-amber-300' },
};

function InboundChatBubble({ item }: { item: InboundEmailReview }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanReplyText = parseEmailBody(item.body || item.subject || '').replyText;
  const summaryText = getAiSummary(item);

  return (
    <div className="max-w-[85%] mr-auto bg-[#0f1011] border border-[#23252a] rounded-2xl rounded-tl-xs p-3.5 space-y-2 shadow-none">
      <div className="flex items-center justify-between text-xs text-[#8a8f98] gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#f7f8f8] uppercase tracking-wider text-[10px]">Customer Reply</span>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${
            classificationConfigs[item.classification]?.bg || classificationConfigs.unclear.bg
          }`}>
            {classificationConfigs[item.classification]?.label || 'Unclear'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#8a8f98]">
          <span className="text-[11px]">{new Date(item.createdAt).toLocaleString()}</span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-[#8a8f98] hover:text-[#f7f8f8] rounded transition-colors"
            title={isExpanded ? "Collapse email" : "Expand full email"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div 
          onClick={() => setIsExpanded(false)}
          className="bg-[#010102] border border-[#23252a] p-3 rounded-md text-xs text-[#f7f8f8] leading-relaxed font-sans whitespace-pre-wrap cursor-pointer hover:bg-[#141516]/60 transition-colors"
        >
          {cleanReplyText || '(No reply text)'}
        </div>
      ) : (
        <div 
          onClick={() => setIsExpanded(true)}
          className="bg-[#010102] border border-[#23252a] p-2.5 rounded-md text-xs text-[#d0d6e0] font-medium truncate cursor-pointer hover:bg-[#141516]/60 transition-colors"
        >
          {summaryText || cleanReplyText || '(No reply text)'}
        </div>
      )}
    </div>
  );
}

function OutboundChatBubble({ msg }: { msg: ThreadItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanText = stripHtml(msg.body || '');

  return (
    <div className="max-w-[85%] ml-auto bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-2xl rounded-tr-xs p-3.5 space-y-2 shadow-none">
      <div className="flex items-center justify-between text-xs text-[#5e6ad2] gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold uppercase tracking-wider text-[10px]">Tenant Reply</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#5e6ad2]/20 text-[#5e6ad2] rounded-full border border-[#5e6ad2]/30">
            💬 Dispute Agent
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#8a8f98]">
          <span className="text-[11px]">{new Date(msg.createdAt).toLocaleString()}</span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-[#8a8f98] hover:text-[#f7f8f8] rounded transition-colors"
            title={isExpanded ? "Collapse reply" : "Expand full reply"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div 
          onClick={() => setIsExpanded(false)}
          className="bg-[#0f1011] border border-[#23252a] p-3 rounded-md text-xs text-[#f7f8f8] leading-relaxed font-sans whitespace-pre-wrap cursor-pointer hover:bg-[#141516] transition-colors"
        >
          {cleanText || '(No message content)'}
        </div>
      ) : (
        <div 
          onClick={() => setIsExpanded(true)}
          className="bg-[#0f1011] border border-[#23252a] p-2.5 rounded-md text-xs text-[#d0d6e0] font-medium truncate cursor-pointer hover:bg-[#141516] transition-colors"
        >
          {msg.aiSummary || cleanText || '(No message content)'}
        </div>
      )}
    </div>
  );
}

function ItemActionArea({
  item,
  activeStatus,
  isEditingThisItem,
  draftResponse,
  setDraftResponse,
  onStartEdit,
  onCancelEdit,
  onSendReply,
  onGenerateDraft,
  isGeneratingThisItem,
  failedDraftId,
  sendReplyPending,
}: {
  item: InboundEmailReview;
  activeStatus: DisputeStatus;
  isEditingThisItem: boolean;
  draftResponse: string;
  setDraftResponse: (val: string) => void;
  onStartEdit: (item: InboundEmailReview) => void;
  onCancelEdit: () => void;
  onSendReply: (item: InboundEmailReview) => void;
  onGenerateDraft: (id: string, instruction: string) => void;
  isGeneratingThisItem: boolean;
  failedDraftId: string | null;
  sendReplyPending: boolean;
}) {
  const [instruction, setInstruction] = useState('');
  const categoryConfig = CATEGORY_QUICK_INSTRUCTIONS[item.classification] || CATEGORY_QUICK_INSTRUCTIONS.unclear;
  const activeDraftContent = (isEditingThisItem ? draftResponse : (draftResponse || item.suggestedResponse || '')).trim();

  const handleChipClick = (chipText: string) => {
    setInstruction(chipText);
  };

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Pending Status Specific AI Instruction & Response Controls */}
      {activeStatus === 'pending' && (
        <>
          {/* AI Reply Instruction Input Block */}
          <div className="bg-[#0f1011] border border-[#23252a] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#f7f8f8] uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2] mr-1.5" />
                AI Reply Instruction
              </label>
              <span className="text-[11px] text-[#8a8f98] font-normal">Select a quick instruction chip or type below</span>
            </div>

            {/* Category-aware Quick Instruction Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {categoryConfig.chips.map((chipText) => (
                <button
                  key={chipText}
                  type="button"
                  onClick={() => handleChipClick(chipText)}
                  className="px-2.5 py-1 text-xs font-medium bg-[#141516] text-[#f7f8f8] border border-[#23252a] hover:border-[#5e6ad2] hover:text-[#5e6ad2] hover:bg-[#5e6ad2]/10 rounded-full transition-colors flex items-center space-x-1 shadow-none"
                >
                  <span>+</span>
                  <span>{chipText}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={categoryConfig.placeholder}
                className="flex-1 px-3 py-2 text-xs border border-[#23252a] rounded-md focus:ring-1 focus:ring-[#5e69d1] bg-[#010102] text-[#f7f8f8]"
              />
              <button
                type="button"
                disabled={!instruction.trim() || isGeneratingThisItem}
                onClick={() => onGenerateDraft(item.id, instruction)}
                className="px-3.5 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-semibold disabled:opacity-40 flex items-center justify-center space-x-1.5 flex-shrink-0 transition-colors shadow-none"
              >
                {isGeneratingThisItem ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{draftResponse ? 'Regenerate Draft' : 'Generate Draft Response'}</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Generation Error & Retry state */}
            {failedDraftId === item.id && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>AI response generation timed out or failed. Please click retry.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onGenerateDraft(item.id, instruction || 'Generate standard response')}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs transition-colors flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Generated Response Box (when generated or edited) */}
          {(draftResponse || isEditingThisItem) && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold text-[#8a8f98] uppercase tracking-wider">Suggested Draft Response</h5>
                {!isEditingThisItem && (
                  <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    className="flex items-center text-xs font-medium text-[#5e6ad2] hover:text-[#828fff]"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit Draft
                  </button>
                )}
              </div>

              {isEditingThisItem ? (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    className="w-full p-3 border border-[#23252a] rounded-md text-xs font-sans focus:ring-1 focus:ring-[#5e69d1] bg-[#010102] text-[#f7f8f8]"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="px-3 py-1.5 border border-[#23252a] rounded-md text-xs font-medium text-[#8a8f98] bg-[#0f1011] hover:bg-[#141516] hover:text-[#f7f8f8]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0f1011] border border-[#23252a] p-3.5 rounded-md text-xs text-[#f7f8f8] font-sans whitespace-pre-wrap leading-relaxed">
                  {draftResponse}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Send Reply Action for this sub-box */}
      {activeStatus === 'pending' && (
        <div className="flex justify-end pt-2 border-t border-[#23252a]">
          <button
            type="button"
            disabled={sendReplyPending || !activeDraftContent}
            onClick={() => onSendReply(item)}
            className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-semibold disabled:opacity-40 flex items-center space-x-1.5 transition-colors shadow-none cursor-pointer"
          >
            {sendReplyPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send Reply</span>
          </button>
        </div>
      )}
    </div>
  );
}

