import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/event';
import { RefreshCw, FileText, Send, Mail, AlertTriangle, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { InvoiceEvent } from '../../types/api';
import { getErrorMessage } from '../../utils/error-utils';
import { CustomSelect } from '../ui/CustomSelect';

interface ActivityFeedProps {
  isRunning: boolean;
}

export function ActivityFeed({ isRunning }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'activity' | 'errors'>('all');

  const { data: events, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['agent-feed'],
    queryFn: () => eventService.getFeed(50),
    refetchInterval: isRunning ? 5000 : false, // Poll every 5s ONLY if running
  });

  const renderEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'invoice_created':
        return <FileText className="w-3.5 h-3.5 text-[#27a644]" />;
      case 'email_sent':
        return <Send className="w-3.5 h-3.5 text-[#5e6ad2]" />;
      case 'email_opened':
        return <Mail className="w-3.5 h-3.5 text-[#828fff]" />;
      case 'payment_received':
      case 'status_updated':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#27a644]" />;
      case 'legal_escalated':
      case 'dlq_added':
      case 'halted':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-[#8a8f98]" />;
    }
  };

  const filteredEvents = (events || []).filter((e: InvoiceEvent) => {
    if (filter === 'all') return true;
    if (filter === 'errors') return ['halted', 'dlq_added', 'legal_escalated'].includes(e.eventType);
    if (filter === 'activity') return ['email_sent', 'email_generated', 'email_opened', 'payment_received'].includes(e.eventType);
    return true;
  });

  const lastRefreshStr = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString() 
    : '--:--';

  return (
    <div className="flex flex-col h-full bg-[#0f1011] rounded-xl border border-[#23252a] shadow-none overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 border-b border-[#23252a] bg-[#010102]/60 gap-3">
        <div>
          <h3 className="font-semibold text-xs text-[#f7f8f8] flex items-center tracking-tight">
            Recent Activity
            {isRunning && (
              <span className="ml-2 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27a644] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27a644]"></span>
              </span>
            )}
          </h3>
          <p className="text-[11px] text-[#8a8f98] mt-0.5">
            {isRunning ? 'Auto-refreshing (live)' : `Last Refresh: ${lastRefreshStr}`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <CustomSelect 
            value={filter} 
            onChange={(val) => setFilter(val as 'all' | 'activity' | 'errors')}
            className="w-36"
            options={[
              { label: "All Events", value: "all" },
              { label: "Activity Only", value: "activity" },
              { label: "Errors / Halted", value: "errors" },
            ]}
          />
          
          <button 
            onClick={() => refetch()}
            disabled={isFetching || isRunning}
            className="inline-flex items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011] p-1.5 text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#555761] disabled:opacity-40"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-[#8a8f98]">
            <MessageSquare className="w-8 h-8 text-[#3e3e44] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#f7f8f8]">No activity found for this filter.</p>
          </div>
        ) : (
          <div className="relative border-l border-[#23252a] ml-3 space-y-5 py-1">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative pl-5 group">
                <div className="absolute -left-3 top-0.5 h-6 w-6 rounded-full bg-[#0f1011] border border-[#23252a] flex items-center justify-center shadow-none">
                  {renderEventIcon(event.eventType)}
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-xs text-[#f7f8f8] capitalize">
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      {event.invoiceNo && (
                        <Link to={`/invoices/${event.invoiceId}`} className="text-[11px] text-[#5e6ad2] hover:text-[#828fff] font-mono bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 px-1.5 py-0.5 rounded">
                          {event.invoiceNo}
                        </Link>
                      )}
                    </div>
                    {!!event.payload?.error && (
                      <p className="text-xs text-red-400 mt-1">{getErrorMessage(event.payload.error)}</p>
                    )}
                    {event.eventType === 'halted' && !event.payload?.error && !!event.payload?.reason && (
                      <p className="text-xs text-[#8a8f98] mt-1">
                        {typeof event.payload?.reason === 'string' && (String(event.payload.reason).includes('sent ') || String(event.payload.reason).includes('ago'))
                          ? `Skipped: recently sent (${String(event.payload.reason)})`
                          : event.payload?.reason === 'no_automated_channel'
                          ? `No automated channel configured for ${String(event.payload?.tier || 'this')} tier`
                          : `Reason: ${String(event.payload?.reason)}`}
                      </p>
                    )}
                    {!!event.payload?.subject && (
                      <p className="text-xs text-[#8a8f98] mt-1 truncate max-w-[250px] sm:max-w-[400px]">
                        Subject: {String(event.payload?.subject)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8a8f98] font-medium whitespace-nowrap ml-2">
                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

