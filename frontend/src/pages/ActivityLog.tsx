import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  History, Search, Filter, RefreshCw, ArrowRight,
  User, Settings as SettingsIcon, Shield, Zap, FileText, CreditCard,
  AlertTriangle, Play, CheckCircle2, XCircle, ShieldAlert, Calendar
} from "lucide-react";
import { eventService } from "../services/event";
import type { InvoiceEvent } from "../types/api";

const categoryActionTypeMap: Record<string, string[]> = {
  invoices: [
    'invoice.created',
    'invoice.imported',
    'invoice.updated',
    'invoice.status_changed',
    'invoice.deleted',
    'invoice.bulk_imported',
    'payment.link_generated',
    'payment.received'
  ],
  team: [
    'user.invited',
    'user.invite_resent',
    'user.invite_revoked',
    'user.joined',
    'user.role_updated',
    'user.removed'
  ],
  settings: [
    'settings.updated',
    'settings.webhook_token_rotated'
  ],
  integrations: [
    'integration.connected',
    'integration.disconnected',
    'integration.default_email_changed'
  ],
  operational: [
    'followup.triggered',
    'followup.sent',
    'followup.skipped',
    'followup.halted',
    'followup.email_opened',
    'followup.email_clicked',
    'followup.bounced',
    'dlq.added',
    'dlq.cleared',
    'dlq.retried',
    'agent.run_triggered',
    'reconciler.run_triggered'
  ]
};

export function ActivityLog() {
  const [events, setEvents] = useState<InvoiceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { id: "all", label: "All Events" },
    { id: "invoices", label: "Invoices" },
    { id: "team", label: "Team & Access" },
    { id: "settings", label: "Settings" },
    { id: "integrations", label: "Integrations" },
    { id: "operational", label: "Operations" },
  ];

  const fetchEvents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const actionTypes = selectedCategory !== "all" ? categoryActionTypeMap[selectedCategory] : undefined;
      const sources = selectedSource !== "all" ? [selectedSource] : undefined;

      let from: string | undefined;
      if (selectedDateRange === '24h') {
        from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      } else if (selectedDateRange === '7d') {
        from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (selectedDateRange === '30d') {
        from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const response = await eventService.getAllEvents({
        page,
        limit,
        actionTypes,
        sources,
        from,
      });

      setEvents(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to load activity log events:", err);
      setError(err?.response?.data?.error?.message || err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, selectedCategory, selectedSource, selectedDateRange]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll main content area back to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Client-side filtering for search term
  const filteredEvents = events.filter(evt => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    return (
      evt.actionType.toLowerCase().includes(term) ||
      (evt.description && evt.description.toLowerCase().includes(term)) ||
      (evt.actorName && evt.actorName.toLowerCase().includes(term)) ||
      (evt.actorEmail && evt.actorEmail.toLowerCase().includes(term)) ||
      evt.entityId.toLowerCase().includes(term) ||
      (evt.invoiceNo && evt.invoiceNo.toLowerCase().includes(term))
    );
  });

  const getEventIcon = (actionType: string) => {
    if (actionType.startsWith('user.')) return <Shield className="h-5 w-5 text-violet-600" />;
    if (actionType.startsWith('settings.')) return <SettingsIcon className="h-5 w-5 text-amber-600" />;
    if (actionType.startsWith('integration.')) return <Zap className="h-5 w-5 text-emerald-600" />;
    if (actionType.startsWith('payment.received')) return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    if (actionType.startsWith('payment.')) return <CreditCard className="h-5 w-5 text-cyan-600" />;
    if (actionType.startsWith('invoice.deleted')) return <XCircle className="h-5 w-5 text-rose-600" />;
    if (actionType.startsWith('invoice.')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (actionType.startsWith('dlq.')) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (actionType.endsWith('.run_triggered')) return <Play className="h-5 w-5 text-indigo-600" />;
    return <History className="h-5 w-5 text-slate-500" />;
  };

  const getActionBadgeStyles = (actionType: string) => {
    if (actionType.startsWith('user.')) return 'bg-violet-50 text-violet-700 border-violet-100';
    if (actionType.startsWith('settings.')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (actionType.startsWith('integration.')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (actionType.startsWith('invoice.')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (actionType.startsWith('payment.')) return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    if (actionType.startsWith('followup.')) return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  const getSourceBadgeStyles = (source: string) => {
    switch (source) {
      case 'ui':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'agent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'webhook':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'api':
        return 'bg-teal-50 text-teal-700 border-teal-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const renderEventDetails = (event: InvoiceEvent) => {
    const formatVal = (v: any) => {
      if (v === null || v === undefined) return "None";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    };

    const hasChanges = (event.oldValues && Object.keys(event.oldValues).length > 0) || 
                       (event.newValues && Object.keys(event.newValues).length > 0);

    if (event.actionType === 'settings.updated' && hasChanges) {
      const keys = Object.keys({ ...event.oldValues, ...event.newValues });
      return (
        <div className="mt-3 text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-slate-600">
          <div className="font-semibold text-slate-700 mb-1">Changed Settings:</div>
          {keys.map(key => (
            <div key={key} className="flex flex-wrap items-center gap-1">
              <span className="font-bold text-slate-800">{key}:</span>
              <span className="line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">{formatVal(event.oldValues?.[key])}</span>
              <span>&rarr;</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[10px]">{formatVal(event.newValues?.[key])}</span>
            </div>
          ))}
        </div>
      );
    }

    if (event.actionType === 'user.role_updated' && hasChanges) {
      return (
        <div className="mt-3 text-xs flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
          <span className="font-semibold text-slate-700">Role Changed:</span>
          <span className="line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">{formatVal(event.oldValues?.role)}</span>
          <span>&rarr;</span>
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[10px]">{formatVal(event.newValues?.role)}</span>
        </div>
      );
    }

    if (hasChanges) {
      return (
        <div className="mt-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-slate-600 space-y-1">
          {event.oldValues && Object.keys(event.oldValues).length > 0 && (
            <div>
              <span className="font-bold text-slate-700">Previous: </span>
              <span>{JSON.stringify(event.oldValues)}</span>
            </div>
          )}
          {event.newValues && Object.keys(event.newValues).length > 0 && (
            <div>
              <span className="font-bold text-slate-700">New Values: </span>
              <span className="text-slate-800">{JSON.stringify(event.newValues)}</span>
            </div>
          )}
        </div>
      );
    }

    if (event.payload && Object.keys(event.payload).length > 0) {
      return (
        <div className="mt-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-slate-600">
          <span className="font-bold text-slate-700">Details: </span>
          <span>{JSON.stringify(event.payload)}</span>
        </div>
      );
    }

    return null;
  };

  const getActorDescription = (evt: InvoiceEvent) => {
    if (evt.actorName) {
      return (
        <span className="inline-flex items-center space-x-1">
          <User className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-700">{evt.actorName}</span>
          {evt.actorEmail && <span className="text-slate-400 text-xs">({evt.actorEmail})</span>}
          {evt.actorRole && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 ml-1">
              {evt.actorRole}
            </span>
          )}
        </span>
      );
    }
    
    // Fallback for system / agent
    if (evt.source === 'agent') return <span className="font-semibold text-slate-700">AI agent</span>;
    if (evt.source === 'webhook') return <span className="font-semibold text-slate-700">External Webhook</span>;
    return <span className="font-semibold text-slate-700">System event</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-2">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-indigo-500/30">
              <History className="h-3 w-3 mr-1" />
              Audit Logs
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Global Activity Log
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Track administrative, user, settings, integration, and agent operations across your entire organization.
            </p>
          </div>
          
          <button 
            onClick={() => fetchEvents(true)}
            disabled={loading || refreshing}
            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-medium text-sm px-4 py-2.5 rounded-lg border border-white/20 shadow-sm backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Control bar / Filtering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset page to 1 when searching
            }}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
          />
        </div>

        {/* Source Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="ui">UI Console</option>
            <option value="agent">AI Agent</option>
            <option value="webhook">Webhooks</option>
            <option value="api">Integrations / API</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedDateRange}
            onChange={(e) => {
              setSelectedDateRange(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 shadow-sm border ${
              selectedCategory === cat.id
                ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-800">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Failed to retrieve activity log</h3>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Feed List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Activity History</h2>
          <span className="text-xs text-slate-500 font-medium">Total Events: {total}</span>
        </div>

        {/* Loading state (skeleton cards) */}
        {loading ? (
          <div className="divide-y divide-slate-100 animate-pulse">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="flex space-x-2 pt-1">
                    <div className="h-5 bg-slate-100 rounded w-16" />
                    <div className="h-5 bg-slate-100 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty state */
          <div className="p-16 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <History className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-base">No activity found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                No events matched your current category, search, or source filters. Try resetting the options.
              </p>
            </div>
          </div>
        ) : (
          /* Feed List */
          <div className="divide-y divide-slate-100">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4 group">
                {/* Event Type Icon wrapper */}
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                  {getEventIcon(evt.actionType)}
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="text-sm text-slate-800">
                      {getActorDescription(evt)}
                      <span className="text-slate-500 font-medium"> executed </span>
                      <span className="font-semibold text-slate-950">{evt.description || evt.actionType}</span>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap self-start sm:self-center font-medium">
                      {new Date(evt.createdAt).toLocaleString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-xs">
                    {/* Action badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${getActionBadgeStyles(evt.actionType)}`}>
                      {evt.actionType}
                    </span>

                    {/* Source badge */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getSourceBadgeStyles(evt.source)}`}>
                      {evt.source.toUpperCase()}
                    </span>

                    {/* Invoice marker: Link if active, red badge if soft-deleted */}
                    {evt.entityType === 'invoice' && (
                      evt.invoiceDeletedAt || evt.actionType === 'invoice.deleted' || !evt.invoiceNo ? (
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100" 
                          title="This invoice has been deleted and cannot be viewed."
                        >
                          Invoice: #{evt.invoiceNo || 'Deleted'} (Deleted - View Not Available)
                        </span>
                      ) : (
                        <Link 
                          to={`/invoices/${evt.invoiceId}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200 transition-colors"
                        >
                          Invoice: #{evt.invoiceNo} &rarr;
                        </Link>
                      )
                    )}
                  </div>

                  {/* Expandable/Formatted Metadata Block */}
                  {renderEventDetails(evt)}
                </div>

                {/* Arrow link icon: only links if invoice is active */}
                {evt.entityType === 'invoice' && !evt.invoiceDeletedAt && evt.actionType !== 'invoice.deleted' && evt.invoiceNo ? (
                  <Link 
                    to={`/invoices/${evt.invoiceId}`}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors self-center flex-shrink-0 hidden sm:block"
                    title="View Invoice Detail"
                  >
                    <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800 group-hover:translate-x-1 transition-all" />
                  </Link>
                ) : (
                  <div className="w-6 h-6 flex-shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
            <div>
              Page <span className="font-semibold text-slate-900">{page}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
