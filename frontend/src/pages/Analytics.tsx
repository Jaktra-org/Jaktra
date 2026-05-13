import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import { formatCurrencyUSD } from '../utils/format';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { TrendingUp, DollarSign, Clock, AlertCircle, Loader2, Construction, Send, Zap, LayoutDashboard } from 'lucide-react';

export function Analytics() {
  const [activeTab, setActiveTab] = useState<'financial' | 'agent'>('agent');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8] flex items-center">
            <TrendingUp className="w-6 h-6 text-[#5e6ad2] mr-2.5" />
            Analytics & BI
          </h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">Real-time business intelligence and AI performance metrics.</p>
        </div>
      </div>

      <div className="border-b border-[#23252a]">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('financial')}
            className={`${
              activeTab === 'financial'
                ? 'border-[#5e6ad2] text-[#5e6ad2]'
                : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
            Financial Metrics
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`${
              activeTab === 'agent'
                ? 'border-[#5e6ad2] text-[#5e6ad2]'
                : 'border-transparent text-[#8a8f98] hover:text-[#f7f8f8] hover:border-[#34343a]'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs flex items-center transition-colors`}
          >
            <Zap className="w-3.5 h-3.5 mr-2" />
            Agent Performance
          </button>
        </nav>
      </div>

      {activeTab === 'financial' ? <FinancialMetricsTab /> : <AgentPerformanceTab />}
    </div>
  );
}

function FinancialMetricsTab() {
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsService.getSummary(),
  });

  const { data: agingData, isLoading: isAgingLoading } = useQuery({
    queryKey: ['analytics-aging'],
    queryFn: () => analyticsService.getAging(),
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

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
    count: d.count,
    fill: tierConfig[d.tier]?.color || '#3e3e44'
  })).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Receivable" value={summaryData?.totalReceivable} loading={isSummaryLoading} formatter={formatCurrency} icon={<DollarSign className="w-4 h-4 text-[#62666d]" />} />
        <MetricCard title="Total Collected" value={summaryData?.totalCollected} loading={isSummaryLoading} formatter={formatCurrency} icon={<DollarSign className="w-4 h-4 text-[#27a644]" />} valueColor="text-[#27a644]" />
        <MetricCard title="Total Overdue" value={summaryData?.totalOverdue} loading={isSummaryLoading} formatter={formatCurrency} icon={<AlertCircle className="w-4 h-4 text-red-400" />} valueColor="text-red-400" />
        <MetricCard title="Active Invoices" value={summaryData?.invoiceCount} loading={isSummaryLoading} icon={<Clock className="w-4 h-4 text-[#5e6ad2]" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full border border-[#23252a] bg-[#0f1011]">
          <CardHeader>
            <CardTitle>Aging Pyramid</CardTitle>
            <CardDescription>Capital exposure grouped by collection tier</CardDescription>
          </CardHeader>
          <CardContent>
            {isAgingLoading ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#8a8f98]">
                <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#23252a" />
                    <XAxis type="number" tickFormatter={(val) => `$${val / 1000}k`} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <YAxis dataKey="name" type="category" width={110} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#141516'}} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={36}>
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <ComingSoonCard title="Receivable vs Collected" description="Historical gap analysis between billed and collected capital" />
        <ComingSoonCard title="Days Sales Outstanding (DSO) Trend" description="Average time taken to collect revenue over the last 12 months" />
        <ComingSoonCard title="Collection Rate Trend" description="Monthly percentage of successfully collected capital" />
      </div>
    </div>
  );
}

function AgentPerformanceTab() {
  const { data: agentData, isLoading: isAgentLoading } = useQuery({ queryKey: ['agent-performance'], queryFn: () => analyticsService.getAgentPerformance() });
  const { data: emailVol, isLoading: isEmailVolLoading } = useQuery({ queryKey: ['email-volume'], queryFn: () => analyticsService.getEmailVolume() });
  const { data: tierData, isLoading: isTierLoading } = useQuery({ queryKey: ['tier-effectiveness'], queryFn: () => analyticsService.getTierEffectiveness() });
  const { data: channelData, isLoading: isChannelLoading } = useQuery({ queryKey: ['channel-breakdown'], queryFn: () => analyticsService.getChannelBreakdown() });

  const formatPercentage = (val: number) => `${val}%`;

  const tierConfig: Record<string, { label: string, color: string }> = {
    stage_1_warm: { label: 'Warm', color: '#5e6ad2' },
    stage_2_firm: { label: 'Firm', color: '#828fff' },
    stage_3_serious: { label: 'Serious', color: '#f59e0b' },
    stage_4_stern: { label: 'Stern', color: '#eb5757' },
    legal_escalation: { label: 'Legal', color: '#991b1b' },
  };

  const chartTierData = (tierData || []).map(d => ({
    name: tierConfig[d.tier]?.label || d.tier,
    successRate: d.successRate,
    avgDaysToPayment: d.avgDaysToPayment,
    fill: tierConfig[d.tier]?.color || '#3e3e44'
  }));

  const chartChannelData = (channelData || []).map(d => ({
    name: d.channel.charAt(0).toUpperCase() + d.channel.slice(1),
    count: d.count,
    fill: d.channel === 'email' ? '#5e6ad2' : d.channel === 'sms' ? '#f59e0b' : '#27a644'
  }));

  const isLoading = isAgentLoading || isEmailVolLoading || isTierLoading || isChannelLoading;

  const isDataEmpty = !isLoading && 
    (agentData?.totalRuns === 0 || agentData?.totalRuns === undefined) && 
    (!emailVol || emailVol.length === 0);

  if (isDataEmpty) {
    return (
      <Card className="border-dashed border border-[#23252a] bg-[#0f1011] mt-6">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Zap className="w-10 h-10 text-[#3e3e44] mb-3" />
          <h3 className="text-base font-medium text-[#f7f8f8]">No performance data available yet.</h3>
          <p className="text-xs text-[#8a8f98] mt-1">Run the agent to begin collecting analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Runs" value={agentData?.totalRuns} loading={isLoading} icon={<Zap className="w-4 h-4 text-[#5e6ad2]" />} />
        <MetricCard title="Invoices Processed" value={agentData?.invoicesProcessed} loading={isLoading} icon={<LayoutDashboard className="w-4 h-4 text-[#27a644]" />} />
        <MetricCard title="Emails Sent" value={agentData?.emailsSent} loading={isLoading} icon={<Send className="w-4 h-4 text-[#5e6ad2]" />} />
        <MetricCard title="Error Rate" value={agentData?.errorRate} loading={isLoading} formatter={formatPercentage} icon={<AlertCircle className="w-4 h-4 text-red-400" />} valueColor="text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader>
            <CardTitle>Emails Sent Per Day</CardTitle>
            <CardDescription>Daily outbound email volume</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#8a8f98]"><Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" /></div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emailVol} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23252a" />
                    <XAxis dataKey="date" stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line type="monotone" dataKey="emailsSent" stroke="#5e6ad2" strokeWidth={2.5} dot={{ r: 3, fill: '#5e6ad2' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader>
            <CardTitle>Success Rate by Tier</CardTitle>
            <CardDescription>Conversion percentage of followed-up invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#8a8f98]"><Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" /></div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartTierData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23252a" />
                    <XAxis dataKey="name" stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <YAxis stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} tickFormatter={(val) => `${val}%`} />
                    <Tooltip content={<CustomTierTooltip />} cursor={{fill: '#141516'}} />
                    <Bar dataKey="successRate" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {chartTierData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader>
            <CardTitle>Average Time-To-Payment</CardTitle>
            <CardDescription>Days to collect grouped by urgency tier</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#8a8f98]"><Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" /></div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartTierData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23252a" />
                    <XAxis dataKey="name" stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <YAxis stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <Tooltip content={<CustomDaysTooltip />} cursor={{fill: '#141516'}} />
                    <Bar dataKey="avgDaysToPayment" fill="#5e6ad2" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-[#23252a] bg-[#0f1011]">
          <CardHeader>
            <CardTitle>Channel Effectiveness</CardTitle>
            <CardDescription>Communication volume breakdown by channel</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-[#8a8f98]"><Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" /></div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartChannelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#23252a" />
                    <XAxis type="number" stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <YAxis dataKey="name" type="category" width={80} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                    <Tooltip content={<CustomChannelTooltip />} cursor={{fill: '#141516'}} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36}>
                      {chartChannelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  payload: {
    name?: string;
    count?: number;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

// Custom Tooltips for Dark Theme
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{item.payload.name}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{formatCurrencyUSD(item.value ?? 0)}</p>
        <p className="text-[11px] text-[#8a8f98] mt-0.5">{item.payload.count} Invoices</p>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label != null) {
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{payload[0].value} Emails Sent</p>
      </div>
    );
  }
  return null;
};

const CustomTierTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{payload[0].payload.name}</p>
        <p className="text-xs text-[#27a644] font-semibold">{payload[0].value}% Success Rate</p>
      </div>
    );
  }
  return null;
};

const CustomDaysTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{payload[0].payload.name}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{payload[0].value} days to payment</p>
      </div>
    );
  }
  return null;
};

const CustomChannelTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1011] border border-[#23252a] p-2.5 shadow-2xl rounded-md text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{payload[0].payload.name}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{payload[0].value} Sent</p>
      </div>
    );
  }
  return null;
};

interface MetricCardProps {
  title: string;
  value?: number | string | null;
  loading: boolean;
  formatter?: (val: number) => string;
  icon?: React.ReactNode;
  valueColor?: string;
}

function MetricCard({ title, value, loading, formatter, icon, valueColor = "text-[#f7f8f8]" }: MetricCardProps) {
  return (
    <Card className="border border-[#23252a] bg-[#0f1011]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-x-2">
          <h3 className="text-xs font-medium text-[#8a8f98]">{title}</h3>
          {icon}
        </div>
        <div className={`mt-3 flex items-baseline text-2xl font-bold ${valueColor}`}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /> : (formatter ? formatter((value as number) || 0) : (value || 0))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComingSoonCard({ title, description }: { title: string, description: string }) {
  return (
    <Card className="h-full border-dashed border border-[#23252a] bg-[#0f1011]/50">
      <CardHeader>
        <CardTitle className="text-[#d0d6e0]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="bg-[#141516] border border-[#23252a] p-3 rounded-full mb-3">
          <Construction className="w-6 h-6 text-[#8a8f98]" />
        </div>
        <h4 className="text-sm font-medium text-[#f7f8f8]">Coming Soon</h4>
        <p className="text-xs text-[#8a8f98] text-center max-w-[240px] mt-1">
          This chart requires historical analytics data. Backend aggregation endpoints are under development.
        </p>
      </CardContent>
    </Card>
  );
}

