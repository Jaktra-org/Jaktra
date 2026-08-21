import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../../services/agent';
import type { AgentRun, AgentRunChunk, AgentRunChunksResponse } from '../../types/api';
import { ChevronDown, ChevronUp, Clock, AlertTriangle, Send, FileText, Loader2, Info, Bot } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

interface EventPayload {
  invoiceId?: string;
  entityId?: string;
  invoiceNumber?: string;
  number?: string;
  recipient?: string;
  recipientEmail?: string;
  email?: string;
  tone?: string;
  toneSource?: string;
  reason?: string;
  tier?: string;
  triggeredBy?: string;
  source?: string;
  subject?: string;
  message?: string;
  [key: string]: unknown;
}

interface EventItem {
  eventType?: string;
  invoiceId?: string;
  entityId?: string;
  createdAt?: string;
  payload?: EventPayload | null;
}

interface RunListProps {
  runs: AgentRun[];
}

export function RunList({ runs }: RunListProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const safeRuns = Array.isArray(runs) ? runs : [];

  const toggleExpand = (id: string) => {
    setExpandedRunId(expandedRunId === id ? null : id);
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'Running...';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return 'N/A';
    const seconds = Math.max(0, Math.floor((e - s) / 1000));
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const safeDateString = (dateStr: string | null | undefined, fallback = 'N/A') => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="divide-y divide-[#23252a]/70">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#0f1011] text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider border-b border-[#23252a]">
        <div className="col-span-3">Run Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-center">Invoices</div>
        <div className="col-span-2 text-center">Emails</div>
        <div className="col-span-2 text-center">Errors</div>
        <div className="col-span-1 text-right">Dur</div>
      </div>

      {/* Table Body */}
      {safeRuns.map((run) => (
        <div key={run.id} className="flex flex-col hover:bg-[#141516]/60 transition-colors">
          <div 
            className="grid grid-cols-12 gap-4 px-5 py-3 items-center cursor-pointer"
            onClick={() => toggleExpand(run.id)}
          >
            <div className="col-span-3 flex items-center text-xs font-medium text-[#f7f8f8]">
              {expandedRunId === run.id ? (
                <ChevronUp className="w-3.5 h-3.5 mr-2 text-[#8a8f98]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 mr-2 text-[#8a8f98]" />
              )}
              {safeDateString(run.startTime)}
            </div>
            
            <div className="col-span-2">
              <Badge variant={
                run.status === 'completed' ? 'success' :
                run.status === 'running' ? 'warning' : 'danger'
              }>
                {run.status}
              </Badge>
            </div>
            
            <div className="col-span-2 text-center text-xs text-[#d0d6e0]">
              {run.invoicesProcessed || 0}
            </div>
            
            <div className="col-span-2 flex items-center justify-center text-xs text-[#d0d6e0]">
              <Send className="w-3 h-3 mr-1.5 text-[#5e6ad2]" />
              {run.emailsSent || 0}
            </div>
            
            <div className="col-span-2 flex items-center justify-center text-xs">
              {run.errors > 0 ? (
                <span className="text-red-400 flex items-center font-medium bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {run.errors}
                </span>
              ) : (
                <span className="text-[#62666d]">0</span>
              )}
            </div>
            
            <div className="col-span-1 flex items-center justify-end text-[11px] text-[#8a8f98]">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(run.startTime, run.endTime)}
            </div>
          </div>

          {/* Expanded Details Section */}
          {expandedRunId === run.id && (
            <div className="bg-[#010102]/60 px-5 py-4 border-t border-[#23252a]">
              <RunDetailsPanel run={run} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function getEventInfo(event: EventItem) {
  const payload = (event?.payload && typeof event.payload === 'object' ? event.payload : {}) as EventPayload;
  
  // 1. Identify invoice ID and display label
  const rawInvoiceId = event?.invoiceId || event?.entityId || payload.invoiceId || payload.entityId;
  const isSystem = !rawInvoiceId || rawInvoiceId.toLowerCase() === 'system' || rawInvoiceId.toLowerCase() === 'n/a';
  
  const rawNum = payload.invoiceNo || payload.invoiceNumber || payload.number || (event as Record<string, unknown>).invoiceNo || (event as Record<string, unknown>).invoiceNumber;
  let invoiceNumber: string | undefined = typeof rawNum === 'string' && rawNum ? rawNum : undefined;

  // Regex fallback: extract e.g. "INV-1000" or "INV-1002" from email subject or message text
  if (!invoiceNumber) {
    const textToSearch = `${payload.subject || ''} ${payload.message || ''} ${payload.description || ''}`;
    const match = textToSearch.match(/(INV-\d+|INV-[A-Za-z0-9-]+)/i);
    if (match && match[1]) {
      invoiceNumber = match[1].toUpperCase();
    }
  }

  if (!invoiceNumber && !isSystem && rawInvoiceId) {
    invoiceNumber = rawInvoiceId.length > 8 ? `INV-${rawInvoiceId.substring(0, 6).toUpperCase()}` : `INV-${rawInvoiceId}`;
  }

  const eventType = (event?.eventType || '').toLowerCase();

  // 2. Format human-readable summary & status tag
  let description: string;
  let statusText: string;
  let badgeVariant: 'success' | 'warning' | 'danger' | 'default';

  const recipient = payload.recipient || payload.recipientEmail || payload.email || '';
  const recipientStr = recipient ? ` to ${recipient}` : '';
  const tone = (payload.tone || payload.toneSource || '').toLowerCase();
  const reason = (payload.reason || '').toLowerCase();
  const tier = (payload.tier || '').toLowerCase();

  if (eventType === 'email_sent' || eventType === 'email_generated') {
    statusText = 'Email Sent';
    badgeVariant = 'success';
    
    let toneDescription = 'follow-up email';
    if (tone.includes('stern') || tone.includes('stage_4') || tone.includes('stage_3') || tone.includes('urgent')) {
      toneDescription = 'firm & stern reminder email';
    } else if (tone.includes('warm') || tone.includes('friendly') || tone.includes('stage_1') || tone.includes('stage_2')) {
      toneDescription = 'friendly reminder email';
    } else if (tone.includes('legal') || tone.includes('escalation')) {
      toneDescription = 'serious escalation notice';
    }

    description = `A ${toneDescription} was dispatched${recipientStr}.`;
  } else if (eventType === 'halted' || eventType === 'failed' || eventType === 'error') {
    statusText = eventType === 'halted' ? 'Halted' : 'Failed';
    badgeVariant = 'danger';

    let reasonText: string;
    if (reason === 'no_automated_channel') {
      reasonText = 'No automated communication channel configured';
    } else if (reason === 'payment_plan_active') {
      reasonText = 'Active payment plan currently in effect';
    } else if (reason === 'dispute_open') {
      reasonText = 'Open invoice dispute under review';
    } else if (reason === 'max_reminders_exceeded') {
      reasonText = 'Maximum reminder limit reached';
    } else if (reason) {
      reasonText = reason.replace(/_/g, ' ');
    } else {
      reasonText = 'Processing halted by safety rules';
    }

    const tierStr = tier ? ` (${tier.replace(/_/g, ' ')})` : '';
    description = `${reasonText}${tierStr}${recipientStr}.`;
  } else if (eventType.includes('run') || eventType.includes('trigger')) {
    statusText = 'Triggered';
    badgeVariant = 'default';
    const source = payload.triggeredBy || payload.source || 'manual';
    description = `Autopilot execution triggered (${source}).`;
  } else {
    statusText = eventType.replace(/_/g, ' ');
    badgeVariant = 'default';
    description = payload.subject || payload.message || `Processed event ${eventType}.`;
  }

  return {
    rawInvoiceId,
    invoiceNumber,
    isSystem,
    description,
    statusText,
    badgeVariant,
    subject: payload.subject,
  };
}

function RunDetailsPanel({ run }: { run: AgentRun }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-run-details', run.id],
    queryFn: () => agentService.getRunDetails(run.id),
    staleTime: 60000, // Cache for 1 min
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-[#8a8f98]">
        <Loader2 className="w-4 h-4 animate-spin text-[#8a8f98] mr-2" />
        Loading run details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-red-400 text-xs flex items-center py-4">
        <AlertTriangle className="w-4 h-4 mr-2" />
        Failed to load run details.
      </div>
    );
  }

  const events = Array.isArray(data.events) ? data.events : [];
  const invoiceEvents = events.filter(e => {
    const rawId = e.invoiceId || e.entityId || (e.payload && typeof e.payload === 'object' ? (e.payload as Record<string, unknown>).invoiceId : undefined);
    const evtType = (e.eventType || '').toLowerCase();
    return typeof rawId === 'string' && rawId.toLowerCase() !== 'system' && !evtType.includes('run') && !evtType.includes('trigger');
  });

  if (invoiceEvents.length === 0) {
    return (
      <div>
        <ChunkBreakdown runId={run.id} />
        <div className="text-[#8a8f98] text-xs py-4 flex items-center border-t border-[#23252a] mt-2">
          <Info className="w-4 h-4 mr-2 text-[#5e6ad2]" />
          No invoice actions were recorded during this run.
        </div>
      </div>
    );
  }

  return (
    <div>
      <ChunkBreakdown runId={run.id} />
      <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-2.5 mt-4">Invoice Processing Breakdown</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {invoiceEvents.map((event, idx) => {
          const { rawInvoiceId, invoiceNumber, isSystem, description, statusText, badgeVariant, subject } = getEventInfo(event);

          return (
            <div key={idx} className="flex flex-col justify-between p-3.5 border border-[#23252a] rounded-xl bg-[#0f1011] hover:border-[#34343a] transition-all">
              <div className="flex items-center justify-between gap-2 mb-2">
                {!isSystem && rawInvoiceId ? (
                  <Link
                    to={`/invoices/${rawInvoiceId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-[#5e6ad2] hover:text-[#828fff] hover:underline truncate flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#5e6ad2] flex-shrink-0" />
                    <span className="truncate">{invoiceNumber}</span>
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-[#8a8f98] flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#8a8f98] flex-shrink-0" />
                    <span>System Event</span>
                  </span>
                )}

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={badgeVariant}>
                    {statusText}
                  </Badge>
                  <span className="text-[10px] text-[#8a8f98] font-mono">
                    {event.createdAt && !isNaN(new Date(event.createdAt).getTime()) ? new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#d0d6e0] leading-relaxed">
                {description}
              </p>

              {subject && (
                <div className="mt-2 text-[11px] text-[#8a8f98] italic truncate border-t border-[#1e2025] pt-1.5">
                  Subject: "{subject}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChunkBreakdown({ runId }: { runId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-run-chunks', runId],
    queryFn: () => agentService.getRunChunks(runId),
    refetchInterval: (query) => {
      const data = query.state.data as AgentRunChunksResponse | undefined;
      const chunks = data?.chunks || [];
      const hasActive = chunks.some((c: AgentRunChunk) => c.status === 'running' || c.status === 'queued');
      return hasActive ? 3000 : false;
    },
  });

  if (isLoading) return <div className="text-xs text-[#8a8f98]">Loading chunk execution details...</div>;
  if (!data?.chunks || data.chunks.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-2">Chunk Processing Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {data.chunks.map((chunk: AgentRunChunk) => (
          <div key={chunk.id} className="flex items-center justify-between text-xs border border-[#23252a] bg-[#0f1011] p-2.5 rounded-xl hover:border-[#34343a] transition-all">
            <div className="flex items-center gap-2">
              <Badge variant={
                chunk.status === 'completed' ? 'success' :
                chunk.status === 'running' ? 'warning' :
                chunk.status === 'failed' ? 'danger' : 'default'
              }>
                {chunk.status}
              </Badge>
              <span className="font-semibold text-[#f7f8f8]">Chunk #{chunk.chunkIndex + 1} of {chunk.totalChunks}</span>
            </div>
            <div className="text-[#8a8f98] flex items-center gap-2 text-[11px]">
              <span>Processed: <strong className="text-[#f7f8f8]">{chunk.invoicesProcessed}</strong></span>
              <span>Sent: <strong className="text-[#f7f8f8]">{chunk.emailsSent}</strong></span>
              {chunk.errors > 0 && <span className="text-red-400 font-semibold">Errors: {chunk.errors}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



