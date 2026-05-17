import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { analyticsService } from "../services/analytics";
import { agentService } from "../services/agent";
import { eventService } from "../services/event";
import { formatCurrencyUSD } from "../utils/format";
import { 
  FileText, TrendingUp, DollarSign, Loader2, Clock, Zap, AlertCircle, 
  ChevronRight, Plus, Bot, MessageSquare, AlertTriangle, History
} from "lucide-react";
import { getErrorMessage } from "../utils/error-utils";

export function Dashboard() {
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsService.getSummary(),
    refetchInterval: 30000,
  });

  const { data: agingData } = useQuery({
    queryKey: ['analytics-aging'],
    queryFn: () => analyticsService.getAging(),
    refetchInterval: 30000,
  });

  const { data: runsData, isLoading: isRunsLoading } = useQuery({
    queryKey: ['agent-runs'],
    queryFn: () => agentService.getRuns(),
    refetchInterval: 30000,
  });

  const { data: eventsFeed, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events-feed-home'],
    queryFn: () => eventService.getFeed(5),
    refetchInterval: 30000,
  });

  const isLoading = isSummaryLoading || isRunsLoading;

  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  // Calculations
  const actionableQueue = summaryData?.invoiceCount || 0;
  const totalExposure = summaryData?.totalReceivable || 0;
  const totalCollected = summaryData?.totalCollected || 0;
  const recoveryRate = (totalCollected + totalExposure) > 0 
    ? (totalCollected / (totalCollected + totalExposure)) * 100 
    : 0;
  const criticalFlags = summaryData?.totalOverdue || 0;

  // Dispatch Performance Calculations
  const latestRun = runsData?.runs?.[0];
  const lastBatchSent = latestRun ? new Date(latestRun.startTime).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Never';
  const automationYield = latestRun && latestRun.invoicesProcessed > 0 
    ? `${((latestRun.emailsSent / latestRun.invoicesProcessed) * 100).toFixed(1)}%` 
    : (latestRun ? "0.0%" : "N/A");

  const legalEscalationsCount = agingData?.find(d => d.tier === 'legal_escalation')?.count || 0;

  return (
    <div className="space-y-6 text-[#f7f8f8]">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end space-x-2.5">
        <Link
          to="/invoices"
          className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Invoices
        </Link>
        <Link
          to="/agent"
          className="px-3 py-1.5 bg-[#141516] hover:bg-[#18191a] text-[#f7f8f8] border border-[#23252a] hover:border-[#34343a] rounded-md text-xs font-medium transition-colors flex items-center"
        >
          <Bot className="w-3.5 h-3.5 mr-1.5 text-[#5e6ad2]" />
          Run Agent
        </Link>
        <Link
          to="/disputes"
          className="px-3 py-1.5 bg-[#141516] hover:bg-[#18191a] text-[#f7f8f8] border border-[#23252a] hover:border-[#34343a] rounded-md text-xs font-medium transition-colors flex items-center"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
          Disputes
        </Link>
      </div>

      {isSummaryError && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          Failed to load summary metrics: {getErrorMessage(summaryError)}
        </div>
      )}

      {/* Top Metric KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Actionable Queue */}
        <Card className="border border-[#23252a] bg-[#0f1011] hover:border-[#34343a] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Actionable Queue</CardTitle>
            <FileText className="h-4 w-4 text-[#5e6ad2]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#f7f8f8]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /> : actionableQueue}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Total active invoices</p>
          </CardContent>
        </Card>

        {/* Total Exposure */}
        <Card className="border border-[#23252a] bg-[#0f1011] hover:border-[#34343a] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-[#62666d]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#f7f8f8]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /> : formatCurrencyUSD(totalExposure)}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Pending and Overdue</p>
          </CardContent>
        </Card>

        {/* Critical Flags */}
        <Card className="border border-[#23252a] bg-[#0f1011] hover:border-[#34343a] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Critical Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-red-400">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-red-400" /> : formatCurrencyUSD(criticalFlags)}
            </div>
            <p className="text-[11px] text-red-400/80 font-medium mt-1">Overdue Balance</p>
          </CardContent>
        </Card>

        {/* Recovery Rate */}
        <Card className="border border-[#23252a] bg-[#0f1011] hover:border-[#34343a] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#27a644]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#27a644]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#27a644]" /> : formatPercent(recoveryRate)}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Collected vs Total Billed</p>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Operational Main Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Action Required Today */}
        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader className="pb-3 border-b border-[#23252a]/70">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-[#f7f8f8] flex items-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
                  Action Required Today
                </CardTitle>
                <CardDescription className="text-xs text-[#8a8f98] mt-0.5">High-priority operational items requiring review.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#23252a]/50">
            {/* Disputes Action Row */}
            <Link 
              to="/disputes" 
              className="flex items-center justify-between p-4 hover:bg-[#141516] transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors">Customer Disputes & Objections</p>
                  <p className="text-[11px] text-[#8a8f98]">Review inbound customer inquiries and AI response drafts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors" />
            </Link>

            {/* Payment Plans Action Row */}
            <Link 
              to="/payment-plans" 
              className="flex items-center justify-between p-4 hover:bg-[#141516] transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors">Active Payment Plans ({summaryData?.paymentPlanCount || 0})</p>
                  <p className="text-[11px] text-[#8a8f98]">{formatCurrencyUSD(summaryData?.totalPaymentPlan || 0)} structured in workout plans</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors" />
            </Link>

            {/* Legal Escalations Action Row */}
            <Link 
              to="/invoices" 
              className="flex items-center justify-between p-4 hover:bg-[#141516] transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors">Legal Escalations ({legalEscalationsCount})</p>
                  <p className="text-[11px] text-[#8a8f98]">Stage 5 halted invoices requiring manual intervention</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors" />
            </Link>
          </CardContent>
        </Card>

        {/* Right Column: AI Agent Status & Live Activity */}
        <div className="space-y-6">
          {/* Agent Run Status Card */}
          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="pb-3 border-b border-[#23252a]/70">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#f7f8f8] flex items-center">
                  <Bot className="w-4 h-4 text-[#5e6ad2] mr-2" />
                  AI Dunning Agent Status
                </CardTitle>
                <Link to="/agent" className="text-xs font-medium text-[#5e6ad2] hover:text-[#828fff] transition-colors flex items-center">
                  View Agent <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#141516] border border-[#23252a] rounded-md">
                  <p className="text-[11px] text-[#8a8f98] flex items-center justify-center"><Clock className="w-3 h-3 mr-1 text-[#62666d]" /> Last Run</p>
                  <p className="text-xs font-semibold text-[#f7f8f8] mt-1 truncate">{isRunsLoading ? "-" : lastBatchSent}</p>
                </div>
                <div className="p-3 bg-[#141516] border border-[#23252a] rounded-md">
                  <p className="text-[11px] text-[#8a8f98] flex items-center justify-center"><Zap className="w-3 h-3 mr-1 text-[#5e6ad2]" /> Yield</p>
                  <p className="text-xs font-semibold text-[#f7f8f8] mt-1">{isRunsLoading ? "-" : automationYield}</p>
                </div>
                <div className="p-3 bg-[#141516] border border-[#23252a] rounded-md">
                  <p className="text-[11px] text-[#8a8f98] flex items-center justify-center"><TrendingUp className="w-3 h-3 mr-1 text-[#27a644]" /> Processed</p>
                  <p className="text-xs font-semibold text-[#27a644] mt-1">{latestRun?.invoicesProcessed || 0} Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Live Activity Stream Preview */}
          <Card className="border border-[#23252a] bg-[#0f1011]">
            <CardHeader className="pb-3 border-b border-[#23252a]/70">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#f7f8f8] flex items-center">
                  <History className="w-4 h-4 text-[#8a8f98] mr-2" />
                  Recent System Events
                </CardTitle>
                <Link to="/activity-log" className="text-xs font-medium text-[#5e6ad2] hover:text-[#828fff] transition-colors flex items-center">
                  Full Log <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#23252a]/40">
              {isEventsLoading ? (
                <div className="p-6 text-center text-xs text-[#8a8f98] flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-[#5e6ad2] mr-2" /> Loading activity stream...
                </div>
              ) : !eventsFeed || eventsFeed.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8a8f98]">No recent system activity.</div>
              ) : (
                eventsFeed.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="px-4 py-3 flex items-center justify-between text-xs hover:bg-[#141516]/50 transition-colors">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-medium text-[#f7f8f8] truncate">{evt.description || evt.actionType}</p>
                      <p className="text-[11px] text-[#8a8f98] mt-0.5">{new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Source: {evt.source}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-[#141516] border border-[#23252a] text-[#8a8f98] rounded uppercase flex-shrink-0">
                      {evt.actionType.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
