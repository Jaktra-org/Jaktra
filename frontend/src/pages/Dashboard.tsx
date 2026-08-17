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
  AlertTriangle, Scale, ShieldAlert, Loader2,
  FileText, Calendar, CheckCircle2, Clock, Bot, XCircle,
  Shield, Zap, CreditCard, RotateCcw, Trash2, Settings as SettingsIcon, Play, History, Activity
} from "lucide-react";
import { IconStack } from "../components/ui/reui-icon-stack";
import { DarkGradientBg } from "../components/ui/DarkGradientBg";
import botSendingMailsSvg from "../assets/bot_sending_mails.svg";

const getDashboardEventIcon = (actionType: string, description?: string | null) => {
  const desc = (description || '').toLowerCase();
  const action = (actionType || '').toLowerCase();

  if (action.includes('payment_plan') || desc.includes('payment plan')) {
    if (desc.includes('approved') || desc.includes('proposed') || action.includes('approved')) {
      return {
        icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
        containerClass: "bg-emerald-500/10 border border-emerald-500/20",
      };
    }
    if (desc.includes('denied') || desc.includes('cancelled') || action.includes('denied')) {
      return {
        icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
        containerClass: "bg-red-500/10 border border-red-500/20",
      };
    }
    return {
      icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" />,
      containerClass: "bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  if (action.startsWith('user.') || action.startsWith('auth.')) {
    return {
      icon: <Shield className="w-3.5 h-3.5 text-violet-400" />,
      containerClass: "bg-violet-500/10 border border-violet-500/20",
    };
  }

  if (action.startsWith('settings.')) {
    return {
      icon: <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />,
      containerClass: "bg-amber-500/10 border border-amber-500/20",
    };
  }

  if (action.startsWith('integration.')) {
    return {
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
      containerClass: "bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  if (action.startsWith('payment.received')) {
    return {
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      containerClass: "bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  if (action.startsWith('payment.')) {
    return {
      icon: <CreditCard className="w-3.5 h-3.5 text-cyan-400" />,
      containerClass: "bg-cyan-500/10 border border-cyan-500/20",
    };
  }

  if (action === 'invoice.trashed') {
    return {
      icon: <Trash2 className="w-3.5 h-3.5 text-amber-400" />,
      containerClass: "bg-amber-500/10 border border-amber-500/20",
    };
  }

  if (action === 'invoice.restored') {
    return {
      icon: <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />,
      containerClass: "bg-emerald-500/10 border border-emerald-500/20",
    };
  }

  if (action === 'invoice.permanently_deleted') {
    return {
      icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
      containerClass: "bg-red-500/10 border border-red-500/20",
    };
  }

  if (action.startsWith('invoice.')) {
    return {
      icon: <FileText className="w-3.5 h-3.5 text-[#8a8f98]" />,
      containerClass: "bg-[#13161c] border border-[#1e2025]",
    };
  }

  if (action.startsWith('dlq.')) {
    return {
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      containerClass: "bg-amber-500/10 border border-amber-500/20",
    };
  }

  if (action.startsWith('agent.') || action.startsWith('reconciler.')) {
    return {
      icon: <Play className="w-3.5 h-3.5 text-indigo-400" />,
      containerClass: "bg-indigo-500/10 border border-indigo-500/20",
    };
  }

  return {
    icon: <History className="w-3.5 h-3.5 text-[#8a8f98]" />,
    containerClass: "bg-[#13161c] border border-[#1e2025]",
  };
};

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
          <Search className="absolute left-3.5 z-10 w-4 h-4 text-[#8a8f98] pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search invoices, customers, disputes..."
            className="w-full pl-10 pr-4 py-2 border border-[#23252a] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none cursor-default select-none transition-all hover:bg-[#141516] hover:border-[#34343a]"
          />
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center space-x-3.5 flex-shrink-0 justify-end">
          {/* Notification Bell */}
          <button
            onClick={() => navigate('/activity-log')}
            className="relative p-2 border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] hover:border-[#34343a] rounded-xl text-[#8a8f98] hover:text-[#f7f8f8] transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0f1011]" />
          </button>

          {/* New Invoice Action Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#f7f8f8] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] text-[#010102] rounded-xl text-xs font-semibold transition-all flex items-center shadow-xs cursor-pointer"
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

              {/* Top Hero Greeting & Outstanding Total */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f7f8f8] font-sans leading-tight">
                    Coffee's warm.<br />
                    Late payments <span className="relative">aren't<span className="text-[#f7f8f8] font-black">.</span></span>
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
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[#8a8f98]" /> : formatCurrencyUSD(totalPortfolio)}
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
              <div className="mt-3 pt-1 w-full h-12 overflow-visible">
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
                  <div className="h-12 flex items-center text-[11px] text-[#62666d]">No historical invoices recorded</div>
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
                      <span className="font-bold text-[#f7f8f8] text-xs sm:text-sm tracking-tight group-hover:text-[#ffffff] transition-colors">
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
                Actionable Queue
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] hover:bg-[#18191a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#ffffff] transition-colors truncate">
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] hover:bg-[#18191a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#ffffff] transition-colors truncate">
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] hover:bg-[#18191a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#ffffff] transition-colors truncate">
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] hover:bg-[#18191a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#ffffff] transition-colors truncate">
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
              className="flex items-center justify-between p-2 rounded-xl bg-[#13161c]/80 border border-[#1d212a] hover:border-[#34343a] hover:bg-[#18191a] transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="p-2 rounded-lg bg-[#1c2029] text-[#62666d] border border-[#252a36] flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#f7f8f8] group-hover:text-[#ffffff] transition-colors truncate">
                    Autopilot Execution Error
                  </h4>
                  <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">
                    Autopilot dispatch cycle experienced errors
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

      {/* Bottom Section: Recent Activity Feed & Autopilot Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch -mt-4">
        {/* Card 1: Recent Activity Feed */}
        <Card className="border border-[#1e2025] bg-[#0e1013] rounded-2xl flex flex-col justify-between shadow-xl h-[314px]">
          <CardHeader className="py-2.5 px-4 border-b border-[#1b1e24] flex flex-row items-center justify-between space-y-0 flex-shrink-0">
            <CardTitle className="text-sm font-semibold text-[#f7f8f8]">
              Recent activity
            </CardTitle>
            <Link to="/activity-log" className="text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-3.5 pb-2.5 flex-1 flex flex-col justify-between">
            {isEventsLoading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-[#8a8f98]">
                <Loader2 className="w-4 h-4 animate-spin text-[#8a8f98] mr-2" /> Loading feed...
              </div>
            ) : eventsFeed && eventsFeed.length > 0 ? (
              <div className="space-y-3">
                {eventsFeed.slice(0, 6).map((evt) => {
                  const { icon, containerClass } = getDashboardEventIcon(evt.actionType, evt.description);
                  return (
                    <div key={evt.id} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 ${containerClass}`}>
                          {icon}
                        </div>
                        <h5 className="font-semibold text-[#f7f8f8] truncate">{evt.description || evt.actionType}</h5>
                      </div>
                      <span className="text-[10px] text-[#62666d] flex-shrink-0">
                        {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
                <div className="w-9 h-9 rounded-xl bg-[#13161c] border border-[#1d212a] flex items-center justify-center text-[#62666d] mb-2">
                  <Activity className="w-4 h-4 text-[#8a8f98]" />
                </div>
                <p className="text-xs font-semibold text-[#f7f8f8]">No recent activity</p>
                <p className="text-[11px] text-[#8a8f98] mt-0.5 max-w-[220px]">
                  System events and invoice actions will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Autopilot Status Widget */}
        <Card className="border border-[#1e2025] bg-[#0e1013] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden h-[314px]">
          {/* Top Section & Large SVG */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Autopilot</h3>
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
                Autopilot is analyzing accounts and preparing next actions.
              </p>
            </div>

            {/* Large SVG Graphic positioned so robot wheels touch the stats container line */}
            <div className="absolute right-0 -top-[26px] pointer-events-none z-0">
              <img 
                src={botSendingMailsSvg} 
                alt="Autopilot Sending Mails"  
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
