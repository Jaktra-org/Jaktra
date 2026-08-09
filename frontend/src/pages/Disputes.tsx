import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService, type InboundEmailReview } from '../services/dispute';
import { 
  MessageSquare, CheckCircle, Trash2, 
  RefreshCw, Edit3, Clock, ChevronDown, ChevronUp, ExternalLink,
  ChevronLeft, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';
import { parseEmailBody } from '../utils/email-utils';

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
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<DisputeTab>('all');
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // 1. Fetch pending disputes
  const { data: disputesData, isLoading: isDisputesLoading, error: disputesError, refetch: refetchDisputes } = useQuery({
    queryKey: ['pendingDisputes', page],
    queryFn: () => disputeService.getPendingDisputes({ page, limit: 25 }),
  });

  // 2. Generate Draft Mutation
  const generateDraftMutation = useMutation({
    mutationFn: ({ id, tenantInstruction }: { id: string; tenantInstruction: string }) =>
      disputeService.generateDraft(id, tenantInstruction),
    onMutate: ({ id }) => {
      setGeneratingId(id);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] });
      setEditingId(variables.id);
      setDraftResponse(data.suggestedResponse);
    },
    onSettled: () => {
      setGeneratingId(null);
    },
  });

  // 3. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, suggestedResponse }: { id: string; suggestedResponse: string }) => 
      disputeService.approveDispute(id, suggestedResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] });
      setEditingId(null);
    },
  });

  // 4. Discard Mutation
  const discardMutation = useMutation({
    mutationFn: disputeService.discardDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] });
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

  const handleSaveAndApprove = (id: string) => {
    approveMutation.mutate({ id, suggestedResponse: draftResponse });
  };

  const handleDirectApprove = (item: InboundEmailReview) => {
    approveMutation.mutate({ id: item.id, suggestedResponse: item.suggestedResponse });
  };

  const handleDiscard = (id: string) => {
    if (window.confirm('Are you sure you want to discard this item? It will be archived.')) {
      discardMutation.mutate(id);
    }
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

  const pendingDisputes = disputesData?.data || [];
  const pagination = disputesData?.pagination;

  // Counts by classification
  const counts = {
    all: pendingDisputes.length,
    dispute: pendingDisputes.filter(i => i.classification === 'dispute').length,
    question: pendingDisputes.filter(i => i.classification === 'question').length,
    payment_promise: pendingDisputes.filter(i => i.classification === 'payment_promise').length,
    unclear: pendingDisputes.filter(i => i.classification === 'unclear').length,
  };

  // Filter items by active tab
  const filteredItems = pendingDisputes.filter(item => {
    if (activeTab === 'all') return true;
    return item.classification === activeTab;
  });

  // Group filtered items by invoice & sender
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

  for (const item of filteredItems) {
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

  const tabs: Array<{ id: DisputeTab; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'dispute', label: 'Disputes', count: counts.dispute },
    { id: 'question', label: 'Questions', count: counts.question },
    { id: 'payment_promise', label: 'Payment Promises', count: counts.payment_promise },
    { id: 'unclear', label: 'Unclear', count: counts.unclear },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
            Disputes Review Queue
          </h1>
          <p className="text-slate-500 mt-1">Review, edit, and approve draft responses generated for customer replies.</p>
        </div>
        <button 
          onClick={() => refetchDisputes()}
          className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(approveMutation.isPending || discardMutation.isPending || generateDraftMutation.isPending) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tag Filter Tabs section directly below header line */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 pt-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {disputesError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          Error loading disputes: {getErrorMessage(disputesError)}
        </div>
      )}

      {/* Main Review Section */}
      <div className="space-y-8">
        {/* Pending Disputes */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
            Pending Items ({filteredItems.length})
          </h3>
          {groupedList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium">No pending items in this category.</p>
              <p className="text-xs text-slate-400 mt-1">All customer replies for this category have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedList.map(group => (
                <DisputeGroupCard 
                  key={group.groupKey}
                  group={group}
                  isExpanded={expandedGroupKey === group.groupKey}
                  editingId={editingId}
                  draftResponse={draftResponse}
                  setDraftResponse={setDraftResponse}
                  onToggleExpand={() => toggleExpandGroup(group.groupKey)}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSaveAndApprove={handleSaveAndApprove}
                  onDirectApprove={handleDirectApprove}
                  onDiscard={handleDiscard}
                  onGenerateDraft={handleGenerateDraft}
                  generatingId={generatingId}
                  approvePending={approveMutation.isPending}
                  discardPending={discardMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg bg-white shadow-sm mt-6">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerReplyView({ body, createdAt }: { body: string; createdAt: string }) {
  const [showQuoted, setShowQuoted] = useState(false);
  const { replyText, quotedText } = parseEmailBody(body);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Reply</h5>
        <span className="text-xs text-slate-400">{new Date(createdAt).toLocaleString()}</span>
      </div>

      {/* Clean main customer reply text */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
        {replyText}
      </div>

      {/* Collapsible Quoted Email Thread (if present) */}
      {quotedText && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowQuoted(prev => !prev)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 py-1 px-2.5 rounded bg-slate-100/70 border border-slate-200 transition-colors"
          >
            <span>{showQuoted ? '▼ Hide original email thread' : '▶ Show original email thread'}</span>
          </button>

          {showQuoted && (
            <div className="mt-2 bg-slate-100/80 border border-slate-200 p-3.5 rounded-md text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-normal">
              {quotedText}
            </div>
          )}
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

function ItemActionArea({
  item,
  isEditingThisItem,
  draftResponse,
  setDraftResponse,
  onStartEdit,
  onCancelEdit,
  onSaveAndApprove,
  onDirectApprove,
  onDiscard,
  onGenerateDraft,
  isGeneratingThisItem,
  approvePending,
  discardPending,
}: {
  item: InboundEmailReview;
  isEditingThisItem: boolean;
  draftResponse: string;
  setDraftResponse: (val: string) => void;
  onStartEdit: (item: InboundEmailReview) => void;
  onCancelEdit: () => void;
  onSaveAndApprove: (id: string) => void;
  onDirectApprove: (item: InboundEmailReview) => void;
  onDiscard: (id: string) => void;
  onGenerateDraft: (id: string, instruction: string) => void;
  isGeneratingThisItem: boolean;
  approvePending: boolean;
  discardPending: boolean;
}) {
  const [instruction, setInstruction] = useState('');
  const categoryConfig = CATEGORY_QUICK_INSTRUCTIONS[item.classification] || CATEGORY_QUICK_INSTRUCTIONS.unclear;

  const handleChipClick = (chipText: string) => {
    setInstruction(chipText);
  };

  return (
    <div className="space-y-4 pt-1">
      {/* AI Reply Instruction Input Block */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
            AI Reply Instruction
          </label>
          <span className="text-[11px] text-slate-400 font-normal">Select a quick instruction chip or type below</span>
        </div>

        {/* Quick Instruction Chips (category-specific) */}
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
                <span>{item.suggestedResponse ? 'Regenerate Draft' : 'Generate Draft Response'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Draft Response Section */}
      {item.suggestedResponse ? (
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
            <div className="space-y-3">
              <textarea
                value={draftResponse}
                onChange={(e) => setDraftResponse(e.target.value)}
                className="w-full min-h-[140px] p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs text-slate-800 font-mono leading-normal"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  disabled={approvePending}
                  onClick={() => onSaveAndApprove(item.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {approvePending && <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />}
                  Approve & Send
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {item.suggestedResponse}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  disabled={approvePending || discardPending}
                  onClick={() => onDirectApprove(item)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center transition-all hover:scale-[1.02]"
                >
                  {approvePending && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Approve & Send
                </button>
                <button
                  type="button"
                  disabled={approvePending || discardPending}
                  onClick={() => onDiscard(item.id)}
                  className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={approvePending || discardPending}
            onClick={() => onDiscard(item.id)}
            className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Discard Item
          </button>
        </div>
      )}
    </div>
  );
}

function DisputeGroupCard({
  group,
  isExpanded,
  editingId,
  draftResponse,
  setDraftResponse,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveAndApprove,
  onDirectApprove,
  onDiscard,
  onGenerateDraft,
  generatingId,
  approvePending,
  discardPending,
}: {
  group: {
    groupKey: string;
    invoiceId?: string | null;
    invoiceNo?: string | null;
    clientName?: string | null;
    sender: string;
    items: InboundEmailReview[];
    latestCreatedAt: string;
  };
  isExpanded: boolean;
  editingId: string | null;
  draftResponse: string;
  setDraftResponse: (val: string) => void;
  onToggleExpand: () => void;
  onStartEdit: (item: InboundEmailReview) => void;
  onCancelEdit: () => void;
  onSaveAndApprove: (id: string) => void;
  onDirectApprove: (item: InboundEmailReview) => void;
  onDiscard: (id: string) => void;
  onGenerateDraft: (id: string, instruction: string) => void;
  generatingId: string | null;
  approvePending: boolean;
  discardPending: boolean;
}) {
  // Collect unique classifications in this group
  const uniqueClassifications = Array.from(new Set(group.items.map(i => i.classification)));
  const latestItem = group.items[0]; // representative subject/metadata

  return (
    <div className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md ${isExpanded ? 'ring-1 ring-blue-500/50' : 'border-slate-200'}`}>
      {/* Group Card Header */}
      <div 
        onClick={onToggleExpand}
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 space-y-1.5 min-w-0">
          {/* Top Meta Line: Sender Email • Clickable Invoice Link • Date & Time */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-semibold text-slate-900 text-sm">{group.sender}</span>

            {group.invoiceNo && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1">
                  <span className="text-slate-400">Invoice:</span>
                  <a 
                    href={`/invoices/${group.invoiceId}`}
                    onClick={(e) => e.stopPropagation()} 
                    className="text-blue-600 font-semibold hover:underline flex items-center"
                  >
                    #{group.invoiceNo} {group.clientName ? `(${group.clientName})` : ''}
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </span>
              </>
            )}

            <span className="text-slate-300">•</span>
            <span className="text-slate-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {new Date(group.latestCreatedAt).toLocaleString()}
            </span>

            {group.items.length > 1 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                  {group.items.length} Replies
                </span>
              </>
            )}
          </div>

          {/* 1-Line Message Summary */}
          <p className="text-xs text-slate-600 font-normal truncate">
            {latestItem.body 
              ? parseEmailBody(latestItem.body).replyText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() 
              : latestItem.subject}
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {/* Classification badges for all unique intents in this grouped box */}
          <div className="flex items-center space-x-1.5">
            {uniqueClassifications.map(c => {
              const cfg = classificationConfigs[c] || classificationConfigs.unclear;
              return (
                <span key={c} className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.bg}`}>
                  {cfg.label}
                </span>
              );
            })}
          </div>

          <button 
            onClick={onToggleExpand} 
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded details - lists all reply items in this grouped box */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6">
          {group.items.map((item, index) => {
            const cfg = classificationConfigs[item.classification] || classificationConfigs.unclear;
            const isEditingThisItem = editingId === item.id;
            const isGeneratingThisItem = generatingId === item.id;

            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-sm">
                {group.items.length > 1 && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Response #{index + 1}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                )}

                {/* Customer reply view component (clean reply + collapsible quoted email thread) */}
                <CustomerReplyView body={item.body} createdAt={item.createdAt} />

                {/* Item Action Area: AI instruction chips + draft generation + approve/discard */}
                <ItemActionArea
                  item={item}
                  isEditingThisItem={isEditingThisItem}
                  draftResponse={draftResponse}
                  setDraftResponse={setDraftResponse}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveAndApprove={onSaveAndApprove}
                  onDirectApprove={onDirectApprove}
                  onDiscard={onDiscard}
                  onGenerateDraft={onGenerateDraft}
                  isGeneratingThisItem={isGeneratingThisItem}
                  approvePending={approvePending}
                  discardPending={discardPending}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
