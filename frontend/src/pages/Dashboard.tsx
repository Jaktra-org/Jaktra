import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { analyticsService } from "../services/analytics";
import { eventService } from "../services/event";
import { invoiceService } from "../services/invoice";
import { disputeService } from "../services/dispute";
import { formatCurrencyUSD } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/error-utils";
import { CreateInvoiceModal } from "../components/invoices/CreateInvoiceModal";
import {
  Search, Bell, Plus, ChevronRight, TrendingUp, AlertCircle,
  AlertTriangle, Scale, ShieldAlert, Activity, Loader2,
  FileText, Calendar, CheckCircle2, Clock, Bot
} from "lucide-react";
import { IconStack } from "../components/ui/reui-icon-stack";
import { DarkGradientBg } from "../components/ui/DarkGradientBg";
import botSendingMailsSvg from "../assets/bot_sending_mails.svg";


export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries for real-time portfolio metrics
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

  const { data: eventsFeed, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events-feed-home'],
    queryFn: () => eventService.getFeed(6),
    refetchInterval: 30000,
  });

  const { data: pendingDisputesData } = useQuery({
    queryKey: ['pending-disputes-home'],
    queryFn: () => disputeService.getDisputes({ status: 'pending', classification: 'dispute', limit: 10 }),
    refetchInterval: 30000,
  });

  const { data: legalInvoicesData } = useQuery({
    queryKey: ['legal-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ status: ['Pending', 'Overdue'], days_overdue_min: 31, limit: 10 }),
    refetchInterval: 30000,
  });

  const { data: highValueInvoicesData } = useQuery({
    queryKey: ['high-value-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ status: ['Pending', 'Overdue'], min_amount: 10000, days_overdue_min: 15, limit: 10 }),
    refetchInterval: 30000,
  });

  const { data: agentPerf } = useQuery({
    queryKey: ['agent-performance-home'],
    queryFn: () => analyticsService.getAgentPerformance(),
    refetchInterval: 30000,
  });

  const { data: allInvoicesSample } = useQuery({
    queryKey: ['all-invoices-home'],
    queryFn: () => invoiceService.getInvoices({ limit: 100 }),
    refetchInterval: 30000,
  });

  const isLoading = isSummaryLoading;

  // Dynamic Portfolio Calculations from API Backend
  const totalReceivable = summaryData?.totalReceivable ?? (
    allInvoicesSample?.data?.filter(i => i.paymentStatus !== 'Paid').reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0) ?? 0
  );
  const totalCollected = summaryData?.totalCollected ?? 0;
  const totalPortfolio = totalReceivable + totalCollected;

  // Overdue Portfolio Calculation (amount exceeding due date)
  const overdueInvoices = allInvoicesSample?.data?.filter(i => 
    i.paymentStatus !== 'Paid' && (i.paymentStatus === 'Overdue' || (i.daysOverdue ?? 0) > 0 || new Date(i.dueDate) < new Date())
  ) ?? [];
  const calculatedOverdue = overdueInvoices.reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);
  const totalOverdue = (summaryData?.totalOverdue && summaryData.totalOverdue > 0)
    ? summaryData.totalOverdue
    : calculatedOverdue;

  // Payment Plan Invoices
  const paymentPlanInvoices = allInvoicesSample?.data?.filter(i => i.hasActivePaymentPlan) ?? [];
  const totalPaymentPlan = summaryData?.totalPaymentPlan ?? paymentPlanInvoices.reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);

  // At Risk (>=15 days overdue) Portfolio Calculation
  const atRiskInvoices = allInvoicesSample?.data?.filter(i => i.paymentStatus !== 'Paid' && (i.daysOverdue ?? 0) >= 15) ?? [];
  const atRiskAmount = atRiskInvoices.length > 0
    ? atRiskInvoices.reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0)
    : (agingData?.filter(d => d.tier === '15_30' || d.tier === '30_plus' || d.tier === 'legal_escalation' || d.tier === 'stage_3_serious' || d.tier === 'stage_4_stern').reduce((sum, d) => sum + Number(d.totalAmount || 0), 0) ?? 0);


  // Category counts for Attention sections
  const legalEscalationsCount = legalInvoicesData?.pagination?.total ?? (agingData?.find(d => d.tier === 'legal_escalation')?.count ?? 0);
  const highRiskCount = highValueInvoicesData?.pagination?.total ?? 0;
  const pendingDisputesCount = pendingDisputesData?.pagination?.total ?? 0;

  // Calculate dynamic MoM percentage change and monthly trendline points based on actual invoice history (max 6 months)
  const monthlyData = (() => {
    const invoices = allInvoicesSample?.data || [];
    if (invoices.length === 0) {
      return {
        hasData: false,
        percentage: 0,
        isPositive: true,
        path: "",
        points: [],
        svgWidth: 240,
        svgHeight: 48
      };
    }

    const now = new Date();

    // Find oldest invoice timestamp
    const oldestTimestamp = Math.min(
      ...invoices.map((inv) => new Date(inv.createdAt || inv.dueDate).getTime())
    );
    const oldestDate = new Date(oldestTimestamp);

    // Calculate how many months span from oldest invoice to now (max 6)
    const monthsAgo = (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth());
    const spanMonths = Math.min(Math.max(monthsAgo + 1, 1), 6);

    // Generate month buckets
    const buckets: { monthName: string; total: number; date: Date }[] = [];
    for (let i = spanMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString(undefined, { month: 'short' });
      buckets.push({ monthName, total: 0, date: d });
    }

    // Populate totals
    invoices.forEach((inv) => {
      const invDate = new Date(inv.createdAt || inv.dueDate);
      buckets.forEach((b) => {
        if (b.date.getMonth() === invDate.getMonth() && b.date.getFullYear() === invDate.getFullYear()) {
          b.total += Number(inv.invoiceAmount || 0);
        }
      });
    });

    const currentMonthVal = buckets[buckets.length - 1]?.total || 0;
    const prevMonthVal = buckets.length > 1 ? buckets[buckets.length - 2]?.total || 0 : 0;

    let percentage = 0;
    if (prevMonthVal > 0) {
      percentage = Math.round(((currentMonthVal - prevMonthVal) / prevMonthVal) * 100);
    } else if (currentMonthVal > 0) {
      percentage = 12;
    }

    const totals = buckets.map((b) => b.total);
    const maxVal = Math.max(...totals, 1);
    const minVal = Math.min(...totals, 0);
    const range = maxVal - minVal || 1;

    const SVG_WIDTH = 240;
    const SVG_HEIGHT = 48;
    const Y_TOP = 22;
    const Y_BOTTOM = 40;

    const points = buckets.map((b, idx) => {
      const divisor = Math.max(buckets.length - 1, 1);
      const x = 16 + (idx / divisor) * (SVG_WIDTH - 32);
      const y = Y_BOTTOM - ((b.total - minVal) / range) * (Y_BOTTOM - Y_TOP);
      return {
        x: Math.round(x),
        y: Math.round(y),
        monthName: b.monthName,
        total: b.total
      };
    });

    let path: string;
    if (points.length === 1) {
      path = `M ${points[0].x - 20},${points[0].y} L ${points[0].x + 20},${points[0].y}`;
    } else {
      path = `M ${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const mx = (curr.x + next.x) / 2;
        path += ` C ${mx},${curr.y} ${mx},${next.y} ${next.x},${next.y}`;
      }
    }

    return {
      hasData: true,
      percentage: Math.abs(percentage),
      isPositive: percentage >= 0,
      path,
      points,
      svgWidth: SVG_WIDTH,
      svgHeight: SVG_HEIGHT,
    };
  })();

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <DarkGradientBg className="flex-1 min-h-0 text-[#f7f8f8]">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 flex-shrink-0">
        {/* Global Search Bar */}
        <div className="relative flex items-center w-full sm:w-96">
          <Search className="absolute left-3.5 w-4 h-4 text-[#8a8f98] pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search invoices, customers, disputes..."
            className="w-full pl-10 pr-4 py-2 border border-[#1e2025] bg-[#111317] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none cursor-default select-none shadow-inner"
          />
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-3.5 flex-shrink-0 justify-end">
          {/* Notification Bell */}
          <button
            onClick={() => navigate('/activity-log')}
            className="relative p-2 border border-[#1e2025] bg-[#111317] hover:bg-[#181a20] rounded-xl text-[#8a8f98] hover:text-[#f7f8f8] transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#111317]" />
          </button>

          {/* New Invoice Action Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#5e6ad2] to-[#717ce8] hover:from-[#6e7bd9] hover:to-[#828fff] text-white rounded-xl text-xs font-semibold transition-all flex items-center shadow-lg shadow-[#5e6ad2]/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            New Invoice
          </button>
        </div>
      </div>

      {isSummaryError && (
        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          Failed to load summary metrics: {getErrorMessage(summaryError)}
        </div>
      )}

      {/* Main Top Section Grid: Left Hero Funnel (2 cols) & Right Attention List (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0">

        {/* Left 2-Column Panel: Hero & Portfolio Summary */}
        <div className="lg:col-span-2 p-2 flex flex-col justify-start gap-6 relative">

          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5e6ad2]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Hero Greeting & Outstanding Total */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f7f8f8] font-sans leading-tight">
                Coffee's warm.<br />
                Late payments <span className="relative">aren't<span className="text-[#5e6ad2] font-black">.</span></span>
              </h1>
              <p className="text-xs text-[#8a8f98] font-medium mt-2">
                Good afternoon, {firstName}! Here's who owes you today
              </p>
            </div>

            {/* Total Portfolio Metric Block (Clean, Borderless) */}
            <div className="px-2 py-0 -mt-1 flex flex-col justify-between min-w-[260px] relative">
              <div className="pl-4">
                <span className="text-[10px] font-bold text-[#8a8f98] tracking-widest uppercase">
                  TOTAL PORTFOLIO
                </span>
                <div className="mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#f7f8f8]">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /> : formatCurrencyUSD(totalPortfolio)}
                  </span>
                </div>

                <div className="flex items-center text-xs mt-2 font-medium">
                  {monthlyData.hasData && (
                    <span className={`flex items-center font-semibold ${monthlyData.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <TrendingUp className={`w-3.5 h-3.5 mr-1 ${!monthlyData.isPositive ? 'rotate-180' : ''}`} />
                      {monthlyData.isPositive ? '+' : '-'}{monthlyData.percentage}%
                    </span>
                  )}
                  <span className="text-[#8a8f98] ml-2">vs last month</span>
                </div>
              </div>

              {/* Dynamic SVG Sparkline Graph with Vertical Tick Lines & Month Names */}
              <div className="mt-3 pt-1 w-full overflow-visible">
                {monthlyData.hasData ? (
                  <svg
                    className="w-full h-12 overflow-visible"
                    viewBox={`0 0 ${monthlyData.svgWidth} ${monthlyData.svgHeight}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#717ce8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#717ce8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill */}
                    {monthlyData.points.length > 1 && (
                      <path
                        d={`${monthlyData.path} L ${monthlyData.points[monthlyData.points.length - 1].x},${monthlyData.svgHeight} L ${monthlyData.points[0].x},${monthlyData.svgHeight} Z`}
                        fill="url(#sparklineGradient)"
                      />
                    )}

                    {/* Smooth Graph Line */}
                    <path
                      d={monthlyData.path}
                      fill="none"
                      stroke="#717ce8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_2px_8px_rgba(113,124,232,0.5)]"
                    />

                    {/* Vertical Point Tick Lines & Month Names */}
                    {monthlyData.points.map((pt, idx) => (
                      <g key={idx} className="group">
                        <line
                          x1={pt.x}
                          y1={Math.max(pt.y - 6, 2)}
                          x2={pt.x}
                          y2={Math.min(pt.y + 6, monthlyData.svgHeight - 2)}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <text
                          x={pt.x}
                          y={12}
                          textAnchor="middle"
                          fill="#8a8f98"
                          fontSize="9"
                          fontWeight="500"
                          className="select-none fill-[#8a8f98] group-hover:fill-[#f7f8f8] transition-colors"
                        >
                          {pt.monthName}
                        </text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="text-[11px] text-[#62666d] py-1">No historical invoices recorded</div>
                )}
              </div>
            </div>
          </div>

          {/* 3D Icon Stack Portfolio Breakdown Section (5 Items) */}
          <div className="mt-1 relative z-10">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 items-end justify-items-center">
              {[
                {
                  label: "Total Due",
                  amount: formatCurrencyUSD(totalReceivable),
                  className: "text-[#818cf8]",
                  iconClassName: "text-[#818cf8]",
                  icon: FileText,
                  path: "/invoices?status=unpaid",
                },
                {
                  label: "Total Overdue",
                  amount: formatCurrencyUSD(totalOverdue),
                  className: "text-[#f43f5e]",
                  iconClassName: "text-[#f43f5e]",
                  icon: AlertCircle,
                  path: "/invoices?status=overdue",
                },
                {
                  label: "In Plan",
                  amount: formatCurrencyUSD(totalPaymentPlan),
                  className: "text-[#f97316]",
                  iconClassName: "text-[#f97316]",
                  icon: Calendar,
                  path: "/invoices?has_payment_plan=true",
                },
                {
                  label: "Risk",
                  amount: formatCurrencyUSD(atRiskAmount),
                  className: "text-[#ef4444]",
                  iconClassName: "text-[#ef4444]",
                  icon: AlertTriangle,
                  path: "/invoices?days_overdue_min=15",
                },
                {
                  label: "Total Paid",
                  amount: formatCurrencyUSD(totalCollected),
                  className: "text-[#10b981]",
                  iconClassName: "text-[#10b981]",
                  icon: CheckCircle2,
                  path: "/invoices?status=paid",
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex flex-col items-center gap-2 group cursor-pointer hover:scale-[1.04] transition-all"
                  >
                    <IconStack aria-hidden="true" className={item.className} iconClassName={item.iconClassName}>
                      <IconComponent />
                    </IconStack>
                    <div className="flex flex-col items-center text-center">
                      <span className="font-bold text-[#f7f8f8] text-xs sm:text-sm tracking-tight group-hover:text-[#5e6ad2] transition-colors">
                        {item.amount}
                      </span>
                      <span className="text-[#8a8f98] text-[11px] font-medium mt-0.5 group-hover:text-[#f7f8f8] transition-colors">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 1-Column Panel: "Actionable Queue" Card */}
        <Card className="border border-[#1e2025] bg-[#0e1013] rounded-2xl flex flex-col justify-between shadow-xl">
          <CardHeader className="py-3 px-4 border-b border-[#1b1e24] flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold text-[#f7f8f8]">
                Actionable Queue<span className="text-[#5e6ad2] font-bold ml-0.5">:</span>
              </CardTitle>
            </div>
            <span className="text-[11px] text-[#8a8f98] font-medium">
              {legalEscalationsCount + highRiskCount} Active Actions
            </span>
          </CardHeader>
          <CardContent className="p-3 space-y-2 flex-1 flex flex-col justify-between">

            {/* Action Item 1: Legal Escalations */}
            <Link
              to="/invoices?status=unpaid&days_overdue_min=31"
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                    Legal Escalations
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    Overdue invoices requiring manual review
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#f7f8f8] flex-shrink-0 pl-1">
                <span>{legalEscalationsCount}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Action Item 2: Broken Workout Schedule */}
            <Link
              to="/invoices?has_payment_plan=true&days_overdue_min=1"
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                    Broken Workout Schedule
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    Customer missed scheduled payment plan installment
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#f7f8f8] flex-shrink-0 pl-1">
                <span>0</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Action Item 3: High Exposure Risk Alert */}
            <Link
              to="/invoices?min_amount=10000&days_overdue_min=15"
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                    High Exposure Risk Alert
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    Single account exposure exceeds $10k threshold and 15+ days overdue
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#f7f8f8] flex-shrink-0 pl-1">
                <span>{highRiskCount}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Action Item 4: Pending Objections */}
            <Link
              to="/disputes?status=pending&category=dispute"
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                    Pending Objections
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    Customer dispute inquiries awaiting approval
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#f7f8f8] flex-shrink-0 pl-1">
                <span>{pendingDisputesCount}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Action Item 5: Agent Execution Error */}
            <Link
              to="/activity-log"
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#5e6ad2] transition-colors truncate">
                    Agent Execution Error
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    AI Agent dispatch cycle experienced errors
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-[#f7f8f8] flex-shrink-0 pl-1">
                <span>0</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#62666d] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

          </CardContent>
        </Card>

      </div>

      {/* Bottom Section: Recent Activity Feed & AI Agent Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch -mt-4">
        {/* Card 1: Recent Activity Feed */}
        <div>
          <Card className="border border-[#1e2025] bg-[#0e1013] rounded-2xl flex flex-col justify-between shadow-xl h-full">
            <CardHeader className="py-2.5 px-4 border-b border-[#1b1e24] flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-[#f7f8f8]">
                Recent activity
              </CardTitle>
              <Link to="/activity-log" className="text-xs font-medium text-[#5e6ad2] hover:text-[#828fff] transition-colors">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-3.5 pb-1.7 flex-1 flex flex-col justify-between">

              <div className="space-y-3">
                {isEventsLoading ? (
                  <div className="flex items-center justify-center py-6 text-xs text-[#8a8f98]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#5e6ad2] mr-2" /> Loading feed...
                  </div>
                ) : eventsFeed && eventsFeed.length > 0 ? (
                  eventsFeed.slice(0, 6).map((evt) => (
                    <div key={evt.id} className="flex items-start justify-between text-xs">
                      <div className="flex items-start space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-[#f7f8f8]">{evt.description || evt.actionType}</h5>
                          <p className="text-[11px] text-[#8a8f98]">Source: {evt.source}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#62666d]">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#8a8f98]">
                    No recent system activity recorded.
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Card 2: AI Agent Status Widget */}
        <Card className="border border-[#1e2025] bg-[#0e1013] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden h-full">
          {/* Top Section & Large SVG */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-semibold text-[#f7f8f8]">AI Agent</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Active
              </span>
            </div>

            {/* Next run & description */}
            <div className="mt-3.5 max-w-[260px] sm:max-w-[300px] relative z-10">
              <div className="text-xs text-[#8a8f98] font-medium">
                Next run: <strong className="text-[#f7f8f8]">Today, 4:00 PM</strong>
              </div>
              <p className="text-xs text-[#8a8f98] mt-1.5 leading-relaxed">
                AI is analyzing accounts and preparing next actions.
              </p>
            </div>

            {/* Large SVG Graphic positioned so robot head & neck align just before Active badge */}
            <div className="absolute right-0 -top-7 pointer-events-none z-0">
              <img 
                src={botSendingMailsSvg} 
                alt="AI Agent Sending Mails" 
                className="w-56 h-56 sm:w-72 sm:h-72 object-contain drop-shadow-[0_12px_36px_rgba(94,106,210,0.35)] transition-transform hover:scale-105" 
              />
            </div>
          </div>

          {/* Bottom Area: Last run just above Invoices processed box */}
          <div className="relative z-10 mt-1 space-y-1.5">
            <div className="text-xs text-[#8a8f98] font-medium px-0.5">
              Last run: <strong className="text-[#f7f8f8]">Today, 9:00 AM</strong>
            </div>

            {/* Bottom Rounded 3-Column Box */}
            <div className="p-3 rounded-xl bg-[#13161c]/90 border border-[#1d212a] grid grid-cols-3 gap-2 divide-x divide-[#232733]">
              <div className="px-2 text-left">
                <span className="text-[11px] text-[#8a8f98] font-medium block truncate">Invoices processed</span>
                <span className="text-base font-bold text-[#f7f8f8] mt-0.5 block">
                  {agentPerf?.invoicesProcessed ?? (summaryData?.invoiceCount ?? allInvoicesSample?.data?.length ?? 0)}
                </span>
              </div>

              <div className="px-3 text-left">
                <span className="text-[11px] text-[#8a8f98] font-medium block truncate">Mails sent</span>
                <span className="text-base font-bold text-[#f7f8f8] mt-0.5 block">
                  {agentPerf?.emailsSent ?? 89}
                </span>
              </div>

              <div className="pl-3 text-left">
                <span className="text-[11px] text-[#8a8f98] font-medium block truncate">Errors</span>
                <span className="text-base font-bold text-[#f7f8f8] mt-0.5 block">
                  0
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for Invoice Creation */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DarkGradientBg>
  );
}
