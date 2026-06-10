import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { analyticsService } from "../services/analytics";
import { AlertCircle, FileText, TrendingUp, DollarSign, Loader2 } from "lucide-react";

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsService.getSummary(),
    refetchInterval: 30000, // 30 seconds auto-refetch
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatPercent = (val: number) => 
    `${val.toFixed(1)}%`;

  // Calculations
  const actionableQueue = data?.invoiceCount || 0;
  const totalExposure = data?.totalReceivable || 0;
  
  const totalCollected = data?.totalCollected || 0;
  const recoveryRate = (totalCollected + totalExposure) > 0 
    ? (totalCollected / (totalCollected + totalExposure)) * 100 
    : 0;
    
  const criticalFlags = data?.totalOverdue || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your collection pipeline.</p>
        </div>
        
        {isLoading && (
          <div className="flex items-center text-sm text-slate-500 mt-2 md:mt-0">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing data...
          </div>
        )}
        
        {isError && (
          <div className="text-sm text-red-500 mt-2 md:mt-0">
            Failed to load analytics data.
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Actionable Queue */}
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actionable Queue</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : actionableQueue}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total active invoices</p>
          </CardContent>
        </Card>

        {/* Total Exposure */}
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-2 delay-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : formatCurrency(totalExposure)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Pending and Overdue</p>
          </CardContent>
        </Card>

        {/* Recovery Rate */}
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-2 delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "-" : formatPercent(recoveryRate)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Collected vs Total Billed</p>
          </CardContent>
        </Card>

        {/* Critical Flags (Mapped to Overdue) */}
        <Card className="animate-in fade-in duration-500 slide-in-from-bottom-2 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Flags</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? "-" : formatCurrency(criticalFlags)}
            </div>
            <p className="text-xs text-red-500 font-medium mt-1">Overdue Balance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
