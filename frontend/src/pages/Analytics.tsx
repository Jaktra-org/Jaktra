import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import { invoiceService } from '../services/invoice';
import { formatCurrencyUSD } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { DollarSign, Clock, AlertCircle, Loader2, Construction, BarChart3 } from 'lucide-react';

export function Analytics() {
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsService.getSummary(),
  });

  const { data: agingData, isLoading: isAgingLoading } = useQuery({
    queryKey: ['analytics-aging'],
    queryFn: () => analyticsService.getAging(),
  });

  const { data: allInvoicesSample } = useQuery({
    queryKey: ['all-invoices-analytics'],
    queryFn: () => invoiceService.getInvoices({ limit: 100 }),
  });

  const sampleOverdueInvoices = allInvoicesSample?.data?.filter(inv => inv.paymentStatus === 'Overdue' || (inv.daysOverdue !== undefined && inv.daysOverdue > 0)) || [];
  const sample31Plus = sampleOverdueInvoices.filter(i => (i.daysOverdue || 0) > 30).reduce((acc, curr) => acc + Number(curr.invoiceAmount || 0), 0);
  const sample15_30 = sampleOverdueInvoices.filter(i => (i.daysOverdue || 0) >= 15 && (i.daysOverdue || 0) <= 30).reduce((acc, curr) => acc + Number(curr.invoiceAmount || 0), 0);
  const sample8_14 = sampleOverdueInvoices.filter(i => (i.daysOverdue || 0) >= 8 && (i.daysOverdue || 0) <= 14).reduce((acc, curr) => acc + Number(curr.invoiceAmount || 0), 0);
  const sample0_7 = sampleOverdueInvoices.filter(i => (i.daysOverdue || 0) >= 0 && (i.daysOverdue || 0) <= 7).reduce((acc, curr) => acc + Number(curr.invoiceAmount || 0), 0);

  const api31Plus = agingData?.find(a => a.tier === 'legal_escalation' || a.tier === 'stage_4_stern' || a.tier === '30_plus')?.totalAmount || 0;
  const api15_30 = agingData?.find(a => a.tier === 'stage_3_serious' || a.tier === '15_30')?.totalAmount || 0;
  const api8_14 = agingData?.find(a => a.tier === 'stage_2_firm' || a.tier === '8_14')?.totalAmount || 0;
  const api0_7 = agingData?.find(a => a.tier === 'stage_1_warm' || a.tier === '0_7')?.totalAmount || 0;

  const aging31Plus = api31Plus || sample31Plus;
  const aging15_30 = api15_30 || sample15_30;
  const aging8_14 = api8_14 || sample8_14;
  const aging0_7 = api0_7 || sample0_7;

  const agingTiersAnalytics = [
    { label: '31+ Days', color: 'bg-red-500', amount: aging31Plus },
    { label: '15 - 30 Days', color: 'bg-amber-500', amount: aging15_30 },
    { label: '8 - 14 Days', color: 'bg-[#5e6ad2]', amount: aging8_14 },
    { label: '0 - 7 Days', color: 'bg-emerald-500', amount: aging0_7 },
  ];
  const totalAgingSumAnalytics = agingTiersAnalytics.reduce((acc, curr) => acc + curr.amount, 0) || 1;

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
    <div className="h-full w-full flex flex-col text-[#f7f8f8] overflow-hidden space-y-4">
      {/* Top Fixed Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1e2025]/80">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">
            Analytics
          </h1>
          <p className="text-xs text-[#8a8f98] mt-1">Real-time financial intelligence, receivable risk breakdowns, and collection metrics.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Receivable" value={summaryData?.totalReceivable} loading={isSummaryLoading} formatter={formatCurrency} icon={<DollarSign className="w-4 h-4 text-[#8a8f98]" />} />
          <MetricCard title="Total Collected" value={summaryData?.totalCollected} loading={isSummaryLoading} formatter={formatCurrency} icon={<DollarSign className="w-4 h-4 text-[#27a644]" />} valueColor="text-[#27a644]" />
          <MetricCard title="Total Overdue" value={summaryData?.totalOverdue} loading={isSummaryLoading} formatter={formatCurrency} icon={<AlertCircle className="w-4 h-4 text-red-400" />} valueColor="text-red-400" />
          <MetricCard title="Active Invoices" value={summaryData?.invoiceCount} loading={isSummaryLoading} icon={<Clock className="w-4 h-4 text-[#5e6ad2]" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aging Risk Breakdown Card */}
          <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-sm font-semibold text-[#f7f8f8]">
                  <BarChart3 className="w-4 h-4 text-[#5e6ad2] mr-2" />
                  Aging Risk Breakdown
                </h3>
                <span className="text-xs text-[#8a8f98]">By Overdue Days</span>
              </div>
              <p className="text-xs text-[#8a8f98] mt-1">Capital risk concentration grouped by overdue duration</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {isAgingLoading ? (
                <div className="h-[240px] flex items-center justify-center text-xs text-[#8a8f98]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
                </div>
              ) : (
                agingTiersAnalytics.map((tier) => {
                  const pct = Math.round((tier.amount / totalAgingSumAnalytics) * 100);
                  return (
                    <div key={tier.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8a8f98] font-medium">{tier.label}</span>
                        <span className="text-[#f7f8f8] font-semibold">{formatCurrencyUSD(tier.amount)} <span className="text-xs text-[#62666d]">({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full bg-[#13161c] rounded-full overflow-hidden border border-[#1e2025]">
                        <div className={`h-full ${tier.color} transition-all duration-500 rounded-full`} style={{ width: `${Math.max(pct, tier.amount > 0 ? 4 : 0)}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#f7f8f8]">Aging Pyramid</h3>
              <p className="text-xs text-[#8a8f98] mt-1">Capital exposure grouped by collection tier</p>
            </div>
            <div>
              {isAgingLoading ? (
                <div className="h-[240px] flex items-center justify-center text-xs text-[#8a8f98]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
                </div>
              ) : (
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agingChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e2025" />
                      <XAxis type="number" tickFormatter={(val) => `$${val / 1000}k`} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                      <YAxis dataKey="name" type="category" width={110} stroke="#34343a" fontSize={11} tick={{fill: '#8a8f98'}} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#13161c'}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={36}>
                        {agingChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <ComingSoonCard title="Receivable vs Collected" description="Historical gap analysis between billed and collected capital" />
          <ComingSoonCard title="Days Sales Outstanding (DSO) Trend" description="Average time taken to collect revenue over the last 12 months" />
        </div>
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

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#13161c] border border-[#1e2025] p-2.5 shadow-2xl rounded-xl text-xs">
        <p className="font-medium text-[#f7f8f8] mb-0.5">{item.payload.name}</p>
        <p className="text-xs text-[#5e6ad2] font-semibold">{formatCurrencyUSD(item.value ?? 0)}</p>
        <p className="text-[11px] text-[#8a8f98] mt-0.5">{item.payload.count} Invoices</p>
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
    <div className="bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="text-xs font-semibold text-[#8a8f98]">{title}</h3>
        {icon}
      </div>
      <div className={`text-2xl font-bold font-mono ${valueColor}`}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#5e6ad2]" /> : (formatter ? formatter((value as number) || 0) : (value || 0))}
      </div>
    </div>
  );
}

function ComingSoonCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-[#13161c]/20 border border-dashed border-[#1e2025]/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
      <div className="bg-[#13161c] border border-[#1e2025] p-3 rounded-2xl mb-3">
        <Construction className="w-6 h-6 text-[#8a8f98]" />
      </div>
      <h4 className="text-sm font-semibold text-[#f7f8f8]">{title}</h4>
      <p className="text-xs text-[#8a8f98] mt-1 max-w-xs">{description}</p>
      <span className="mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#13161c] border border-[#1e2025] text-[#8a8f98]">
        Coming Soon
      </span>
    </div>
  );
}
