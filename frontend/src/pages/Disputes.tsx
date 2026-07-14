import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputeService, type InboundEmailReview } from '../services/dispute';
import { settingsService } from '../services/settings';
import { 
  MessageSquare, AlertCircle, CheckCircle, Trash2, 
  RefreshCw, Edit3, Clock, ChevronDown, ChevronUp, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { getErrorMessage } from '../utils/error-utils';

export function Disputes() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftResponse, setDraftResponse] = useState<string>('');

  // 1. Fetch pending disputes
  const { data: disputesData, isLoading: isDisputesLoading, error: disputesError, refetch: refetchDisputes } = useQuery({
    queryKey: ['pendingDisputes', page],
    queryFn: () => disputeService.getPendingDisputes({ page, limit: 25 }),
  });

  // 2. Fetch inbound verification status
  const { data: inboundStatus, isLoading: isInboundStatusLoading, refetch: refetchInboundStatus } = useQuery({
    queryKey: ['inboundVerificationStatus'],
    queryFn: settingsService.getInboundVerificationStatus,
  });

  const startTestMutation = useMutation({
    mutationFn: settingsService.startInboundVerificationTest,
    onSuccess: () => {
      refetchInboundStatus();
    },
  });

  useEffect(() => {
    if (inboundStatus?.latestTest?.status === 'pending') {
      const interval = setInterval(() => {
        refetchInboundStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [inboundStatus, refetchInboundStatus]);

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

  if (isDisputesLoading || isInboundStatusLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Determine if automatic reply capture is active (SMTP does not support, SendGrid requires real capture or fresh verification)
  const isReplyCaptureActive = (() => {
    if (!inboundStatus) return false;
    if (inboundStatus.defaultEmailProvider !== 'sendgrid') return false;
    
    // NOTE (v1 limitation): Once the tenant has at least one real inbound_emails record
    // in the database, hasRealCapture resolves to true and clears the warning banner
    // permanently. This is a deliberate v1 simplification; if their DNS/Inbound settings
    // are broken later, the warning will not automatically reappear.
    if (inboundStatus.hasRealCapture) return true;
    
    if (inboundStatus.dnsVerifiedAt) {
      const verifiedTime = new Date(inboundStatus.dnsVerifiedAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (now - verifiedTime < thirtyDays) {
        return true;
      }
    }
    
    return false;
  })();

  const pendingDisputes = disputesData?.data || [];
  const pagination = disputesData?.pagination;

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
      {!isReplyCaptureActive && inboundStatus && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start space-x-3 shadow-sm transition-all hover:shadow-md mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 w-full">
            <p className="font-semibold text-amber-900">Automatic Inbound Reply Capture Inactive</p>
            {inboundStatus.defaultEmailProvider !== 'sendgrid' ? (
              <p className="mt-1 text-amber-700">
                Your account is using SMTP for sending, which doesn't support automatic reply capture. 
                Please check your inbox manually.
              </p>
            ) : (
              <div className="mt-1 space-y-2 text-amber-700">
                <p>
                  Inbound reply capture hasn't been verified for your domain. New customer replies won't appear here automatically.
                </p>
                <div className="pt-2 flex items-center space-x-4">
                  {inboundStatus.latestTest?.status === 'pending' ? (
                    <div className="flex items-center text-amber-900 bg-amber-100 px-3 py-1.5 rounded border border-amber-200">
                      <span className="animate-pulse mr-2 w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>Waiting for your reply... Check your inbox and reply to the test email.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => startTestMutation.mutate()}
                      disabled={startTestMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 text-xs"
                    >
                      {startTestMutation.isPending ? 'Sending test...' : 'Run Inbound Test'}
                    </button>
                  )}
                  {inboundStatus.latestTest?.status === 'expired' && (
                    <span className="text-xs text-red-600">Previous test expired. Please run a new one.</span>
                  )}
                  {inboundStatus.latestTest?.status === 'failed' && (
                    <span className="text-xs text-red-600">Previous test failed. Please try again.</span>
                  )}
                </div>
              </div>
            )}
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
        {/* Pending Disputes */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2"></span>
            Pending Disputes ({pagination ? pagination.total : pendingDisputes.length})
          </h3>
          {pendingDisputes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium">No pending disputes needing review.</p>
              <p className="text-xs text-slate-400 mt-1">Great job! All customer replies have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDisputes.map(item => (
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
          {item.invoiceNo && (
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
