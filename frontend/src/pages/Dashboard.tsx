import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { analyticsService } from "../services/analytics";
import { agentService } from "../services/agent";
import { eventService } from "../services/event";
import { formatCurrencyUSD } from "../utils/format";
import { 
  FileText, DollarSign, Loader2, Clock, Zap, AlertCircle, 
  ChevronRight, Plus, AlertTriangle, History, Search, MessageSquare,
  Bot, TrendingUp
} from "lucide-react";
import { getErrorMessage } from "../utils/error-utils";
import { CreateInvoiceModal } from "../components/invoices/CreateInvoiceModal";

import { disputeService } from "../services/dispute";
import { invoiceService } from "../services/invoice";

export function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    queryFn: () => eventService.getFeed(10),
    refetchInterval: 30000,
  });

  const { data: pendingDisputesData } = useQuery({
    queryKey: ['pending-disputes-home'],
    queryFn: () => disputeService.getDisputes({ status: 'pending', classification: 'dispute', limit: 1 }),
    refetchInterval: 30000,
  });

  const isLoading = isSummaryLoading || isRunsLoading;

  // Calculations
  const actionableQueue = summaryData?.invoiceCount || 0;
  const totalExposure = summaryData?.totalReceivable || 0;
  const criticalFlags = summaryData?.totalOverdue || 0;

  // Dispatch Performance Calculations
  const latestRun = runsData?.runs?.[0];
  const lastBatchSent = latestRun ? new Date(latestRun.startTime).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Never';
  const automationYield = latestRun && latestRun.invoicesProcessed > 0 
    ? `${((latestRun.emailsSent / latestRun.invoicesProcessed) * 100).toFixed(1)}%` 
    : (latestRun ? "0.0%" : "N/A");

  const { data: legalInvoicesData } = useQuery({
    queryKey: ['legal-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ days_overdue_min: 31, limit: 1 }),
    refetchInterval: 30000,
  });

  const { data: highValueInvoicesData } = useQuery({
    queryKey: ['high-value-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ min_amount: 10000, days_overdue_min: 15, limit: 1 }),
    refetchInterval: 30000,
  });

  const { data: paymentPlanInvoicesData } = useQuery({
    queryKey: ['payment-plan-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ has_payment_plan: true, days_overdue_min: 1, limit: 1 }),
    refetchInterval: 30000,
  });

  const { data: allInvoicesSample } = useQuery({
    queryKey: ['all-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ limit: 100 }),
    refetchInterval: 30000,
  });

  const legalEscalationsCount = legalInvoicesData?.pagination?.total ?? (agingData?.find(d => d.tier === 'legal_escalation')?.count || 0);
  const brokenWorkoutCount = paymentPlanInvoicesData?.pagination?.total || 0;
  const highExposureCount = highValueInvoicesData?.pagination?.total || 0;
  const missingEmailCount = allInvoicesSample?.data?.filter(inv => !inv.contactEmail || inv.contactEmail.trim() === '')?.length || 0;
  const pendingDisputesCount = pendingDisputesData?.pagination?.total || 0;
  const agentHasError = Boolean(latestRun && (latestRun.errors > 0 || latestRun.status === 'failed'));

  const totalActiveWarnings = legalEscalationsCount + brokenWorkoutCount + highExposureCount + missingEmailCount + pendingDisputesCount + (agentHasError ? 1 : 0);

  return (
    <div className="space-y-6 text-[#f7f8f8]">
      {/* Top Bar with Search & Quick Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Sleek Non-Functional Global Search Bar */}
        <div className="relative flex items-center w-full sm:w-80">
          <Search className="absolute left-3 w-3.5 h-3.5 text-[#8a8f98] pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search invoices, customers..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#23252a] bg-[#0f1011] rounded-md text-xs text-[#8a8f98] placeholder-[#62666d] focus:outline-none cursor-default select-none shadow-sm"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Invoices
          </button>
        </div>
      </div>

      {isSummaryError && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          Failed to load summary metrics: {getErrorMessage(summaryError)}
        </div>
      )}

      {/* Top Metric KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      {/* 2-Row Operational Main Section */}
      <div className="space-y-6">
        {/* Row 1: Top Row */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Top Left: Empty Space Placeholder for future component */}
          <div className="hidden lg:block" />

          {/* Top Right: AI Dunning Agent Status */}
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
        </div>

        {/* Row 2: Bottom Row (Actionable Queue & Recent System Events - Equal Height stretch) */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Bottom Left: Operational Warnings Box (Actionable Queue with all available chips) */}
          <Card className="border border-[#23252a] bg-[#0f1011] flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#23252a]/70 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#f7f8f8] flex items-center">
                  <AlertCircle className="w-4 h-4 text-amber-400 mr-2" />
                  Actionable Queue
                </CardTitle>
                <span className="text-xs font-semibold text-[#8a8f98]">
                  {totalActiveWarnings} Active {totalActiveWarnings === 1 ? 'Action' : 'Actions'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-start max-h-[300px] overflow-y-auto thin-scrollbar">
              <div className="divide-y divide-[#23252a]/40 flex-shrink-0">
                {/* 1. Legal Escalations */}
                <Link 
                  to="/invoices?aging_bucket=30_plus" 
                  className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      legalEscalationsCount > 0 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-[#141516] border-[#23252a] text-[#62666d]'
                    }`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold transition-colors truncate ${
                          legalEscalationsCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#8a8f98]'
                        }`}>
                          Legal Escalations
                        </p>
                        {legalEscalationsCount > 0 ? (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            Action Required
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[9px] font-medium rounded-full flex-shrink-0">
                            0 Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">Overdue invoices requiring manual review</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold transition-colors ${
                      legalEscalationsCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#62666d]'
                    }`}>
                      {legalEscalationsCount}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0" />
                  </div>
                </Link>

                {/* 2. Broken Workout Schedule */}
                <Link 
                  to="/invoices?has_payment_plan=true&status=Overdue&days_overdue_min=1" 
                  className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      brokenWorkoutCount > 0 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-[#141516] border-[#23252a] text-[#62666d]'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold transition-colors truncate ${
                          brokenWorkoutCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#8a8f98]'
                        }`}>
                          Broken Workout Schedule
                        </p>
                        {brokenWorkoutCount > 0 ? (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            Action Required
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[9px] font-medium rounded-full flex-shrink-0">
                            0 Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">Customer missed scheduled payment plan installment</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold transition-colors ${
                      brokenWorkoutCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#62666d]'
                    }`}>
                      {brokenWorkoutCount}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0" />
                  </div>
                </Link>

                {/* 3. High Exposure Risk Alert */}
                <Link 
                  to="/invoices?min_amount=10000&aging_bucket=15_30" 
                  className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      highExposureCount > 0 
                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                        : 'bg-[#141516] border-[#23252a] text-[#62666d]'
                    }`}>
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold transition-colors truncate ${
                          highExposureCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#8a8f98]'
                        }`}>
                          High Exposure Risk Alert
                        </p>
                        {highExposureCount > 0 ? (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            High Risk
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[9px] font-medium rounded-full flex-shrink-0">
                            0 Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">Single account exposure exceeds $10k threshold and 15+ days overdue</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold transition-colors ${
                      highExposureCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#62666d]'
                    }`}>
                      {highExposureCount}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0" />
                  </div>
                </Link>

                {/* 4. Missing Contact Information */}
                <Link 
                  to="/invoices" 
                  className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      missingEmailCount > 0 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-[#141516] border-[#23252a] text-[#62666d]'
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold transition-colors truncate ${
                          missingEmailCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#8a8f98]'
                        }`}>
                          Missing Contact Information
                        </p>
                        {missingEmailCount > 0 ? (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            Fix Needed
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[9px] font-medium rounded-full flex-shrink-0">
                            0 Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">Invoices missing contact email for automated outreach</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold transition-colors ${
                      missingEmailCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#62666d]'
                    }`}>
                      {missingEmailCount}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0" />
                  </div>
                </Link>

                {/* 5. Pending Disputes / Objections */}
                <Link 
                  to="/disputes?status=pending&category=dispute" 
                  className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`h-6 w-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      pendingDisputesCount > 0 
                        ? 'bg-[#5e6ad2]/10 border-[#5e6ad2]/20 text-[#5e6ad2]' 
                        : 'bg-[#141516] border-[#23252a] text-[#62666d]'
                    }`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold transition-colors truncate ${
                          pendingDisputesCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#8a8f98]'
                        }`}>
                          Pending Objections
                        </p>
                        {pendingDisputesCount > 0 ? (
                          <span className="px-1.5 py-0.2 bg-[#5e6ad2]/20 text-[#828fff] border border-[#5e6ad2]/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            Pending Approval
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 text-[9px] font-medium rounded-full flex-shrink-0">
                            0 Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#62666d] truncate mt-0.5">Customer dispute inquiries awaiting approval</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-semibold transition-colors ${
                      pendingDisputesCount > 0 ? 'text-[#f7f8f8] group-hover:text-[#5e6ad2]' : 'text-[#62666d]'
                    }`}>
                      {pendingDisputesCount}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0" />
                  </div>
                </Link>

                {/* 6. Agent Execution Error (Only shown if active error exists) */}
                {agentHasError && (
                  <Link 
                    to="/agent" 
                    className="flex items-center justify-between py-2 px-3 hover:bg-[#141516] transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="h-6 w-6 rounded border bg-red-500/10 border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                            Agent Execution Error
                          </p>
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold rounded-full flex-shrink-0">
                            System Alert
                          </span>
                        </div>
                        <p className="text-[11px] text-[#62666d] truncate mt-0.5">AI Agent dispatch cycle experienced errors</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                      <span className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors">
                        1
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:text-[#f7f8f8] transition-colors flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                )}
              </div>

              {/* Flex spacer leaving any remaining card height empty at bottom */}
              <div className="flex-1" />
            </CardContent>
          </Card>

          {/* Bottom Right: Recent Live Activity Stream Preview */}
          <Card className="border border-[#23252a] bg-[#0f1011] flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#23252a]/70 flex-shrink-0">
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
            <CardContent className="p-0 divide-y divide-[#23252a]/40 flex-1 max-h-[210px] overflow-y-auto thin-scrollbar">
              {isEventsLoading ? (
                <div className="p-6 text-center text-xs text-[#8a8f98] flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-[#5e6ad2] mr-2" /> Loading activity stream...
                </div>
              ) : !eventsFeed || eventsFeed.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8a8f98]">No recent system activity.</div>
              ) : (
                eventsFeed.slice(0, 10).map((evt) => (
                  <div key={evt.id} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#141516]/50 transition-colors">
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

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
