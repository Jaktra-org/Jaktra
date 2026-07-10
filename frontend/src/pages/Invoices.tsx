import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { invoiceService } from "../services/invoice";
import type { ListInvoicesParams } from "../types/api";
import { Card } from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "../components/ui/Badge";
import { CreateInvoiceModal } from "../components/invoices/CreateInvoiceModal";
import { ImportInvoiceModal } from "../components/invoices/ImportInvoiceModal";
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
  Trash2
} from "lucide-react";
import { getErrorMessage } from "../utils/error-utils";
export function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useState<ListInvoicesParams>({
    page: 1,
    limit: 50,
    sort_by: 'createdAt',
    order: 'desc'
  });
  const [isTrashView, setIsTrashView] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
    if (params.sort_by !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400" />;
    return params.order === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 text-blue-600" /> : <ArrowDown className="ml-1 h-3 w-3 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">Manage your collection portfolio and track aging accounts.</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isTrashView && (
            <button
              onClick={handleExportCSV}
              disabled={!activeData?.data || activeData.data.length === 0}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </button>
          )}
          {user?.role !== 'viewer' && !isTrashView && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {isError_ && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Failed to load invoices</h4>
            <p className="text-sm mt-1">{getErrorMessage(error_)}</p>
          </div>
        </div>
      )}

      <Card className="flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md">
            {['All', 'Pending', 'Overdue', 'Paid'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                  !isTrashView && currentStatus === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
            <button
              onClick={handleTrashTab}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center gap-1.5 ${
                isTrashView
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Trash
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-slate-50/50">
              <tr className="border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('invoiceNo')}>
                  <div className="flex items-center">Invoice No {renderSortIcon('invoiceNo')}</div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('clientName')}>
                  <div className="flex items-center">Client {renderSortIcon('clientName')}</div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('invoiceAmount')}>
                  <div className="flex items-center">Amount {renderSortIcon('invoiceAmount')}</div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center">Due Date {renderSortIcon('dueDate')}</div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('paymentStatus')}>
                  <div className="flex items-center">Status {renderSortIcon('paymentStatus')}</div>
                </th>
                {isTrashView ? (
                  <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                    <div className="flex items-center">Deleted On</div>
                  </th>
                ) : (
                  <>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                      <div className="flex items-center">Days Overdue</div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500 cursor-pointer select-none hover:text-slate-900" onClick={() => handleSort('followupCount')}>
                      <div className="flex items-center">Follow-ups {renderSortIcon('followupCount')}</div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading_ ? (
                <tr>
                  <td colSpan={isTrashView ? 6 : 7} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                      <p>{isTrashView ? 'Loading trash...' : 'Loading invoices...'}</p>
                    </div>
                  </td>
                </tr>
              ) : isError_ ? (
                <tr>
                  <td colSpan={isTrashView ? 6 : 7} className="p-8 text-center text-red-500">
                    Failed to load {isTrashView ? 'trash' : 'invoices'}. Please try again.
                  </td>
                </tr>
              ) : !activeData?.data || activeData.data.length === 0 ? (
                <tr>
                  <td colSpan={isTrashView ? 6 : 7} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      {isTrashView ? (
                        <>
                          <Trash2 className="h-12 w-12 text-slate-300 mb-4" />
                          <p className="text-lg font-medium text-slate-900">Trash is empty</p>
                          <p className="text-sm">Deleted invoices will appear here.</p>
                        </>
                      ) : (
                        <>
                          <FileText className="h-12 w-12 text-slate-300 mb-4" />
                          <p className="text-lg font-medium text-slate-900">No invoices found</p>
                          <p className="text-sm">Adjust your filters or add a new invoice to get started.</p>
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
                    className="border-b transition-colors hover:bg-amber-50/60 cursor-pointer opacity-75"
                  >
                    <td className="p-4 align-middle font-medium text-slate-500">
                      {invoice.invoiceNo}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-medium text-slate-600">{invoice.clientName}</div>
                      <div className="text-xs text-slate-400">{invoice.contactEmail}</div>
                    </td>
                    <td className="p-4 align-middle text-slate-500">
                      {formatCurrency(invoice.invoiceAmount)}
                    </td>
                    <td className="p-4 align-middle text-slate-400">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'success' :
                        invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-slate-400 text-sm">
                      {invoice.deletedAt
                        ? new Date(invoice.deletedAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                activeData!.data.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="border-b transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="p-4 align-middle font-medium text-slate-900">
                      {invoice.invoiceNo}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="font-medium text-slate-900">{invoice.clientName}</div>
                      <div className="text-xs text-slate-500">{invoice.contactEmail}</div>
                    </td>
                    <td className="p-4 align-middle">
                      {formatCurrency(invoice.invoiceAmount)}
                    </td>
                    <td className="p-4 align-middle text-slate-600">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'success' : 
                        invoice.paymentStatus === 'Overdue' ? 'danger' : 'warning'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {invoice.daysOverdue ? (
                        <span className="font-medium text-red-600">{invoice.daysOverdue} days</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-slate-600">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{(params.page! - 1) * params.limit! + 1}</span> to <span className="font-medium">{Math.min(params.page! * params.limit!, activeData.pagination.total)}</span> of <span className="font-medium">{activeData.pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={params.page === 1}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </button>
              <button
                onClick={() => setParams(prev => ({ ...prev, page: Math.min(activeData!.pagination.totalPages, (prev.page || 1) + 1) }))}
                disabled={params.page === activeData!.pagination.totalPages}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
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
    </div>
  );
}
