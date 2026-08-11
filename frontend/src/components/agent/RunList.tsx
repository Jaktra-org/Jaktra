import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '../../services/agent';
import type { AgentRun, AgentRunChunk, AgentRunChunksResponse } from '../../types/api';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, Send, FileText, Loader2, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

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

function RunDetailsPanel({ run }: { run: AgentRun }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agent-run-details', run.id],
    queryFn: () => agentService.getRunDetails(run.id),
    staleTime: 60000, // Cache for 1 min
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-[#8a8f98]">
        <Loader2 className="w-4 h-4 animate-spin text-[#5e6ad2] mr-2" />
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

  if (events.length === 0) {
    return (
      <div className="text-[#8a8f98] text-xs py-4 flex items-center">
        <Info className="w-4 h-4 mr-2 text-[#5e6ad2]" />
        No actions were taken during this run (no overdue invoices or all skipped).
      </div>
    );
  }

  return (
    <div>
      <ChunkBreakdown runId={run.id} />
      <h4 className="text-[11px] font-semibold text-[#8a8f98] uppercase tracking-wider mb-2.5 mt-4">Invoice Processing Breakdown</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-start p-3 border border-[#23252a] rounded-md bg-[#0f1011]">
            <div className="mt-0.5">
              {event.eventType === 'email_sent' || event.eventType === 'email_generated' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#27a644] mr-2.5" />
              ) : event.eventType === 'halted' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mr-2.5" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-[#62666d] mr-2.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Link to={`/invoices/${event.invoiceId}`} className="text-xs font-medium text-[#5e6ad2] hover:text-[#828fff] truncate">
                  Invoice {event.invoiceId ? (event.invoiceId.length > 8 ? `${event.invoiceId.substring(0, 8)}...` : event.invoiceId) : 'N/A'}
                </Link>
                <span className="text-[10px] text-[#8a8f98] ml-2">
                  {event.createdAt && !isNaN(new Date(event.createdAt).getTime()) ? new Date(event.createdAt).toLocaleTimeString() : ''}
                </span>
              </div>
              <p className="text-[11px] text-[#d0d6e0] mt-0.5 capitalize font-medium">
                {(event.eventType || '').replace('_', ' ')}
              </p>
              {event.payload && typeof event.payload === 'object' && (
                <div className="mt-1.5 text-[11px] text-[#8a8f98] bg-[#010102] p-2 rounded border border-[#23252a] font-mono overflow-x-auto whitespace-nowrap">
                  {Object.entries(event.payload)
                    .filter(([k]) => k !== 'runId' && k !== 'bodyPreview')
                    .map(([k, v]) => (
                    <span key={k} className="mr-3">
                      <span className="text-[#62666d]">{k}:</span> <span className="text-[#f7f8f8]">{String(v)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChunkBreakdown({ runId }: { runId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-run-chunks', runId],
    queryFn: () => agentService.getRunChunks(runId),
    refetchInterval: (query) => {
      // Poll chunks list if any chunk is running or queued
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
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
        {data.chunks.map((chunk: AgentRunChunk) => (
          <div key={chunk.id} className="flex items-center justify-between text-xs border border-[#23252a] bg-[#0f1011] p-2 rounded">
            <div className="flex items-center gap-2">
              <Badge variant={
                chunk.status === 'completed' ? 'success' :
                chunk.status === 'running' ? 'warning' :
                chunk.status === 'failed' ? 'danger' : 'default'
              }>
                {chunk.status}
              </Badge>
              <span className="font-medium text-[#f7f8f8]">Chunk #{chunk.chunkIndex + 1} of {chunk.totalChunks}</span>
            </div>
            <div className="text-[#8a8f98] flex items-center gap-3 text-[11px]">
              <span>Processed: {chunk.invoicesProcessed}</span>
              <span>Sent: {chunk.emailsSent}</span>
              {chunk.errors > 0 && <span className="text-red-400 font-semibold">Errors: {chunk.errors}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


