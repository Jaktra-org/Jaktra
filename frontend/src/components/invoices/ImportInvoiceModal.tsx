import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../ui/Modal";
import { invoiceService } from "../../services/invoice";
import { Upload, FileUp, XCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { getErrorMessage } from "../../utils/error-utils";

interface ImportInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportError {
  row: number;
  error: string;
}

export function ImportInvoiceModal({ isOpen, onClose }: ImportInvoiceModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<'skip' | 'update'>('skip');
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [importResult, setImportResult] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    errors: ImportError[];
  } | null>(null);

  const resetState = () => {
    setFile(null);
    setPreview([]);
    setPreviewHeaders([]);
    setError(null);
    setImportResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: () => invoiceService.importInvoices(file!, strategy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      setImportResult(data);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  const processFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];

    if (!ext || !allowedExtensions.includes(ext)) {
      setError("Only CSV and Excel (.xlsx, .xls) files are supported.");
      return;
    }
    setError(null);
    setFile(selectedFile);

    if (ext === 'csv') {
      // Preview CSV
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (results) => {
          if (results.meta.fields) {
            setPreviewHeaders(results.meta.fields);
          }
          setPreview(results.data as Record<string, string>[]);
        },
        error: (err) => {
          setError("Failed to parse CSV preview: " + getErrorMessage(err));
        }
      });
    } else {
      // Excel file, skip client-side preview to avoid heavy package bundling
      setPreview([]);
      setPreviewHeaders([]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) return;
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Invoices"
      description={!importResult ? "Upload a CSV or Excel file containing your invoices." : undefined}
      className="max-w-2xl"
    >
      {importResult ? (
        <div className="space-y-6 text-[#f7f8f8]">
          <div className="bg-[#27a644]/10 text-[#27a644] p-6 rounded-lg border border-[#27a644]/20 text-center flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-[#27a644] mb-3" />
            <h3 className="text-lg font-bold mb-1">Import Complete</h3>
            <p className="text-xs text-[#27a644]/90">
              Successfully processed your invoice file.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0e1013]/60 p-4 rounded-xl border border-[#1e2025] text-center">
              <div className="text-xl font-bold text-[#f7f8f8]">{importResult.imported}</div>
              <div className="text-xs text-[#8a8f98] font-medium">Imported</div>
            </div>
            <div className="bg-[#0e1013]/60 p-4 rounded-xl border border-[#1e2025] text-center">
              <div className="text-xl font-bold text-[#5e6ad2]">{importResult.updated}</div>
              <div className="text-xs text-[#5e6ad2] font-medium">Updated</div>
            </div>
            <div className="bg-[#0e1013]/60 p-4 rounded-xl border border-[#1e2025] text-center">
              <div className="text-xl font-bold text-amber-400">{importResult.skipped}</div>
              <div className="text-xs text-amber-400 font-medium">Skipped</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-red-400 flex items-center mb-2">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Errors ({importResult.errors.length})
              </h4>
              <div className="bg-red-950/40 p-3 rounded-xl border border-red-900/50 max-h-32 overflow-y-auto">
                <ul className="text-xs text-red-300 space-y-1">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="font-semibold w-12 flex-shrink-0">Row {err.row}:</span>
                      <span>{err.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#5e6ad2] rounded-xl hover:bg-[#828fff] transition-colors shadow-lg shadow-[#5e6ad2]/20"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-[#f7f8f8]">
          {error && (
            <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl text-xs flex items-start">
              <XCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging ? "border-[#5e6ad2] bg-[#5e6ad2]/10" : "border-[#1e2025]/80 hover:border-[#34343a] bg-[#0e1013]/40 hover:bg-[#0e1013]/60"
              }`}
              onClick={() => document.getElementById("csv-upload")?.click()}
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-2.5 bg-[#5e6ad2]/20 text-[#5e6ad2] rounded-full mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-[#f7f8f8] mb-1">Click to upload or drag and drop</p>
              <p className="text-[11px] text-[#8a8f98]">CSV and Excel files only. Required columns: invoice_no, client_name, invoice_amount, due_date, contact_email</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-[#1e2025]/80 rounded-xl bg-[#0e1013]/40">
                <div className="flex items-center overflow-hidden">
                  <FileUp className="w-4 h-4 text-[#5e6ad2] mr-2.5 flex-shrink-0" />
                  <span className="text-xs font-medium text-[#f7f8f8] truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#8a8f98] ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetState}
                  className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-full hover:bg-[#1d212a] transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {preview.length === 0 && file && (
                <div className="p-3 bg-[#5e6ad2]/10 text-[#828fff] border border-[#5e6ad2]/20 rounded-xl text-xs">
                  <strong>Note:</strong> Client-side preview is not available for Excel spreadsheets, but the file is loaded and ready to upload and process.
                </div>
              )}

              {preview.length > 0 && (
                <div className="border border-[#1e2025]/80 rounded-xl overflow-hidden bg-[#0e1013]/40">
                  <div className="bg-[#13161c]/80 px-3 py-1.5 text-[10px] font-semibold text-[#8a8f98] border-b border-[#1e2025] uppercase tracking-wider">
                    Data Preview (First 5 Rows)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#13161c]/60 border-b border-[#1e2025]">
                        <tr>
                          {previewHeaders.map((header, i) => (
                            <th key={i} className="px-3 py-1.5 font-medium text-[#8a8f98] whitespace-nowrap text-[11px]">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2025]/50 bg-transparent">
                        {preview.map((row, i) => (
                          <tr key={i}>
                            {previewHeaders.map((header, j) => (
                              <td key={j} className="px-3 py-1.5 text-[#d0d6e0] whitespace-nowrap truncate max-w-[150px] text-xs" title={row[header]}>
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-[#8a8f98]">Duplicate Handling Strategy</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-xs text-[#f7f8f8]">
                    <input
                      type="radio"
                      name="strategy"
                      value="skip"
                      checked={strategy === 'skip'}
                      onChange={() => setStrategy('skip')}
                      className="mr-2 text-[#5e6ad2] focus:ring-[#5e69d1]"
                    />
                    Skip existing (ignore)
                  </label>
                  <label className="flex items-center text-xs text-[#f7f8f8]">
                    <input
                      type="radio"
                      name="strategy"
                      value="update"
                      checked={strategy === 'update'}
                      onChange={() => setStrategy('update')}
                      className="mr-2 text-[#5e6ad2] focus:ring-[#5e69d1]"
                    />
                    Update existing records
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#1e2025]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#13161c]/80 border border-[#1e2025] rounded-xl hover:bg-[#1d212a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={mutation.isPending}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-white bg-[#5e6ad2] rounded-xl hover:bg-[#828fff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#5e6ad2]/20"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    "Upload and Process"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

}
