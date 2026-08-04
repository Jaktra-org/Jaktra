import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { analyticsService } from "../services/analytics";
import { agentService } from "../services/agent";
import { formatCurrencyUSD } from "../utils/format";
import { AlertCircle, FileText, TrendingUp, DollarSign, Loader2, PieChart as PieChartIcon, BarChart3, Clock, Zap, AlertTriangle } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";

import { getErrorMessage } from "../utils/error-utils";

export function Dashboard() {
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsService.getSummary(),
    refetchInterval: 30000,
  });

  const { data: agingData, isLoading: isAgingLoading, isError: isAgingError, error: agingError } = useQuery({
    queryKey: ['analytics-aging'],
    queryFn: () => analyticsService.getAging(),
    refetchInterval: 30000,
  });

  const { data: runsData, isLoading: isRunsLoading, isError: isRunsError } = useQuery({
    queryKey: ['agent-runs'],
    queryFn: () => agentService.getRuns(),
    refetchInterval: 30000,
  });

  const isLoading = isSummaryLoading || isAgingLoading || isRunsLoading;
  const isError = isSummaryError || isAgingError || isRunsError;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatPercent = (val: number) => 
    `${val.toFixed(1)}%`;

  // Calculations
  const actionableQueue = summaryData?.invoiceCount || 0;
  const totalExposure = summaryData?.totalReceivable || 0;
  
  const totalCollected = summaryData?.totalCollected || 0;
  const recoveryRate = (totalCollected + totalExposure) > 0 
    ? (totalCollected / (totalCollected + totalExposure)) * 100 
    : 0;
    
  const criticalFlags = summaryData?.totalOverdue || 0;

  // Portfolio Mix Data
  const portfolioData = [
    { name: 'Collected', value: totalCollected, color: '#27a644' }, // Linear success green
    { name: 'Pending', value: Math.max(0, totalExposure - criticalFlags), color: '#5e6ad2' }, // Linear primary lavender
    { name: 'Overdue', value: criticalFlags, color: '#eb5757' } // Linear red
  ].filter(d => d.value > 0);

  // Aging Pipeline Data
  const tierConfig: Record<string, { label: string, color: string }> = {
    stage_1_warm: { label: 'Warm (Stage 1)', color: '#5e6ad2' },
    stage_2_firm: { label: 'Firm (Stage 2)', color: '#828fff' },
    stage_3_serious: { label: 'Serious (Stage 3)', color: '#f59e0b' },
    stage_4_stern: { label: 'Stern (Stage 4)', color: '#eb5757' },
    legal_escalation: { label: 'Legal Escalation', color: '#991b1b' },
  };

  const agingChartData = (agingData || []).map(d => ({
    name: tierConfig[d.tier]?.label || d.tier,
    value: d.totalAmount,
    fill: tierConfig[d.tier]?.color || '#3e3e44'
  }));

  // Dispatch Performance Calculations
  const latestRun = runsData?.runs?.[0];
  const lastBatchSent = latestRun ? new Date(latestRun.startTime).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Never';
  const automationYield = latestRun && latestRun.invoicesProcessed > 0 
    ? `${((latestRun.emailsSent / latestRun.invoicesProcessed) * 100).toFixed(1)}%` 
    : (latestRun ? "0.0%" : "N/A");

  const stage5Halted = agingData?.find(d => d.tier === 'legal_escalation')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">Dashboard</h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">Overview of your collection pipeline.</p>
        </div>
        
        {isLoading && (
          <div className="flex items-center text-xs text-[#8a8f98] mt-2 md:mt-0">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-[#5e6ad2]" />
            Syncing data...
          </div>
        )}
        
        {isError && (
          <div className="text-xs text-red-400 mt-2 md:mt-0">
            Failed to load analytics data.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Actionable Queue */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Actionable Queue</CardTitle>
            <FileText className="h-4 w-4 text-[#62666d]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-[#f7f8f8]">
              {isLoading ? "-" : actionableQueue}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Total active invoices</p>
          </CardContent>
        </Card>

        {/* Total Exposure */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-[#62666d]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-[#f7f8f8]">
              {isLoading ? "-" : formatCurrency(totalExposure)}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Pending and Overdue</p>
          </CardContent>
        </Card>

        {/* Recovery Rate */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#27a644]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-[#f7f8f8]">
              {isLoading ? "-" : formatPercent(recoveryRate)}
            </div>
            <p className="text-[11px] text-[#8a8f98] mt-1">Collected vs Total Billed</p>
          </CardContent>
        </Card>

        {/* Payment Plans Metric */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Payment Plans</CardTitle>
            <Clock className="h-4 w-4 text-[#5e6ad2]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-[#f7f8f8]">
              {isLoading ? "-" : formatCurrency(summaryData?.totalPaymentPlan || 0)}
            </div>
            <p className="text-[11px] text-[#5e6ad2] font-medium mt-1">
              {summaryData?.paymentPlanCount || 0} active plans
            </p>
          </CardContent>
        </Card>

        {/* Critical Flags (Mapped to Overdue) */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0 p-4">
            <CardTitle className="text-xs font-medium text-[#8a8f98]">Critical Flags</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-[#f7f8f8]">
              {isLoading ? "-" : formatCurrency(criticalFlags)}
            </div>
            <p className="text-[11px] text-red-400 font-medium mt-1">Overdue Balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Aging Pipeline */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-[#8a8f98]" />
              <CardTitle>Aging Pipeline</CardTitle>
            </div>
            <CardDescription>Outstanding exposure by urgency tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              {isAgingLoading ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-[#8a8f98]">Loading chart...</div>
              ) : isAgingError ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-red-400 p-4">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <p className="text-xs font-medium">Failed to load aging pipeline</p>
                  <p className="text-[11px] text-red-400/80 mt-1">{getErrorMessage(agingError)}</p>
                </div>
              ) : agingChartData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-[#8a8f98]">No aging data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" tickFormatter={(val) => Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD' }).format(val)} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <YAxis dataKey="name" type="category" width={110} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#141516'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Mix */}
        <Card className="animate-in fade-in duration-300">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4 text-[#8a8f98]" />
              <CardTitle>Portfolio Mix</CardTitle>
            </div>
            <CardDescription>Distribution of active and recovered funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              {isSummaryLoading ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-[#8a8f98]">Loading chart...</div>
              ) : isSummaryError ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-red-400 p-4">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <p className="text-xs font-medium">Failed to load portfolio data</p>
                  <p className="text-[11px] text-red-400/80 mt-1">{getErrorMessage(summaryError)}</p>
                </div>
              ) : portfolioData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-[#8a8f98]">No portfolio data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#8a8f98', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Performance Row */}
      <Card className="animate-in fade-in duration-300">
        <CardHeader className="pb-2 border-b-0 p-4">
          <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">
            Dispatch Performance (Latest Run)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-[#8a8f98] flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-[#62666d]" /> Last Batch Sent</span>
              <span className="text-base font-semibold text-[#f7f8f8]">{isRunsLoading ? "-" : lastBatchSent}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-[#8a8f98] flex items-center"><Zap className="w-3.5 h-3.5 mr-1.5 text-[#5e6ad2]" /> Automation Yield</span>
              <span className="text-base font-semibold text-[#f7f8f8]">{isRunsLoading ? "-" : automationYield}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-[#8a8f98] flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Legal Escalations</span>
              <span className="text-base font-semibold text-[#f7f8f8]">{isAgingLoading ? "-" : stage5Halted}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{payload[0].name}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{formatCurrencyUSD(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

