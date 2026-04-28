import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { invoiceService } from "../services/invoice";
import type { ListInvoicesParams, Invoice } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "../components/ui/Badge";
import { CreateInvoiceModal } from "../components/invoices/CreateInvoiceModal";
import { ImportInvoiceModal } from "../components/invoices/ImportInvoiceModal";
import { ConfirmDestructiveModal } from "../components/common/ConfirmDestructiveModal";
import { 
  Search, 
  Download, 
  Upload,
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileText,
  AlertCircle,
  Trash2,
  RotateCcw,
  X,
  Scale,
  SlidersHorizontal
} from "lucide-react";
import { getErrorMessage } from "../utils/error-utils";

export function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useState<ListInvoicesParams>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initial: ListInvoicesParams = {
      page: 1,
      limit: 50,
      sort_by: 'createdAt',
      order: 'desc'
    };

    const aging = searchParams.get('aging_bucket');
    if (aging === '30_plus') {
      initial.aging_bucket = '30_plus';
      initial.days_overdue_min = 31;
    } else if (aging === '0_7') {
      initial.aging_bucket = '0_7';
      initial.days_overdue_min = 0;
      initial.days_overdue_max = 7;
    } else if (aging === '8_14') {
      initial.aging_bucket = '8_14';
      initial.days_overdue_min = 8;
      initial.days_overdue_max = 14;
    } else if (aging === '15_30') {
      initial.aging_bucket = '15_30';
      initial.days_overdue_min = 15;
      initial.days_overdue_max = 30;
    }

    if (searchParams.get('has_payment_plan') === 'true') {
      initial.has_payment_plan = true;
    } else if (searchParams.get('has_payment_plan') === 'false') {
      initial.has_payment_plan = false;
    }

    const statusParam = searchParams.get('status') || searchParams.get('payment_status');
    if (statusParam === 'overdue' || statusParam === 'Overdue') {
      initial.status = ['Overdue'];
    } else if (statusParam === 'unpaid' || statusParam === 'Unpaid' || statusParam === 'pending' || statusParam === 'Pending') {
      initial.status = ['Pending', 'Overdue'];
    } else if (statusParam === 'paid' || statusParam === 'Paid') {
      initial.status = ['Paid'];
    }

    if (searchParams.get('days_overdue_min')) {
      initial.days_overdue_min = Number(searchParams.get('days_overdue_min'));
    }

    if (searchParams.get('days_overdue_max')) {
      initial.days_overdue_max = Number(searchParams.get('days_overdue_max'));
    }

    if (searchParams.get('urgency_tier')) {
      initial.urgency_tier = searchParams.get('urgency_tier') as ListInvoicesParams['urgency_tier'];
    }

    if (searchParams.get('min_amount')) {
      initial.min_amount = Number(searchParams.get('min_amount'));
    }

    return initial;
  });

  const [isTrashView, setIsTrashView] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return Boolean(
      searchParams.get('aging_bucket') || 
      searchParams.get('has_payment_plan') || 
      searchParams.get('urgency_tier') ||
      searchParams.get('min_amount') ||
      searchParams.get('days_overdue_min') ||
      searchParams.get('status') ||
      searchParams.get('payment_status')
    );
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return Boolean(window.history.state?.usr?.openCreateModal || searchParams.get('action') === 'create');
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const activeFilterCount = [
    params.urgency_tier,
    params.has_payment_plan !== undefined,
    params.needs_review !== undefined,
    params.followup_status,
    params.min_amount !== undefined,
    params.max_amount !== undefined,
    params.aging_bucket || (params.days_overdue_min !== undefined || params.days_overdue_max !== undefined),
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setParams(prev => ({
      page: 1,
      limit: prev.limit,
      sort_by: prev.sort_by,
      order: prev.order,
      status: prev.status,
      client_name: prev.client_name
    }));
  };

  const handleAgingBucket = (bucket: string) => {
    setParams(prev => {
      const next = { ...prev, page: 1 };
      if (bucket === '0_7') {
        next.days_overdue_min = 0;
        next.days_overdue_max = 7;
        next.aging_bucket = '0_7';
      } else if (bucket === '8_14') {
        next.days_overdue_min = 8;
        next.days_overdue_max = 14;
        next.aging_bucket = '8_14';
      } else if (bucket === '15_30') {
        next.days_overdue_min = 15;
        next.days_overdue_max = 30;
        next.aging_bucket = '15_30';
      } else if (bucket === '30_plus') {
        next.days_overdue_min = 31;
        next.days_overdue_max = undefined;
        next.aging_bucket = '30_plus';
      } else {
        next.days_overdue_min = undefined;
        next.days_overdue_max = undefined;
        next.aging_bucket = undefined;
      }
      return next;
    });
  };
  const [prevSearch, setPrevSearch] = useState(location.search);

  if (prevSearch !== location.search) {
    setPrevSearch(location.search);
    const searchParams = new URLSearchParams(location.search);
    const hasAging = searchParams.get('aging_bucket');
    const hasPlan = searchParams.get('has_payment_plan');
    const hasTier = searchParams.get('urgency_tier');
    const hasMinAmt = searchParams.get('min_amount');
    const statusParam = searchParams.get('status') || searchParams.get('payment_status');
    const daysOverdueMinParam = searchParams.get('days_overdue_min');

    if (hasAging || hasPlan || hasTier || hasMinAmt || statusParam || daysOverdueMinParam) {
      setIsFilterPanelOpen(true);
      setParams(prev => {
        const next = { ...prev, page: 1 };
        if (statusParam === 'overdue' || statusParam === 'Overdue') {
          next.status = ['Overdue'];
        }
        if (daysOverdueMinParam) {
          next.days_overdue_min = Number(daysOverdueMinParam);
        }
        if (hasAging === '30_plus') {
          next.aging_bucket = '30_plus';
          next.days_overdue_min = 31;
          next.days_overdue_max = undefined;
        } else if (hasAging === '15_30') {
          next.aging_bucket = '15_30';
          next.days_overdue_min = 15;
          next.days_overdue_max = 30;
        }
        if (hasPlan === 'true') {
          next.has_payment_plan = true;
        }
        if (hasTier) {
          next.urgency_tier = hasTier as ListInvoicesParams['urgency_tier'];
        }
        if (hasMinAmt) {
          next.min_amount = Number(hasMinAmt);
        }
        return next;
      });
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (location.state?.openCreateModal || searchParams.get('action') === 'create') {
      setTimeout(() => {
        setIsCreateModalOpen(true);
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
  }, [location, navigate]);

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => invoiceService.hardDeleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-trash'] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => invoiceService.restoreInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-trash'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
    }
  });

  const isInitialSearchMount = useRef(true);
  // Debounce search input
  useEffect(() => {
    if (isInitialSearchMount.current) {
      isInitialSearchMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setParams(prev => ({
        ...prev,
        page: 1,
        client_name: searchInput || undefined
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.getInvoices(params),
    enabled: !isTrashView,
  });

  const { data: trashData, isLoading: isTrashLoading, isError: isTrashError, error: trashError } = useQuery({
    queryKey: ['invoices-trash', params],
    queryFn: () => invoiceService.getTrashedInvoices(params),
    enabled: isTrashView,
  });

  // Unified display data depending on which tab is active
  const activeData = isTrashView ? trashData : data;
  const isLoading_ = isTrashView ? isTrashLoading : isLoading;
  const isError_ = isTrashView ? isTrashError : isError;
  const error_ = isTrashView ? trashError : error;

  const handleSort = (field: ListInvoicesParams['sort_by']) => {
    setParams(prev => ({
      ...prev,
      page: 1,
      sort_by: field,
      order: prev.sort_by === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleStatusFilter = (status: string) => {
    setIsTrashView(false);
    setParams(prev => ({
      ...prev,
      page: 1,
      status: status === 'All' ? undefined : status === 'Unpaid' ? ['Pending', 'Overdue'] : [status]
    }));
  };

  const handleTrashTab = () => {
    setIsTrashView(true);
    setParams(prev => ({ ...prev, page: 1, status: undefined }));
  };

  const handleExportCSV = () => {
    if (!activeData?.data || activeData.data.length === 0) return;
    
    const headers = ['Invoice No', 'Client', 'Amount', 'Due Date', 'Status', 'Days Overdue', 'Follow-ups'];
    const rows = activeData!.data.map(inv => [
      inv.invoiceNo,
      `"${inv.clientName}"`, // Quote to handle commas
      inv.invoiceAmount,
      inv.dueDate,
      inv.paymentStatus,
      inv.daysOverdue || 0,
      inv.followupCount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStatus = isTrashView ? 'Trash' : (
    params.status?.includes('Pending') && params.status?.includes('Overdue')
      ? 'Unpaid'
      : (params.status?.[0] || 'All')
  );

  const formatCurrency = (val: string | number) => {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
  };

  const renderSortIcon = (field: ListInvoicesParams['sort_by']) => {
    if (params.sort_by !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-[#62666d]" />;
    return params.order === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 text-[#5e6ad2]" /> : <ArrowDown className="ml-1 h-3 w-3 text-[#5e6ad2]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8]">Invoices</h1>
          <p className="text-xs text-[#8a8f98] mt-0.5">Manage your collection portfolio and track aging accounts.</p>
        </div>
        <div className="flex items-center space-x-2.5">
          {!isTrashView && (
            <button
              onClick={handleExportCSV}
              disabled={!activeData?.data || activeData.data.length === 0}
              className="inline-flex items-center justify-center rounded-xl text-xs font-medium transition-all border border-[#1e2025]/80 bg-[#13161c]/50 text-[#f7f8f8] hover:bg-[#1d212a] hover:border-[#2e3444] h-9 px-3.5 disabled:opacity-40"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
              Export CSV
            </button>
          )}
          {user?.role !== 'viewer' && !isTrashView && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl text-xs font-medium transition-all border border-[#1e2025]/80 bg-[#13161c]/50 text-[#f7f8f8] hover:bg-[#1d212a] hover:border-[#2e3444] h-9 px-3.5"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
                Import CSV
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl text-xs font-medium transition-all bg-[#5e6ad2] text-white hover:bg-[#828fff] h-9 px-3.5 shadow-lg shadow-[#5e6ad2]/20"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {isError_ && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 mr-2.5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-xs">Failed to load invoices</h4>
            <p className="text-xs mt-0.5 opacity-90">{getErrorMessage(error_)}</p>
          </div>
        </div>
      )}

      {/* Filters Top Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Main Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-transparent border border-[#1e2025]/80 rounded-xl flex-wrap">
          {['All', 'Unpaid', 'Paid', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                !isTrashView && currentStatus === status
                  ? 'bg-[#1a1e2e] text-[#5e6ad2] border border-[#282f45] font-semibold shadow-sm'
                  : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={handleTrashTab}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isTrashView
                ? 'bg-[#1a1e2e] text-amber-400 border border-[#282f45] font-semibold shadow-sm'
                : 'bg-transparent text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent font-medium'
            }`}
          >
            <Trash2 className="h-3 w-3" />
            Trash
          </button>
        </div>

        {/* Search & Filter Drawer Toggle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 z-10 h-3.5 w-3.5 text-[#62666d] pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients or invoice #..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex h-8.5 w-full rounded-xl border border-[#1e2025]/80 bg-[#13161c]/50 px-3 py-1.5 pl-8.5 text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e69d1] focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
            />
          </div>

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`inline-flex items-center justify-center text-xs font-medium transition-all border h-8.5 px-3 gap-1.5 rounded-xl ${
              isFilterPanelOpen || activeFilterCount > 0
                ? 'bg-[#5e6ad2]/15 border-[#5e6ad2]/40 text-[#5e6ad2]'
                : 'bg-[#13161c]/50 border-[#1e2025]/80 text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#181a22]'
            }`}
          >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#5e6ad2] text-white text-[10px] rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>



        {/* Expandable Advanced Multi-Filter Drawer Panel */}
        {isFilterPanelOpen && !isTrashView && (
          <div className="p-3.5 rounded-xl border border-[#1e2025]/60 bg-[#13161c]/30 space-y-3 transition-all animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#f7f8f8] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5e6ad2]" /> Advanced Filter Controls
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] text-[#5e6ad2] hover:text-[#828fff] transition-colors underline"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Aging Bucket */}
              <div>
                <label className="block text-[11px] font-medium text-[#8a8f98] mb-1">Aging Bucket</label>
                <select
                  value={params.aging_bucket || ''}
                  onChange={(e) => handleAgingBucket(e.target.value)}
                  className="w-full h-8.5 bg-[#13161c]/60 border border-[#1e2025]/80 rounded-xl px-2.5 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#5e6ad2]"
                >
                  <option value="" className="bg-[#13161c] text-[#f7f8f8]">All Aging Buckets</option>
                  <option value="0_7" className="bg-[#13161c] text-[#f7f8f8]">0 - 7 Days Overdue</option>
                  <option value="8_14" className="bg-[#13161c] text-[#f7f8f8]">8 - 14 Days Overdue</option>
                  <option value="15_30" className="bg-[#13161c] text-[#f7f8f8]">15 - 30 Days Overdue</option>
                  <option value="30_plus" className="bg-[#13161c] text-[#f7f8f8]">30+ Days Overdue</option>
                </select>
              </div>

              {/* Payment Plan */}
              <div>
                <label className="block text-[11px] font-medium text-[#8a8f98] mb-1">Payment Plan Status</label>
                <select
                  value={params.has_payment_plan === undefined ? '' : params.has_payment_plan ? 'true' : 'false'}
                  onChange={(e) => setParams(prev => ({
                    ...prev,
                    page: 1,
                    has_payment_plan: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined
                  }))}
                  className="w-full h-8.5 bg-[#13161c]/60 border border-[#1e2025]/80 rounded-xl px-2.5 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#5e6ad2]"
                >
                  <option value="" className="bg-[#13161c] text-[#f7f8f8]">All</option>
                  <option value="true" className="bg-[#13161c] text-[#f7f8f8]">Active Payment Plan</option>
                  <option value="false" className="bg-[#13161c] text-[#f7f8f8]">No Payment Plan</option>
                </select>
              </div>

              {/* Follow-up Status */}
              <div>
                <label className="block text-[11px] font-medium text-[#8a8f98] mb-1">Follow-up History</label>
                <select
                  value={params.followup_status || ''}
                  onChange={(e) => setParams(prev => ({ ...prev, page: 1, followup_status: (e.target.value as ListInvoicesParams['followup_status']) || undefined }))}
                  className="w-full h-8.5 bg-[#13161c]/60 border border-[#1e2025]/80 rounded-xl px-2.5 text-xs text-[#f7f8f8] focus:outline-none focus:border-[#5e6ad2]"
                >
                  <option value="" className="bg-[#13161c] text-[#f7f8f8]">All History</option>
                  <option value="none" className="bg-[#13161c] text-[#f7f8f8]">No Follow-ups (0)</option>
                  <option value="has_followups" className="bg-[#13161c] text-[#f7f8f8]">1+ Follow-ups Sent</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-[11px] font-medium text-[#8a8f98] mb-1">Min Amount ($)</label>
                <input
                  type="number"
                  placeholder="Min $"
                  value={params.min_amount || ''}
                  onChange={(e) => setParams(prev => ({ ...prev, page: 1, min_amount: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full h-8.5 bg-[#13161c]/60 border border-[#1e2025]/80 rounded-xl px-3 text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>

              {/* Min Overdue Days */}
              <div>
                <label className="block text-[11px] font-medium text-[#8a8f98] mb-1">Min Overdue Days</label>
                <input
                  type="number"
                  placeholder="Min Days"
                  value={params.days_overdue_min !== undefined ? params.days_overdue_min : ''}
                  onChange={(e) => setParams(prev => ({ ...prev, page: 1, days_overdue_min: e.target.value !== '' ? Number(e.target.value) : undefined }))}
                  className="w-full h-8.5 bg-[#13161c]/60 border border-[#1e2025]/80 rounded-xl px-3 text-xs text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills Strip */}
        {activeFilterCount > 0 && !isTrashView && (
          <div className="px-3.5 py-2 border-b border-[#1e2025]/60 bg-[#13161c]/30 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#8a8f98]">Active Filters:</span>

              {params.urgency_tier && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#5e6ad2]/20 border border-[#5e6ad2]/40 text-[#828fff] text-[11px]">
                  Stage: {params.urgency_tier.replace(/_/g, ' ')}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, urgency_tier: undefined }))} />
                </span>
              )}

              {params.has_payment_plan !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px]">
                  Plan: {params.has_payment_plan ? 'Active' : 'None'}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, has_payment_plan: undefined }))} />
                </span>
              )}

              {params.days_overdue_min !== undefined && !params.aging_bucket && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px]">
                  Overdue ≥ {params.days_overdue_min} {params.days_overdue_min === 1 ? 'day' : 'days'}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, days_overdue_min: undefined }))} />
                </span>
              )}

              {params.needs_review !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px]">
                  Needs Review
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, needs_review: undefined }))} />
                </span>
              )}

              {params.followup_status && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px]">
                  Follow-ups: {params.followup_status === 'none' ? '0' : '1+'}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, followup_status: undefined }))} />
                </span>
              )}

              {params.aging_bucket && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px]">
                  Aging: {params.aging_bucket.replace('_', '-')}d
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleAgingBucket('')} />
                </span>
              )}

              {params.min_amount !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px]">
                  Min: ${params.min_amount}
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setParams(p => ({ ...p, min_amount: undefined }))} />
                </span>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="text-[11px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-xs">
            <thead>
              <tr className="border-b border-[#23252a]/70">
                <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('invoiceNo')}>
                  <div className="flex items-center">Invoice No {renderSortIcon('invoiceNo')}</div>
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('clientName')}>
                  <div className="flex items-center">Client {renderSortIcon('clientName')}</div>
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('invoiceAmount')}>
                  <div className="flex items-center">Amount {renderSortIcon('invoiceAmount')}</div>
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center">Due Date {renderSortIcon('dueDate')}</div>
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('paymentStatus')}>
                  <div className="flex items-center">Status {renderSortIcon('paymentStatus')}</div>
                </th>
                {isTrashView ? (
                  <>
                    <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98]">
                      <div className="flex items-center">Deleted On</div>
                    </th>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <th className="h-10 px-4 text-right align-middle font-medium text-[#8a8f98] w-64">
                        <span>Actions</span>
                      </th>
                    )}
                  </>
                ) : (
                  <>
                    <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98]">
                      <div className="flex items-center">Days Overdue</div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-[#8a8f98] cursor-pointer select-none hover:text-[#f7f8f8]" onClick={() => handleSort('followupCount')}>
                      <div className="flex items-center">Follow-ups {renderSortIcon('followupCount')}</div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2025]/50">
              {isLoading_ ? (
                <tr>
                  <td colSpan={isTrashView ? (user?.role === 'admin' || user?.role === 'manager' ? 7 : 6) : 7} className="p-8 text-center text-[#8a8f98]">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#5e6ad2] mb-3" />
                      <p>{isTrashView ? 'Loading trash...' : 'Loading invoices...'}</p>
                    </div>
                  </td>
                </tr>
              ) : isError_ ? (
                <tr>
                  <td colSpan={isTrashView ? (user?.role === 'admin' || user?.role === 'manager' ? 7 : 6) : 7} className="p-8 text-center text-red-400">
                    Failed to load {isTrashView ? 'trash' : 'invoices'}. Please try again.
                  </td>
                </tr>
              ) : !activeData?.data || activeData.data.length === 0 ? (
                <tr>
                  <td colSpan={isTrashView ? (user?.role === 'admin' || user?.role === 'manager' ? 7 : 6) : 7} className="p-12 text-center text-[#8a8f98]">
                    <div className="flex flex-col items-center justify-center">
                      {isTrashView ? (
                        <>
                          <Trash2 className="h-10 w-10 text-[#3e3e44] mb-3" />
                          <p className="text-sm font-medium text-[#f7f8f8]">Trash is empty</p>
                          <p className="text-xs mt-0.5">Deleted invoices will appear here.</p>
                        </>
                      ) : (
                        <>
                          <FileText className="h-10 w-10 text-[#3e3e44] mb-3" />
                          <p className="text-sm font-medium text-[#f7f8f8]">No invoices found</p>
                          <p className="text-xs mt-0.5">Adjust your filter options to see matching invoices.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : isTrashView ? (
                activeData!.data.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => navigate(`/invoices/${invoice.id}/trashed`)}
                    className="transition-colors hover:bg-amber-950/20 cursor-pointer opacity-80"
                  >
                    <td className="p-3.5 px-4 align-middle font-medium text-[#8a8f98]">
                      {invoice.invoiceNo}
                    </td>
                    <td className="p-3.5 px-4 align-middle">
                      <div className="font-medium text-[#f7f8f8]">{invoice.clientName}</div>
                      <div className="text-[11px] text-[#8a8f98]">{invoice.contactEmail}</div>
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#8a8f98]">
                      {formatCurrency(invoice.invoiceAmount)}
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#8a8f98]">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 px-4 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={
                          invoice.paymentStatus === 'Paid' ? 'success' :
                          invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
                        }>
                          {invoice.paymentStatus}
                        </Badge>
                        {invoice.needsManualReview && (
                          <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30" title="Blocked due to DLQ failures">
                            Manual Review
                          </Badge>
                        )}
                        {invoice.hasActivePaymentPlan && (
                          <Badge variant="success" className="bg-[#27a644]/10 text-[#27a644] border-[#27a644]/30">
                            Payment Plan
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#8a8f98]">
                      {invoice.deletedAt
                        ? new Date(invoice.deletedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <td className="p-3.5 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              await restoreMutation.mutateAsync(invoice.id);
                            }}
                            disabled={restoreMutation.isPending}
                            className="inline-flex items-center justify-center rounded-lg text-xs font-medium transition-all border border-[#1e2025] bg-[#13161c]/80 hover:bg-[#1d212a] text-[#f7f8f8] h-7 px-2.5 gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => {
                                setInvoiceToDelete(invoice);
                                setIsConfirmDeleteModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center rounded-lg text-xs font-medium transition-all border border-red-900/50 bg-red-950/30 hover:bg-red-900/40 text-red-400 h-7 px-2.5 gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete permanently
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                activeData!.data.map((invoice) => {
                  const isLegalEscalation = invoice.paymentStatus !== 'Paid' && (invoice.urgencyTier === 'legal_escalation' || (invoice.daysOverdue !== undefined && invoice.daysOverdue > 30));

                  return (
                    <tr 
                      key={invoice.id} 
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className={`transition-colors hover:bg-[#181a22]/50 cursor-pointer ${
                        isLegalEscalation ? 'bg-red-950/20 hover:bg-red-950/30' : ''
                      }`}
                    >
                      <td className="p-3.5 px-4 align-middle font-medium text-[#f7f8f8]">
                        <div className="flex items-center gap-1.5">
                          {invoice.invoiceNo}
                          {isLegalEscalation && (
                            <span title="Legal Escalation (>30d Overdue)">
                              <Scale className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 px-4 align-middle">
                        <div className="font-medium text-[#f7f8f8]">{invoice.clientName}</div>
                        <div className="text-[11px] text-[#8a8f98]">{invoice.contactEmail}</div>
                      </td>
                      <td className="p-3.5 px-4 align-middle font-semibold text-[#f7f8f8]">
                        {formatCurrency(invoice.invoiceAmount)}
                      </td>
                      <td className="p-3.5 px-4 align-middle text-[#d0d6e0]">
                        <div>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                          {invoice.hasActivePaymentPlan && (
                            <span className="block text-[10px] text-purple-400 font-medium">
                              {invoice.activeInstallmentNumber ? `Inst #${invoice.activeInstallmentNumber} Due` : 'Payment Plan'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant={
                            invoice.paymentStatus === 'Paid' ? 'success' : 
                            invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
                          }>
                            {invoice.paymentStatus}
                          </Badge>

                          {isLegalEscalation && (
                            <Badge variant="danger" className="bg-red-500/10 text-red-400 border-red-500/30 font-medium">
                              Legal Escalation
                            </Badge>
                          )}

                          {invoice.hasActivePaymentPlan && (
                            <Badge variant="success" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                              Payment Plan
                            </Badge>
                          )}

                          {invoice.needsManualReview && (
                            <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30" title="Blocked due to DLQ failures">
                              Manual Review
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 px-4 align-middle">
                        {invoice.paymentStatus !== 'Paid' && invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                          <span className={`font-medium ${isLegalEscalation ? 'text-red-400 font-semibold' : 'text-amber-400'}`}>
                            {invoice.daysOverdue} days
                          </span>
                        ) : (
                          <span className="text-[#62666d]">0 days</span>
                        )}
                      </td>
                      <td className="p-3.5 px-4 align-middle text-[#d0d6e0]">
                        <span className="px-2 py-0.5 rounded-lg bg-[#13161c]/80 border border-[#1e2025] text-[11px]">
                          {invoice.followupCount} sent
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {activeData && activeData.pagination && activeData.pagination.totalPages > 0 && (
          <div className="flex items-center justify-between pt-3 text-xs">
            <div className="text-[#8a8f98]">
              Showing <span className="font-medium text-[#f7f8f8]">{((params.page || 1) - 1) * (params.limit || 50) + (activeData.pagination.total > 0 ? 1 : 0)}</span> to <span className="font-medium text-[#f7f8f8]">{Math.min((params.page || 1) * (params.limit || 50), activeData.pagination.total)}</span> of <span className="font-medium text-[#f7f8f8]">{activeData.pagination.total}</span> results
            </div>
            <div className="flex space-x-1.5">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={(params.page || 1) <= 1}
                className="inline-flex items-center justify-center rounded-lg transition-all border border-[#1e2025] bg-[#13161c]/80 text-[#f7f8f8] hover:bg-[#1d212a] h-7 w-7 p-0 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous page</span>
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.min(activeData.pagination.totalPages, (prev.page || 1) + 1) }))}
                disabled={(params.page || 1) >= activeData.pagination.totalPages}
                className="inline-flex items-center justify-center rounded-lg transition-all border border-[#1e2025] bg-[#13161c]/80 text-[#f7f8f8] hover:bg-[#1d212a] h-7 w-7 p-0 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next page</span>
              </button>
            </div>
          </div>
        )}

      <CreateInvoiceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      <ImportInvoiceModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
      <ConfirmDestructiveModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => {
          setIsConfirmDeleteModalOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={async () => {
          if (invoiceToDelete) {
            await hardDeleteMutation.mutateAsync(invoiceToDelete.id);
          }
        }}
        invoiceNo={invoiceToDelete?.invoiceNo || ""}
        clientName={invoiceToDelete?.clientName || ""}
        amountDisplay={invoiceToDelete ? formatCurrency(invoiceToDelete.invoiceAmount) : ""}
      />
    </div>
  );
}

