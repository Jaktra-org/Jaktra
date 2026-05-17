import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { invoiceService } from "../services/invoice";
import type { ListInvoicesParams, Invoice } from "../types/api";
import { Card } from "../components/ui/Card";
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
  RotateCcw
} from "lucide-react";
import { getErrorMessage } from "../utils/error-utils";
export function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useState<ListInvoicesParams>({
    page: 1,
    limit: 50,
    sort_by: 'createdAt',
    order: 'desc'
  });
  const [isTrashView, setIsTrashView] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return Boolean(window.history.state?.usr?.openCreateModal || searchParams.get('action') === 'create');
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (location.state?.openCreateModal || searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
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

  // Debounce search input
  useEffect(() => {
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
      status: status === 'All' ? undefined : [status]
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

  const currentStatus = isTrashView ? 'Trash' : (params.status?.[0] || 'All');

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
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] hover:border-[#34343a] h-9 px-3.5 disabled:opacity-40"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
              Export CSV
            </button>
          )}
          {user?.role !== 'viewer' && !isTrashView && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] hover:border-[#34343a] h-9 px-3.5"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
                Import CSV
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all bg-[#5e6ad2] text-white hover:bg-[#828fff] h-9 px-3.5"
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

      <Card className="flex flex-col border border-[#23252a] bg-[#0f1011]">
        {/* Filters */}
        <div className="p-3.5 border-b border-[#23252a] flex flex-col sm:flex-row gap-3 justify-between items-center bg-[#010102]/60">
          <div className="flex items-center space-x-1 bg-[#141516] p-1 rounded-md border border-[#23252a]">
            {['All', 'Pending', 'Overdue', 'Paid'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !isTrashView && currentStatus === status
                    ? 'bg-[#18191a] text-[#5e6ad2] border border-[#23252a] shadow-sm'
                    : 'text-[#8a8f98] hover:text-[#f7f8f8]'
                }`}
              >
                {status}
              </button>
            ))}
            <button
              onClick={handleTrashTab}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                isTrashView
                  ? 'bg-[#18191a] text-amber-400 border border-[#23252a] shadow-sm'
                  : 'text-[#8a8f98] hover:text-[#f7f8f8]'
              }`}
            >
              <Trash2 className="h-3 w-3" />
              Trash
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#62666d]" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex h-8.5 w-full rounded-md border border-[#23252a] bg-[#0f1011] px-3 py-1.5 pl-8.5 text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#5e69d1] focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-xs">
            <thead>
              <tr className="border-b border-[#23252a] bg-[#0f1011]">
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
            <tbody className="divide-y divide-[#23252a]/50">
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
                          <p className="text-xs mt-0.5">Adjust your filters or add a new invoice to get started.</p>
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
                      <div className="flex items-center gap-1.5">
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
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] text-[#f7f8f8] h-7 px-2.5 gap-1"
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
                              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-all border border-red-900/50 bg-red-950/30 hover:bg-red-900/40 text-red-400 h-7 px-2.5 gap-1"
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
                activeData!.data.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="transition-colors hover:bg-[#141516]/60 cursor-pointer"
                  >
                    <td className="p-3.5 px-4 align-middle font-medium text-[#f7f8f8]">
                      {invoice.invoiceNo}
                    </td>
                    <td className="p-3.5 px-4 align-middle">
                      <div className="font-medium text-[#f7f8f8]">{invoice.clientName}</div>
                      <div className="text-[11px] text-[#8a8f98]">{invoice.contactEmail}</div>
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#f7f8f8]">
                      {formatCurrency(invoice.invoiceAmount)}
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#d0d6e0]">
                      <div>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                        {invoice.hasActivePaymentPlan && (
                          <span className="block text-[10px] text-[#5e6ad2] font-medium">
                            {invoice.activeInstallmentNumber ? `Inst #${invoice.activeInstallmentNumber} Due` : 'Payment Plan'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 px-4 align-middle">
                      <div className="flex items-center gap-1.5">
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
                      </div>
                    </td>
                    <td className="p-3.5 px-4 align-middle">
                      {invoice.daysOverdue && invoice.daysOverdue > 0 ? (
                        <span className="font-medium text-red-400">{invoice.daysOverdue} days</span>
                      ) : (
                        <span className="text-[#62666d]">0 days</span>
                      )}
                    </td>
                    <td className="p-3.5 px-4 align-middle text-[#d0d6e0]">
                      {invoice.followupCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {activeData && activeData.pagination.totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#23252a] bg-[#010102]/60 text-xs">
            <div className="text-[#8a8f98]">
              Showing <span className="font-medium text-[#f7f8f8]">{(params.page! - 1) * params.limit! + 1}</span> to <span className="font-medium text-[#f7f8f8]">{Math.min(params.page! * params.limit!, activeData.pagination.total)}</span> of <span className="font-medium text-[#f7f8f8]">{activeData.pagination.total}</span> results
            </div>
            <div className="flex space-x-1.5">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={params.page === 1}
                className="inline-flex items-center justify-center rounded-md transition-all border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] h-7 w-7 p-0 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous page</span>
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.min(activeData!.pagination.totalPages, (prev.page || 1) + 1) }))}
                disabled={params.page === activeData!.pagination.totalPages}
                className="inline-flex items-center justify-center rounded-md transition-all border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] h-7 w-7 p-0 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next page</span>
              </button>
            </div>
          </div>
        )}
      </Card>

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

