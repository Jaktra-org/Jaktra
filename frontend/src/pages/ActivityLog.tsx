import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  History, Search, Filter, RefreshCw, ArrowRight,
  Settings as SettingsIcon, Shield, Zap, FileText, CreditCard,
  AlertTriangle, Play, CheckCircle2, XCircle, ShieldAlert, Calendar,
  Trash2, RotateCcw
} from "lucide-react";
import { eventService } from "../services/event";
import type { InvoiceEvent } from "../types/api";

export const formatCurrency = (val: string | number) => {
  return Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(val));
};

export const formatDateValue = (val: any) => {
  if (!val) return 'None';
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const categoryActionTypeMap: Record<string, string[]> = {
  invoices: [
    'invoice.created',
    'invoice.imported',
    'invoice.updated',
    'invoice.status_changed',
    'invoice.trashed',
    'invoice.restored',
    'invoice.permanently_deleted',
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
    'user.removed',
    'auth.mfa_enabled',
    'auth.mfa_disabled',
    'auth.password_reset',
    'auth.account_locked'
  ],
  settings: [
    'settings.updated',
    'settings.webhook_token_rotated'
  ],
  integrations: [
    'integration.connected',
    'integration.disconnected',
    'integration.default_provider_changed'
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

const eventCategoryMap: {
  prefix: string;
  icon: any;
  colorClass: string;
  badgeStyle: string;
}[] = [
  { prefix: 'user.', icon: Shield, colorClass: 'text-violet-600', badgeStyle: 'bg-violet-50 text-violet-700 border-violet-100' },
  { prefix: 'auth.', icon: Shield, colorClass: 'text-violet-600', badgeStyle: 'bg-violet-50 text-violet-700 border-violet-100' },
  { prefix: 'settings.', icon: SettingsIcon, colorClass: 'text-amber-600', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100' },
  { prefix: 'integration.', icon: Zap, colorClass: 'text-emerald-600', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { prefix: 'payment.received', icon: CheckCircle2, colorClass: 'text-emerald-600', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { prefix: 'payment.', icon: CreditCard, colorClass: 'text-cyan-600', badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { prefix: 'invoice.trashed', icon: Trash2, colorClass: 'text-amber-600', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100' },
  { prefix: 'invoice.restored', icon: RotateCcw, colorClass: 'text-emerald-600', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { prefix: 'invoice.permanently_deleted', icon: XCircle, colorClass: 'text-rose-600', badgeStyle: 'bg-rose-50 text-rose-700 border-rose-100' },
  { prefix: 'invoice.', icon: FileText, colorClass: 'text-blue-600', badgeStyle: 'bg-blue-50 text-blue-700 border-blue-100' },
  { prefix: 'dlq.', icon: AlertTriangle, colorClass: 'text-amber-500', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100' },
  { prefix: 'agent.run_triggered', icon: Play, colorClass: 'text-indigo-600', badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { prefix: 'reconciler.run_triggered', icon: Play, colorClass: 'text-indigo-600', badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
];

const getEventConfig = (actionType: string) => {
  const cfg = eventCategoryMap.find(m => actionType.startsWith(m.prefix));
  if (cfg) return cfg;
  return { icon: History, colorClass: 'text-slate-500', badgeStyle: 'bg-slate-50 text-slate-700 border-slate-100' };
};

const settingsKeyNames: Record<string, string> = {
  companyName: 'organization name',
  senderName: 'sender name',
  senderEmail: 'sender email',
  replyTo: 'reply-to email',
  paymentLink: 'default payment link',
  bankDetails: 'bank details',
  timezone: 'timezone',
  scheduleHour: 'daily run time',
  idempotencyWindowHours: 'idempotency window',
  defaultEmailProvider: 'default email provider',
  skipPaymentWarning: 'skip payment warning',
  autoPurgeEnabled: 'auto-purge status',
  autoPurgeDays: 'auto-purge window',
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
  const [activeHoverCard, setActiveHoverCard] = useState<{
    eventId: string;
    name: string;
    role: string | null;
    email: string | null;
  } | null>(null);

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

  const formatCurrency = (val: any) => {
    const amount = Number(val);
    if (isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDateValue = (val: any) => {
    if (!val) return '—';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    return String(val);
  };

  const getEventIcon = (actionType: string) => {
    const config = getEventConfig(actionType);
    const IconComponent = config.icon;
    return <IconComponent className={`h-5 w-5 ${config.colorClass}`} />;
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

  const getSourceTooltip = (source: string) => {
    switch (source.toLowerCase()) {
      case 'ui':
        return 'Triggered manually via the dashboard console';
      case 'agent':
        return 'Executed automatically by the AI agent system';
      case 'webhook':
        return 'Triggered by an external webhook integration';
      case 'api':
        return 'Triggered via the integrations or developer API';
      default:
        return 'Executed by the Jaktra system automated service';
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

    // Keep detail box for invoice.trashed and invoice.permanently_deleted as they display snapshot details not in the title
    if ((event.actionType === 'invoice.trashed' || event.actionType === 'invoice.permanently_deleted') && event.oldValues) {
      const vals = event.oldValues;
      const formattedFields = [
        vals.invoiceNo ? { label: "Invoice No", value: vals.invoiceNo } : null,
        vals.clientName ? { label: "Client", value: vals.clientName } : null,
        vals.contactEmail ? { label: "Contact Email", value: vals.contactEmail } : null,
        vals.invoiceAmount !== undefined ? { label: "Amount", value: formatCurrency(vals.invoiceAmount) } : null,
        vals.dueDate ? { label: "Due Date", value: formatDateValue(vals.dueDate) } : null,
        vals.paymentStatus ? { label: "Status", value: vals.paymentStatus } : null,
      ].filter(Boolean) as { label: string; value: string }[];

      if (formattedFields.length > 0) {
        return (
          <div className="mt-3 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100 text-slate-600 space-y-1.5 pl-3 border-l-2 border-slate-300">
            <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Invoice Details Snapshot:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-medium">
              {formattedFields.map((f, i) => (
                <div key={i} className="flex justify-between sm:justify-start gap-2 py-0.5 border-b border-slate-100 last:border-0 sm:border-0">
                  <span className="text-slate-400 font-semibold">{f.label}:</span>
                  <span className="text-slate-700 font-bold">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    // Keep detail box for settings.updated to list all changed settings keys/values
    if (event.actionType === 'settings.updated' && hasChanges) {
      const oldVals = event.oldValues || {};
      const newVals = event.newValues || {};
      const keys = Object.keys({ ...oldVals, ...newVals }).filter(key => key !== 'updatedAt' && key !== 'tenantId');
      
      // Hide the details box for single-field settings updates as the sentence already conveys everything
      if (keys.length <= 1) {
        return null;
      }

      return (
        <div className="mt-3 text-xs space-y-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100 pl-3 border-l-2 border-amber-500/80">
          <div className="font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider font-sans">Changed Settings Details:</div>
          <div className="grid grid-cols-1 gap-2 font-medium">
            {keys.map(key => {
              const label = settingsKeyNames[key] || key;
              return (
                <div key={key} className="flex flex-wrap items-center gap-1.5 text-slate-600 font-sans">
                  <span className="text-slate-400 font-semibold">{label}:</span>
                  <span className="line-through text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-mono">{formatVal(oldVals[key])}</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[10px] font-mono">{formatVal(newVals[key])}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Keep detail box for user.role_updated to show role transition
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

    // All other events are title-only because their description includes all variables
    return null;
  };

  const renderActorSection = (evt: InvoiceEvent) => {
    const displayName = evt.actorName || (evt.source === 'agent' ? 'AI Agent' : evt.source === 'webhook' ? 'Webhook' : 'System');
    
    if (!evt.actorName) {
      return <span className="font-semibold text-slate-900">{displayName}</span>;
    }

    const isCardOpen = activeHoverCard?.eventId === evt.id;
    const initials = evt.actorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
      <span 
        className="relative inline-block mr-1"
        onMouseEnter={() => setActiveHoverCard({
          eventId: evt.id,
          name: evt.actorName || '',
          role: evt.actorRole,
          email: evt.actorEmail
        })}
        onMouseLeave={() => setActiveHoverCard(null)}
      >
        <span className="font-bold text-slate-950 border-b border-dotted border-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
          {evt.actorName}
        </span>
        
        {/* Hover card */}
        {isCardOpen && (
          <span className="absolute z-50 bottom-full left-0 mb-2 w-60 bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-left block pointer-events-none animate-timeline-fade-in font-sans leading-normal">
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {initials}
              </span>
              <span className="block min-w-0">
                <span className="block font-bold text-slate-900 text-xs truncate">{evt.actorName}</span>
                {evt.actorRole && (
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {evt.actorRole}
                  </span>
                )}
              </span>
            </span>
            {evt.actorEmail && (
              <span className="block mt-2 pt-1.5 border-t border-slate-100">
                <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wider">Email</span>
                <span className="block text-[10px] text-slate-600 font-mono truncate select-all">{evt.actorEmail}</span>
              </span>
            )}
          </span>
        )}
      </span>
    );
  };

  const renderActivitySentence = (evt: InvoiceEvent) => {
    const actor = renderActorSection(evt);
    const action = evt.actionType.toLowerCase();

    const renderInvoiceLink = (invoiceNo: string) => {
      if (!invoiceNo || invoiceNo === 'unknown') {
        return <span className="font-bold text-slate-950">#unknown</span>;
      }
      
      // If permanently deleted, do not make it clickable (no details page exists)
      if (evt.actionType === 'invoice.permanently_deleted') {
        return <span className="font-bold text-slate-950">#{invoiceNo}</span>;
      }

      const path = evt.invoiceDeletedAt 
        ? `/invoices/${evt.invoiceId}/trashed` 
        : `/invoices/${evt.invoiceId}`;

      return (
        <Link 
          to={path}
          className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          #{invoiceNo}
        </Link>
      );
    };

    if (action === 'user.invited') {
      const email = evt.newValues?.email || evt.payload?.email || 'new user';
      const role = evt.newValues?.role || evt.payload?.role || 'member';
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      return (
        <span>
          {actor} invited <span className="font-semibold text-slate-900">{email}</span> as <span className="font-bold text-slate-950">{capitalizedRole}</span>
        </span>
      );
    }

    if (action === 'user.invite_resent') {
      const email = evt.newValues?.email || evt.payload?.email || 'user';
      return (
        <span>
          {actor} resent the team invitation to <span className="font-semibold text-slate-900">{email}</span>
        </span>
      );
    }

    if (action === 'user.invite_revoked') {
      const email = evt.newValues?.email || evt.payload?.email || 'user';
      return (
        <span>
          {actor} revoked the team invitation for <span className="font-semibold text-slate-900">{email}</span>
        </span>
      );
    }

    if (action === 'user.joined') {
      return (
        <span>
          {actor} joined the organization
        </span>
      );
    }

    if (action === 'user.role_updated') {
      const targetName = evt.newValues?.name || evt.payload?.name || 'user';
      const role = evt.newValues?.role || evt.payload?.role || '';
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
      return (
        <span>
          {actor} updated the role of <span className="font-semibold text-slate-900">{targetName}</span> to <span className="font-bold text-slate-950">{capitalizedRole}</span>
        </span>
      );
    }

    if (action === 'user.removed') {
      const targetName = evt.newValues?.name || evt.payload?.name || 'user';
      return (
        <span>
          {actor} removed <span className="font-semibold text-slate-900">{targetName}</span> from the organization
        </span>
      );
    }

    if (action === 'settings.updated') {
      const oldVals = evt.oldValues || {};
      const newVals = evt.newValues || {};
      const keys = Object.keys({ ...oldVals, ...newVals }).filter(key => key !== 'updatedAt' && key !== 'tenantId');

      if (keys.length === 1) {
        const key = keys[0];
        const oldVal = oldVals[key];
        const newVal = newVals[key];

        if (key === 'autoPurgeEnabled') {
          const enabled = newVal === true || newVal === 'true';
          return <span>{actor} {enabled ? 'enabled' : 'disabled'} auto-purge</span>;
        }
        if (key === 'autoPurgeDays') {
          return <span>{actor} changed auto-purge window from <span className="font-semibold text-slate-900">{oldVal ?? 30}</span> to <span className="font-bold text-slate-950">{newVal ?? 30}</span> days</span>;
        }
        if (key === 'companyName') {
          return <span>{actor} changed organization name to <span className="font-bold text-slate-955">"{newVal}"</span></span>;
        }
        if (key === 'senderName') {
          return <span>{actor} updated the sender name to <span className="font-bold text-slate-955">"{newVal}"</span></span>;
        }
        if (key === 'senderEmail') {
          return <span>{actor} updated the sender email to <span className="font-semibold text-slate-900">{newVal}</span></span>;
        }
        if (key === 'replyTo') {
          if (!newVal) {
            return <span>{actor} removed the reply-to email</span>;
          }
          return <span>{actor} changed the reply-to email to <span className="font-semibold text-slate-900">{newVal}</span></span>;
        }
        if (key === 'paymentLink') {
          if (!newVal) {
            return <span>{actor} removed the default payment link</span>;
          }
          return <span>{actor} changed the default payment link to <span className="font-semibold text-slate-900">{newVal}</span></span>;
        }
        if (key === 'bankDetails') {
          return <span>{actor} updated organizational bank details</span>;
        }
        if (key === 'timezone') {
          return <span>{actor} changed the timezone to <span className="font-semibold text-slate-900">{newVal}</span></span>;
        }
        if (key === 'scheduleHour') {
          return <span>{actor} changed the daily run time</span>;
        }
        if (key === 'idempotencyWindowHours') {
          return <span>{actor} changed the idempotency window to <span className="font-semibold text-slate-900">{newVal}</span> hours</span>;
        }
        if (key === 'defaultEmailProvider') {
          const providerName = String(newVal).toUpperCase();
          return <span>{actor} changed default email provider to <span className="font-bold text-slate-955">{providerName}</span></span>;
        }
        if (key === 'skipPaymentWarning') {
          const skip = newVal === true || newVal === 'true';
          return <span>{actor} {skip ? 'enabled' : 'disabled'} skip payment warning</span>;
        }

        // Fallback for single unknown key
        const label = settingsKeyNames[key] || key;
        return (
          <span>
            {actor} updated setting <span className="font-semibold text-slate-900">{label}</span> to <span className="font-bold text-slate-955">{String(newVal)}</span>
          </span>
        );
      } else if (keys.length > 1) {
        const keyNames = keys.map(k => settingsKeyNames[k] || k);
        return (
          <span>
            {actor} updated {keys.length} settings: <span className="font-semibold text-slate-900">{keyNames.join(', ')}</span>
          </span>
        );
      }

      // Default fallback if no keys changed
      return (
        <span>
          {actor} updated organization settings
        </span>
      );
    }

    if (action === 'settings.webhook_token_rotated') {
      return (
        <span>
          {actor} rotated the webhook signature token
        </span>
      );
    }

    if (action === 'integration.connected') {
      const provider = evt.payload?.provider || evt.payload?.integration || evt.newValues?.provider || 'service';
      const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      return (
        <span>
          {actor} connected <span className="font-bold text-slate-950">{capitalizedProvider}</span> integration
        </span>
      );
    }

    if (action === 'integration.disconnected') {
      const provider = evt.payload?.provider || evt.payload?.integration || evt.oldValues?.provider || 'service';
      const capitalizedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      return (
        <span>
          {actor} disconnected <span className="font-bold text-slate-950">{capitalizedProvider}</span> integration
        </span>
      );
    }

    if (action === 'integration.default_provider_changed') {
      const provider = evt.payload?.to || evt.newValues?.to || 'None';
      const providerName = provider === 'None' ? 'None' : provider.toUpperCase();
      return (
        <span>
          {actor} changed default email provider to <span className="font-bold text-slate-950">{providerName}</span>
        </span>
      );
    }

    if (action === 'auth.mfa_enabled') {
      return (
        <span>
          {actor} enabled Multi-Factor Authentication (MFA)
        </span>
      );
    }

    if (action === 'auth.mfa_disabled') {
      return (
        <span>
          {actor} disabled Multi-Factor Authentication (MFA)
        </span>
      );
    }

    if (action === 'auth.password_reset') {
      return (
        <span>
          {actor} reset password successfully
        </span>
      );
    }

    if (action === 'auth.account_locked') {
      const email = evt.payload?.email || evt.actorEmail || 'unknown';
      return (
        <span>
          System locked account <span className="font-semibold text-slate-900">{email}</span> due to repeated failed login attempts
        </span>
      );
    }

    if (action === 'invoice.bulk_imported') {
      const count = evt.payload?.count || evt.newValues?.count || 'multiple';
      return (
        <span>
          {actor} bulk-imported <span className="font-bold text-slate-955">{count}</span> invoices
        </span>
      );
    }

    if (action === 'agent.run_triggered') {
      return (
        <span>
          {actor} triggered automated AI agent run
        </span>
      );
    }

    if (action === 'reconciler.run_triggered') {
      return (
        <span>
          {actor} triggered payment reconciliation run
        </span>
      );
    }

    if (action === 'invoice.created') {
      const invoiceNo = evt.invoiceNo || evt.newValues?.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} created Invoice {renderInvoiceLink(invoiceNo)}
        </span>
      );
    }

    if (action === 'invoice.updated') {
      const invoiceNo = evt.invoiceNo || evt.newValues?.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} updated Invoice {renderInvoiceLink(invoiceNo)}
        </span>
      );
    }

    if (action === 'invoice.imported') {
      const invoiceNo = evt.invoiceNo || evt.newValues?.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} imported Invoice {renderInvoiceLink(invoiceNo)} via CSV
        </span>
      );
    }

    if (action === 'invoice.status_changed') {
      const invoiceNo = evt.invoiceNo || evt.newValues?.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      const status = evt.newValues?.paymentStatus || evt.payload?.paymentStatus || 'unknown';
      const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      return (
        <span>
          {actor} changed status of Invoice {renderInvoiceLink(invoiceNo)} to <span className="font-semibold text-slate-900">{capitalizedStatus}</span>
        </span>
      );
    }

    if (action === 'payment.link_generated') {
      const invoiceNo = evt.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} generated payment link for Invoice {renderInvoiceLink(invoiceNo)}
        </span>
      );
    }

    if (action === 'payment.received') {
      const invoiceNo = evt.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      const amount = evt.newValues?.amount || evt.payload?.amount || '';
      const provider = evt.newValues?.provider || evt.payload?.provider || '';
      const formattedAmount = amount ? formatCurrency(amount) : '';
      return (
        <span>
          {actor} received payment{formattedAmount ? ` of ${formattedAmount}` : ''} for Invoice {renderInvoiceLink(invoiceNo)}{provider ? ` via ${provider}` : ''}
        </span>
      );
    }

    if (action === 'invoice.trashed') {
      const invoiceNo = evt.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} moved Invoice {renderInvoiceLink(invoiceNo)} to Trash
        </span>
      );
    }

    if (action === 'invoice.restored') {
      const invoiceNo = evt.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} restored Invoice {renderInvoiceLink(invoiceNo)} from Trash
        </span>
      );
    }

    if (action === 'invoice.permanently_deleted') {
      const invoiceNo = evt.invoiceNo || evt.oldValues?.invoiceNo || 'unknown';
      return (
        <span>
          {actor} permanently deleted Invoice {renderInvoiceLink(invoiceNo)}
        </span>
      );
    }

    if (action === 'dlq.cleared') {
      return (
        <span>
          {actor} cleared all dead-letter queue (DLQ) alerts
        </span>
      );
    }

    return (
      <span>
        {actor} executed <span className="font-semibold text-slate-950">{evt.description || evt.actionType}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-2">
      {/* Clean standard page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track administrative, user, settings, integration, and agent operations across your entire organization.
          </p>
        </div>
        <button 
          onClick={() => fetchEvents(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 active:scale-95 transition-all text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-center"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
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

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="text-sm text-slate-800 leading-snug">
                      {renderActivitySentence(evt)}
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
                    {/* Source badge with descriptive tooltip */}
                    <span 
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border cursor-default ${getSourceBadgeStyles(evt.source)}`}
                      title={getSourceTooltip(evt.source)}
                    >
                      {evt.source.toUpperCase()}
                    </span>


                  </div>

                  {/* Expandable/Formatted Metadata Block */}
                  {renderEventDetails(evt)}
                </div>

                {/* Arrow link icon: links active to /invoices/:id, trashed to /invoices/:id/trashed, none for permanent deleted */}
                {evt.entityType === 'invoice' && evt.actionType !== 'invoice.permanently_deleted' && evt.invoiceNo ? (
                  evt.invoiceDeletedAt ? (
                    <Link 
                      to={`/invoices/${evt.invoiceId}/trashed`}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors self-center flex-shrink-0 hidden sm:block"
                      title="View Trashed Invoice Detail"
                    >
                      <ArrowRight className="h-4 w-4 text-amber-600 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ) : (
                    <Link 
                      to={`/invoices/${evt.invoiceId}`}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors self-center flex-shrink-0 hidden sm:block"
                      title="View Invoice Detail"
                    >
                      <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:text-indigo-800 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )
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
