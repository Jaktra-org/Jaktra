import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../../services/agent';
import type { AgentRun } from '../../types/api';
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
  const recipient = (typeof payload.recipient === 'string' ? payload.recipient : '') || (typeof payload.recipientEmail === 'string' ? payload.recipientEmail : '') || (typeof payload.email === 'string' ? payload.email : '');
  const recipientStr = recipient ? ` (${recipient})` : '';

  const safeStr = (val: unknown) => (typeof val === 'string' ? val.toLowerCase() : '');
  const tone = safeStr(payload.tone || payload.toneSource);
  const reason = safeStr(payload.reason);
  const rawDescription = safeStr(payload.description || event?.eventType);
  const errorStr = safeStr(payload.error || payload.errorMessage);

  let description: string;
  let statusText: string;
  let statusCategory: 'sent' | 'halted' | 'skipped';
  let haltedReasonCategory:
    | 'invalid_email'
    | 'legal_escalation'
    | 'recently_sent'
    | 'generation_failed'
    | 'configuration_error'
    | 'other_error' = 'other_error';

  if (eventType === 'email_sent' || eventType === 'email_generated' || eventType.includes('sent')) {
    statusText = 'Email Sent';
    statusCategory = 'sent';

    if (tone.includes('stern') || tone.includes('stage_4') || tone.includes('stage_3') || tone.includes('urgent')) {
      description = `Sent firm notice regarding overdue payment${recipientStr}.`;
    } else if (tone.includes('warm') || tone.includes('friendly') || tone.includes('stage_1') || tone.includes('stage_2')) {
      description = `Sent friendly payment reminder${recipientStr}.`;
    } else if (tone.includes('legal') || tone.includes('escalation')) {
      description = `Sent serious escalation notice${recipientStr}.`;
    } else {
      description = `Sent follow-up email${recipientStr}.`;
    }
  } else if (eventType === 'halted' || eventType === 'failed' || eventType === 'error' || eventType.includes('halt') || eventType.includes('fail')) {
    statusText = 'Halted';
    statusCategory = 'halted';

    // 1. Legal escalation
    if (reason === 'legal_escalation' || (rawDescription.includes('legal escalation') && !rawDescription.includes('no_automated_channel'))) {
      haltedReasonCategory = 'legal_escalation';
      description = `Skipped: Manual legal escalation required${recipientStr}.`;
    }
    // 2. Invalid Email Address or No email address
    else if (reason === 'mail_invalid' || rawDescription.includes('invalid') || rawDescription.includes('mail_invalid') || errorStr.includes('recipient') || errorStr.includes('mx record') || errorStr.includes('domain') || errorStr.includes('no email')) {
      haltedReasonCategory = 'invalid_email';
      description = `Halted: Invalid email address or no email address provided${recipientStr}.`;
    }
    // 3. Email generation failed (LLM failures)
    else if (
      reason === 'generation_error' ||
      errorStr.includes('llm') ||
      errorStr.includes('groq') ||
      errorStr.includes('gemini') ||
      errorStr.includes('ratelimit') ||
      errorStr.includes('quota') ||
      errorStr.includes('429') ||
      errorStr.includes('generation_validation_failed') ||
      rawDescription.includes('generation failed')
    ) {
      haltedReasonCategory = 'generation_failed';
      description = errorStr.includes('authentication') || errorStr.includes('key')
        ? `Failed: AI provider API key error (Groq/Gemini).`
        : `Failed: Email generation failed (LLM provider error or rate limit).`;
    }
    // 4. Email configuration Error (email sending error / missing integration)
    else if (
      reason === 'no_automated_channel' ||
      reason === 'send_error' ||
      rawDescription.includes('no_automated_channel') ||
      rawDescription.includes('no active email channel') ||
      rawDescription.includes('no channel configured') ||
      errorStr.includes('smtp') ||
      errorStr.includes('resend') ||
      errorStr.includes('sendgrid') ||
      errorStr.includes('delivery failed') ||
      rawDescription.includes('send failed')
    ) {
      haltedReasonCategory = 'configuration_error';
      description = `Failed: Email configuration or sending error (Resend/SMTP).`;
    }
    // 5. Skipped due to recently sent
    else if (reason === 'max_reminders_exceeded' || reason === 'idempotency_skip' || reason === 'payment_plan_active' || reason === 'dispute_open') {
      haltedReasonCategory = 'recently_sent';
      description = `Skipped: Follow-up skipped (already contacted recently or policy limit).`;
    }
    // 6. Other error
    else if (reason) {
      haltedReasonCategory = 'other_error';
      description = `Failed: ${reason.replace(/_/g, ' ')}${recipientStr}.`;
    } else {
      haltedReasonCategory = 'other_error';
      description = `Failed: Other error occurred${recipientStr}.`;
    }
  } else if (eventType.includes('skip') || reason.includes('skip') || reason.includes('plan') || reason.includes('dispute')) {
    statusText = 'Skipped';
    statusCategory = 'skipped';
    haltedReasonCategory = 'recently_sent';

    if (reason === 'payment_plan_active') {
      description = `Skipped: Active payment plan in effect.`;
    } else if (reason === 'dispute_open') {
      description = `Skipped: Open dispute under review.`;
    } else if (reason === 'idempotency_skip') {
      description = `Skipped: Follow-up already sent recently.`;
    } else {
      description = `Skipped due to recently sent or active plan.`;
    }
  } else {
    statusText = eventType.replace(/_/g, ' ');
    statusCategory = 'skipped';
    haltedReasonCategory = 'other_error';
    description = payload.subject || payload.message || `Processed event ${eventType}.`;
  }

  return {
    rawInvoiceId,
    invoiceNumber,
    isSystem,
    description,
    statusText,
    statusCategory,
    haltedReasonCategory,
    subject: payload.subject,
  };
}

function EventGroupSection({
  title,
  icon: Icon,
  colorClass,
  events,
  initialLimit = 4,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  events: EventItem[];
  initialLimit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!events || events.length === 0) return null;

  const visibleEvents = expanded ? events : events.slice(0, initialLimit);
  const remainingCount = events.length - initialLimit;

  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 mb-2 text-xs font-semibold ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{title} ({events.length})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {visibleEvents.map((event, idx) => {
          const { rawInvoiceId, invoiceNumber, isSystem, description } = getEventInfo(event);
          const timeStr = event.createdAt && !isNaN(new Date(event.createdAt).getTime())
            ? new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-3 py-2 border border-[#23252a] rounded-lg bg-[#0f1011] hover:border-[#34343a] transition-all text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {!isSystem && rawInvoiceId ? (
                  <Link
                    to={`/invoices/${rawInvoiceId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-[#5e6ad2] hover:text-[#828fff] hover:underline flex items-center gap-1.5 flex-shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#5e6ad2]" />
                    <span>{invoiceNumber}</span>
                  </Link>
                ) : (
                  <span className="font-semibold text-[#8a8f98] flex items-center gap-1.5 flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#8a8f98]" />
                    <span>System</span>
                  </span>
                )}
                <span className="text-[#d0d6e0] truncate" title={description}>
                  {description}
                </span>
              </div>
              {timeStr && (
                <span className="text-[10px] text-[#8a8f98] font-mono flex-shrink-0">
                  {timeStr}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {remainingCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-[11px] font-medium text-[#5e6ad2] hover:text-[#828fff] hover:underline flex items-center gap-1"
        >
          {expanded ? 'Show less' : `+ Show ${remainingCount} more items`}
        </button>
      )}
    </div>
  );
}

function RunDetailsPanel({ run }: { run: AgentRun }) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'invalid_email' | 'legal_escalation' | 'recently_sent' | 'generation_failed' | 'configuration_error' | 'other_error'>('all');
  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-run-details', run.id],
    queryFn: () => agentService.getRunDetails(run.id),
    staleTime: 60000,
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
      <div className="text-[#8a8f98] text-xs py-4 flex items-center border-t border-[#23252a] mt-2">
        <Info className="w-4 h-4 mr-2 text-[#5e6ad2]" />
        No invoice actions were recorded during this run.
      </div>
    );
  }

  const sentEvents = invoiceEvents.filter(e => getEventInfo(e).statusCategory === 'sent');
  const haltedEvents = invoiceEvents.filter(e => getEventInfo(e).statusCategory !== 'sent');
  
  const invalidEmailEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'invalid_email');
  const legalEscalationEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'legal_escalation');
  const recentlySentEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'recently_sent');
  const generationFailedEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'generation_failed');
  const configurationErrorEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'configuration_error');
  const otherErrorEvents = haltedEvents.filter(e => getEventInfo(e).haltedReasonCategory === 'other_error');

  return (
    <div>
      {/* Header and Filter Tabs */}
      <div className="flex items-center justify-between mb-3 border-t border-[#23252a] pt-3">
        <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider">Invoice Processing Breakdown</h4>
        <div className="flex flex-wrap items-center gap-1 bg-[#141516] p-0.5 rounded-lg border border-[#23252a]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'all' ? 'bg-[#23252a] text-[#f7f8f8]' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
          >
            All ({invoiceEvents.length})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'sent' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
          >
            Emails Sent ({sentEvents.length})
          </button>
          {invalidEmailEvents.length > 0 && (
            <button
              onClick={() => setFilter('invalid_email')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'invalid_email' ? 'bg-rose-500/20 text-rose-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Invalid Email ({invalidEmailEvents.length})
            </button>
          )}
          {legalEscalationEvents.length > 0 && (
            <button
              onClick={() => setFilter('legal_escalation')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'legal_escalation' ? 'bg-rose-500/20 text-rose-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Legal Escalation ({legalEscalationEvents.length})
            </button>
          )}
          {recentlySentEvents.length > 0 && (
            <button
              onClick={() => setFilter('recently_sent')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'recently_sent' ? 'bg-amber-500/20 text-amber-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Recently Sent ({recentlySentEvents.length})
            </button>
          )}
          {generationFailedEvents.length > 0 && (
            <button
              onClick={() => setFilter('generation_failed')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'generation_failed' ? 'bg-rose-500/20 text-rose-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Generation Failed ({generationFailedEvents.length})
            </button>
          )}
          {configurationErrorEvents.length > 0 && (
            <button
              onClick={() => setFilter('configuration_error')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'configuration_error' ? 'bg-rose-500/20 text-rose-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Configuration Error ({configurationErrorEvents.length})
            </button>
          )}
          {otherErrorEvents.length > 0 && (
            <button
              onClick={() => setFilter('other_error')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${filter === 'other_error' ? 'bg-rose-500/20 text-rose-400' : 'text-[#8a8f98] hover:text-[#d0d6e0]'}`}
            >
              Other Error ({otherErrorEvents.length})
            </button>
          )}
        </div>
      </div>

      {/* Sub-Grouped Event Lists */}
      {(filter === 'all' || filter === 'sent') && (
        <EventGroupSection
          title="Emails Sent"
          icon={Send}
          colorClass="text-emerald-400"
          events={sentEvents}
        />
      )}

      {(filter === 'all' || filter === 'invalid_email') && (
        <EventGroupSection
          title="Invalid Email Address or No email address"
          icon={AlertTriangle}
          colorClass="text-rose-400"
          events={invalidEmailEvents}
        />
      )}

      {(filter === 'all' || filter === 'legal_escalation') && (
        <EventGroupSection
          title="Skipped due to legal escalation"
          icon={AlertTriangle}
          colorClass="text-rose-400"
          events={legalEscalationEvents}
        />
      )}

      {(filter === 'all' || filter === 'recently_sent') && (
        <EventGroupSection
          title="Skipped due to recently sent"
          icon={Info}
          colorClass="text-amber-400"
          events={recentlySentEvents}
        />
      )}

      {(filter === 'all' || filter === 'generation_failed') && (
        <EventGroupSection
          title="Email generation failed"
          icon={AlertTriangle}
          colorClass="text-rose-400"
          events={generationFailedEvents}
        />
      )}

      {(filter === 'all' || filter === 'configuration_error') && (
        <EventGroupSection
          title="Email configuration Error"
          icon={AlertTriangle}
          colorClass="text-rose-400"
          events={configurationErrorEvents}
        />
      )}

      {(filter === 'all' || filter === 'other_error') && (
        <EventGroupSection
          title="Other error"
          icon={AlertTriangle}
          colorClass="text-rose-400"
          events={otherErrorEvents}
        />
      )}
    </div>
  );
}



