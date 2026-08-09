import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService, type InboundEmailReview, type DisputeStatus } from '../services/dispute';
import { 
  MessageSquare, CheckCircle, RefreshCw, Edit3, Clock, ChevronDown, ChevronUp, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle, Send, RotateCcw, Archive
} from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';
import { parseEmailBody, stripHtml } from '../utils/email-utils';

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
      "Thank customer & confirm deadline",
      "Send payment portal link",
      "Note promise date in records",
      "Offer installment plan if needed",
    ],
    placeholder: "e.g., Thank you for confirming payment by Friday, here is the payment link...",
  },
  unclear: {
    chips: [
      "Request more details & invoice reference",
      "Attach invoice copy & payment options",
      "Offer to schedule a call",
      "Send standard payment instructions",
    ],
    placeholder: "e.g., Please clarify invoice number and payment date...",
  },
};

export function Disputes() {
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<DisputeStatus>('pending');
  const [activeCategory, setActiveCategory] = useState<DisputeTab>('all');
  const [page, setPage] = useState(1);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [failedDraftId, setFailedDraftId] = useState<string | null>(null);

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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Disputes Review Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review inbound customer communications, generate AI draft replies, and manage dispute resolution lifecycle.
          </p>
        </div>

        <button
          onClick={() => refetchDisputes()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {disputesError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Failed to load disputes: {getErrorMessage(disputesError)}</span>
        </div>
      )}

      {/* Primary Navigation Tabs (Status) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => { setActiveStatus('pending'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-colors ${
              activeStatus === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              activeStatus === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {statusCounts.pending}
            </span>
          </button>

          <button
            onClick={() => { setActiveStatus('resolved'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-colors ${
              activeStatus === 'resolved'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Resolved</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              activeStatus === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {statusCounts.resolved}
            </span>
          </button>

          <button
            onClick={() => { setActiveStatus('archived'); setPage(1); }}
            className={`pb-3 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-colors ${
              activeStatus === 'archived'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Archived</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              activeStatus === 'archived' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
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
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-1.5 ${
              activeCategory === tab.id
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-200/70 text-slate-800 font-semibold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Review Queue List */}
      {groupedList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            No {activeStatus} items found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeStatus === 'pending'
              ? 'All customer replies have been processed and resolved.'
              : `There are currently no items marked as ${activeStatus}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
            <span className="capitalize">{activeStatus} Items ({groupedList.length})</span>
          </div>

          {groupedList.map((group) => {
            const isGroupExpanded = expandedGroupKey === group.groupKey;
            const primaryItem = group.items[0];

            return (
              <div
                key={group.groupKey}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all overflow-hidden shadow-2xs"
              >
                {/* Group Box Header */}
                <div
                  onClick={() => toggleExpandGroup(group.groupKey)}
                  className="p-4 cursor-pointer hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      <span className="font-semibold text-slate-900 truncate">
                        {group.sender}
                      </span>
                      {group.invoiceId && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                            Invoice: #{group.invoiceNo || group.invoiceId} {group.clientName ? `(${group.clientName})` : ''}
                            <ExternalLink className="w-3 h-3 ml-1 inline" />
                          </span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-normal flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {new Date(group.latestCreatedAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 font-normal">
                      {primaryItem.body || primaryItem.subject || '(No preview content)'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize ${
                      classificationConfigs[primaryItem.classification]?.bg || classificationConfigs.unclear.bg
                    }`}>
                      {classificationConfigs[primaryItem.classification]?.label || 'Unclear'}
                    </span>

                    <button
                      type="button"
                      className="p-1 hover:bg-slate-200/60 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {isGroupExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Box Content */}
                {isGroupExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-5">
                    {group.items.map((item) => (
                      <div key={item.id} className="space-y-4">
                        <CustomerReplyView item={item} />
                        <ItemActionArea
                          item={item}
                          activeStatus={activeStatus}
                          isEditingThisItem={editingId === item.id}
                          draftResponse={editingId === item.id ? draftResponse : (item.suggestedResponse || '')}
                          setDraftResponse={setDraftResponse}
                          onStartEdit={handleStartEdit}
                          onCancelEdit={handleCancelEdit}
                          onSendReply={handleSendReply}
                          onMarkStatus={handleMarkStatus}
                          onGenerateDraft={handleGenerateDraft}
                          isGeneratingThisItem={generatingId === item.id}
                          failedDraftId={failedDraftId}
                          sendReplyPending={sendReplyMutation.isPending}
                          statusChangePending={statusMutation.isPending}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={page === pagination.totalPages}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
  dispute: { bg: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Dispute', text: 'text-rose-700' },
  question: { bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Question', text: 'text-blue-700' },
  payment_promise: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Payment Promise', text: 'text-emerald-700' },
  unclear: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Unclear', text: 'text-amber-700' },
};

function CustomerReplyView({ item }: { item: InboundEmailReview }) {
  const [showQuotedMap, setShowQuotedMap] = useState<Record<string, boolean>>({});
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggleQuoted = (id: string) => {
    setShowQuotedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const threadItems = item.thread && item.thread.length > 0 ? item.thread : [
    {
      id: item.id,
      direction: 'inbound' as const,
      sender: item.sender,
      subject: item.subject,
      body: item.body,
      createdAt: item.createdAt,
    }
  ];

  return (
    <div className="space-y-3">
      {threadItems.map((msg) => {
        const isCollapsed = !!collapsedMap[msg.id];

        if (msg.direction === 'outbound') {
          const cleanText = stripHtml(msg.body || '');
          return (
            <div key={msg.id} className="bg-blue-50/50 border border-blue-200/90 rounded-lg p-4 space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-800 uppercase tracking-wider">Dispute Reply Sent</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                    💬 Dispute Agent
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(msg.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    title={isCollapsed ? "Expand message" : "Collapse message"}
                  >
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isCollapsed ? (
                <div 
                  onClick={() => toggleCollapse(msg.id)}
                  className="bg-white border border-blue-100 p-2.5 rounded-md text-xs text-slate-500 italic truncate cursor-pointer hover:bg-slate-50"
                >
                  {cleanText || '(No message content)'}
                </div>
              ) : (
                <div className="bg-white border border-blue-100 p-3.5 rounded-md text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {cleanText || '(No message content)'}
                </div>
              )}
            </div>
          );
        }

        const { replyText, quotedText } = parseEmailBody(msg.body || msg.subject || '');
        const isQuotedShown = !!showQuotedMap[msg.id];

        return (
          <div key={msg.id} className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Customer Reply</span>
              <div className="flex items-center space-x-3">
                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => toggleCollapse(msg.id)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  title={isCollapsed ? "Expand message" : "Collapse message"}
                >
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isCollapsed ? (
              <div 
                onClick={() => toggleCollapse(msg.id)}
                className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-md text-xs text-slate-500 italic truncate cursor-pointer hover:bg-slate-100/70"
              >
                {replyText || '(No reply text)'}
              </div>
            ) : (
              <>
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-md text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {replyText || '(No reply text)'}
                </div>

                {quotedText && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleQuoted(msg.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 py-1 px-2.5 rounded bg-slate-100/70 border border-slate-200 transition-colors"
                    >
                      <span>{isQuotedShown ? '▼ Hide original email thread' : '▶ Show original email thread'}</span>
                    </button>

                    {isQuotedShown && (
                      <div className="mt-2 bg-slate-100/80 border border-slate-200 p-3.5 rounded-md text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-normal">
                        {quotedText}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
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
  onMarkStatus,
  onGenerateDraft,
  isGeneratingThisItem,
  failedDraftId,
  sendReplyPending,
  statusChangePending,
}: {
  item: InboundEmailReview;
  activeStatus: DisputeStatus;
  isEditingThisItem: boolean;
  draftResponse: string;
  setDraftResponse: (val: string) => void;
  onStartEdit: (item: InboundEmailReview) => void;
  onCancelEdit: () => void;
  onSendReply: (item: InboundEmailReview) => void;
  onMarkStatus: (id: string, status: DisputeStatus) => void;
  onGenerateDraft: (id: string, instruction: string) => void;
  isGeneratingThisItem: boolean;
  failedDraftId: string | null;
  sendReplyPending: boolean;
  statusChangePending: boolean;
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
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                AI Reply Instruction
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Select a quick instruction chip or type below</span>
            </div>

            {/* Category-aware Quick Instruction Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {categoryConfig.chips.map((chipText) => (
                <button
                  key={chipText}
                  type="button"
                  onClick={() => handleChipClick(chipText)}
                  className="px-2.5 py-1 text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center space-x-1 shadow-2xs"
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
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
              />
              <button
                type="button"
                disabled={!instruction.trim() || isGeneratingThisItem}
                onClick={() => onGenerateDraft(item.id, instruction)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center justify-center space-x-1.5 flex-shrink-0 transition-colors shadow-xs"
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
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
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Draft Response</h5>
                {!isEditingThisItem && (
                  <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
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
                    className="w-full p-3 border border-slate-300 rounded-md text-xs font-sans focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-md text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                  {draftResponse}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Action Buttons based on Active Status */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {activeStatus === 'pending' && (
          <>
            <button
              type="button"
              disabled={sendReplyPending || !activeDraftContent}
              onClick={() => onSendReply(item)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              {sendReplyPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send Reply</span>
            </button>

            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'resolved')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>

            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'archived')}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </>
        )}

        {activeStatus === 'resolved' && (
          <>
            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'pending')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen to Pending</span>
            </button>

            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'archived')}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Move to Archive</span>
            </button>
          </>
        )}

        {activeStatus === 'archived' && (
          <>
            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'pending')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen to Pending</span>
            </button>

            <button
              type="button"
              disabled={statusChangePending}
              onClick={() => onMarkStatus(item.id, 'resolved')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
