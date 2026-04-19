import { useState } from 'react';
import type { Communication } from '../../types/api';
import { Mail, MessageSquare, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getErrorMessage } from '../../utils/error-utils';

interface CommunicationListProps {
  communications: Communication[];
}

export function CommunicationList({ communications }: CommunicationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (communications.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-[#1e2025] rounded-xl bg-[#0e1013]/40">
        <MessageSquare className="h-8 w-8 text-[#8a8f98] mx-auto mb-2 opacity-50" />
        <h3 className="text-xs font-semibold text-[#f7f8f8]">No communications</h3>
        <p className="text-xs text-[#8a8f98] mt-1">No emails or messages have been sent for this invoice yet.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'opened':
      case 'clicked':
      case 'sent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-950/40 text-red-400 border border-red-900/50">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#13161c] text-[#8a8f98] border border-[#1e2025]">
            <Clock className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'bulk_ai_agent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#27a644]/10 text-[#27a644] border border-[#27a644]/20">
            🤖 Bulk AI Agent
          </span>
        );
      case 'invoice_manual':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5e6ad2]/20 text-[#5e6ad2] border border-[#5e6ad2]/30">
            ⚡ Invoice Manual
          </span>
        );
      case 'dispute_agent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950/40 text-purple-400 border border-purple-900/50">
            💬 Dispute Agent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {communications.map((comm) => (
        <div key={comm.id} className="border border-[#1e2025]/80 rounded-xl overflow-hidden bg-[#13161c]/40 transition-all">
          {/* Header Row (Always visible) */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#13161c]/80 transition-colors"
            onClick={() => toggleExpand(comm.id)}
          >
            <div className="flex items-center space-x-3.5">
              <div className="h-9 w-9 rounded-xl bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center flex-shrink-0">
                <Mail className="h-4.5 w-4.5 text-[#5e6ad2]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                  {comm.subject || 'No Subject'}
                </h4>
                <div className="flex items-center mt-1 text-[11px] text-[#8a8f98] space-x-2">
                  <span>To: <strong className="text-[#d0d6e0] font-normal">{comm.recipient}</strong></span>
                  <span>•</span>
                  <span>{new Date(comm.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              {getSourceBadge(comm.source)}
              {getStatusBadge(comm.status)}
              <div className="text-[#8a8f98]">
                {expandedId === comm.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Expanded Body */}
          {expandedId === comm.id && (
            <div className="border-t border-[#1e2025]/80 bg-[#0e1013]/60 p-4 animate-in slide-in-from-top-2 duration-200">
              {comm.errorMsg && (
                <div className="mb-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
                  <span className="font-semibold">Delivery Error:</span> {getErrorMessage(comm.errorMsg)}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-[10px] font-semibold text-[#8a8f98] uppercase tracking-wider">Message Body</h5>
                {comm.providerMessageId && (
                  <span className="text-[10px] text-[#62666d] font-mono" title="Provider Message ID">
                    ID: {comm.providerMessageId.substring(0, 16)}...
                  </span>
                )}
              </div>
              
              <div className="bg-[#13161c]/80 border border-[#1e2025] rounded-xl p-4 text-xs text-[#f7f8f8] font-sans shadow-none overflow-auto max-h-[500px]">
                {/* Render HTML if it contains HTML tags, otherwise text */}
                {comm.body && (comm.body.includes('<html') || comm.body.includes('<div') || comm.body.includes('<p>')) ? (
                  <div dangerouslySetInnerHTML={{ __html: comm.body }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-[#d0d6e0] leading-relaxed">{comm.body}</pre>
                )}
              </div>
              
              {/* Detailed Timestamps footer */}
              {comm.sentAt && (
                <div className="mt-3 text-[11px] text-[#8a8f98]">
                  Sent At: <span className="font-medium text-[#f7f8f8]">{new Date(comm.sentAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

