import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService, type InboundEmailReview } from '../services/dispute';
import { settingsService } from '../services/settings';
import { 
  MessageSquare, AlertCircle, CheckCircle, Trash2, 
  RefreshCw, Edit3, X, User, Clock, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { getErrorMessage } from '../utils/error-utils';

export function Disputes() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');

  // 1. Fetch pending disputes
  const { data: disputes, isLoading: isDisputesLoading, error: disputesError, refetch: refetchDisputes } = useQuery<InboundEmailReview[]>({
    queryKey: ['pendingDisputes'],
    queryFn: disputeService.getPendingDisputes,
  });

  // 2. Fetch tenant settings for warning check
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  // 3. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, suggestedResponse }: { id: string; suggestedResponse: string }) => 
      disputeService.approveDispute(id, suggestedResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] });
      setEditingId(null);
      setExpandedId(null);
    },
  });

  // 4. Discard Mutation
  const discardMutation = useMutation({
    mutationFn: disputeService.discardDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDisputes'] });
      setExpandedId(null);
    },
  });

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
    if (window.confirm('Are you sure you want to discard this suggested response? The inbound reply will be archived as discarded.')) {
      discardMutation.mutate(id);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  if (isDisputesLoading || isSettingsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Determine if automatic reply capture is active (inbound_parse_active must be true)
  const isReplyCaptureActive = settings?.inboundParseActive === true;

  // Separate matched vs unmatched disputes
  const matchedDisputes = disputes?.filter(d => d.invoiceId !== null) || [];
  const unmatchedReplies = disputes?.filter(d => d.invoiceId === null) || [];

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
          <RefreshCw className={`w-4 h-4 mr-2 ${(approveMutation.isPending || discardMutation.isPending) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Persistent warning banner if email replies are not capture-ready */}
      {!isReplyCaptureActive && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start space-x-3 shadow-sm transition-all hover:shadow-md">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold text-amber-900">Automatic Inbound Reply Capture Inactive</p>
            <p className="mt-1">
              Your account is using a configuration that doesn't support automatic reply capture. 
              New customer replies won't appear here automatically — please monitor your inbox manually. 
              Existing dispute items below are displayed as historical logs.
            </p>
          </div>
        </div>
      )}

      {disputesError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
          Error loading disputes: {getErrorMessage(disputesError)}
        </div>
      )}

      {/* Main Review Section */}
      <div className="space-y-8">
        {/* 1. Pending Disputes (Matched Invoices) */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
            Pending Disputes ({matchedDisputes.length})
          </h3>
          {matchedDisputes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium">No pending disputes needing review.</p>
              <p className="text-xs text-slate-400 mt-1">Great job! All customer replies have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchedDisputes.map(item => (
                <DisputeCard 
                  key={item.id}
                  item={item}
                  isExpanded={expandedId === item.id}
                  isEditing={editingId === item.id}
                  draftResponse={draftResponse}
                  setDraftResponse={setDraftResponse}
                  onToggleExpand={() => toggleExpand(item.id)}
                  onStartEdit={() => handleStartEdit(item)}
                  onCancelEdit={handleCancelEdit}
                  onSaveAndApprove={() => handleSaveAndApprove(item.id)}
                  onDirectApprove={() => handleDirectApprove(item)}
                  onDiscard={() => handleDiscard(item.id)}
                  approvePending={approveMutation.isPending}
                  discardPending={discardMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Unmatched Inbound Emails */}
        {unmatchedReplies.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
              Unmatched Inbound Emails ({unmatchedReplies.length})
            </h3>
            <div className="space-y-4">
              {unmatchedReplies.map(item => (
                <DisputeCard 
                  key={item.id}
                  item={item}
                  isExpanded={expandedId === item.id}
                  isEditing={editingId === item.id}
                  draftResponse={draftResponse}
                  setDraftResponse={setDraftResponse}
                  onToggleExpand={() => toggleExpand(item.id)}
                  onStartEdit={() => handleStartEdit(item)}
                  onCancelEdit={handleCancelEdit}
                  onSaveAndApprove={() => handleSaveAndApprove(item.id)}
                  onDirectApprove={() => handleDirectApprove(item)}
                  onDiscard={() => handleDiscard(item.id)}
                  approvePending={approveMutation.isPending}
                  discardPending={discardMutation.isPending}
                  unmatched={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader({ className }: { className?: string }) {
  return <RefreshCw className={className} />;
}

// Badge classification styling maps
const classificationConfigs: Record<string, { bg: string, text: string, label: string }> = {
  dispute: { bg: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Dispute', text: 'text-rose-700' },
  question: { bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Question', text: 'text-blue-700' },
  payment_promise: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Payment Promise', text: 'text-emerald-700' },
  unclear: { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Unclear', text: 'text-amber-700' },
};

function DisputeCard({
  item,
  isExpanded,
  isEditing,
  draftResponse,
  setDraftResponse,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSaveAndApprove,
  onDirectApprove,
  onDiscard,
  approvePending,
  discardPending,
  unmatched = false,
}: {
  item: InboundEmailReview;
  isExpanded: boolean;
  isEditing: boolean;
  draftResponse: string;
  setDraftResponse: (val: string) => void;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveAndApprove: () => void;
  onDirectApprove: () => void;
  onDiscard: () => void;
  approvePending: boolean;
  discardPending: boolean;
  unmatched?: boolean;
}) {
  const cfg = classificationConfigs[item.classification] || classificationConfigs.unclear;
  const isConfidenceLow = Number(item.confidence) < 0.5;

  return (
    <div className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md ${isExpanded ? 'ring-1 ring-blue-500/50' : 'border-slate-200'}`}>
      {/* Card Header (Summary strip) */}
      <div 
        onClick={onToggleExpand}
        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 text-sm">{item.sender}</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-500 text-xs flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
          <h4 className="text-sm font-medium text-slate-700 line-clamp-1">{item.subject}</h4>
          {!unmatched && item.invoiceNo && (
            <div className="flex items-center space-x-2 text-xs pt-1">
              <span className="text-slate-400">Invoice:</span>
              <a 
                href={`/invoices/${item.invoiceId}`}
                onClick={(e) => e.stopPropagation()} 
                className="text-blue-600 font-medium hover:underline flex items-center"
              >
                #{item.invoiceNo} ({item.clientName})
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          )}
          {unmatched && (
            <span className="inline-block text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-semibold mt-1">
              Unmatched Inbound
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {/* Classification badge */}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.bg}`}>
            {cfg.label}
          </span>

          {/* Confidence banner */}
          <span className={`text-xs px-2 py-0.5 rounded ${isConfidenceLow ? 'bg-rose-50 text-rose-600 font-medium border border-rose-100' : 'bg-slate-50 text-slate-600'}`}>
            Conf: {Math.round(Number(item.confidence) * 100)}%
          </span>

          <button 
            onClick={onToggleExpand} 
            className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6">
          {/* Customer reply text block */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Reply</h5>
            <div className="bg-white border border-slate-200 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto leading-relaxed">
              {item.body}
            </div>
          </div>

          {/* AI reasoning analysis */}
          <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-md space-y-1">
            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider">AI Classification Reasoning</h5>
            <p className="text-xs text-slate-600 leading-relaxed">{item.reasoning}</p>
          </div>

          {/* Suggested reply action block */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Draft Response</h5>
              {!isEditing && (
                <button 
                  onClick={onStartEdit}
                  className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Draft
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={draftResponse}
                  onChange={(e) => setDraftResponse(e.target.value)}
                  className="w-full min-h-[160px] p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 font-mono leading-normal"
                />
                <div className="flex space-x-2">
                  <button 
                    disabled={approvePending}
                    onClick={onSaveAndApprove}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {approvePending && <Loader className="w-3 h-3 animate-spin mr-1.5" />}
                    Approve & Send
                  </button>
                  <button 
                    onClick={onCancelEdit}
                    className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {item.suggestedResponse || <span className="text-slate-400 italic">No draft response suggested for this category.</span>}
                </div>
                
                <div className="flex space-x-3">
                  {item.suggestedResponse && (
                    <button 
                      disabled={approvePending || discardPending}
                      onClick={onDirectApprove}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center transition-all hover:scale-[1.02]"
                    >
                      {approvePending && <Loader className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                      Approve & Send
                    </button>
                  )}
                  <button 
                    disabled={approvePending || discardPending}
                    onClick={onDiscard}
                    className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
