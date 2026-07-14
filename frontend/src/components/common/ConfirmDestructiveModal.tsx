import { useState } from "react";
import { Modal } from "../ui/Modal";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getErrorMessage } from "../../utils/error-utils";

interface ConfirmDestructiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  invoiceNo: string;
  clientName: string;
  amountDisplay: string;
}

export function ConfirmDestructiveModal({
  isOpen,
  onClose,
  onConfirm,
  invoiceNo,
  clientName,
  amountDisplay
}: ConfirmDestructiveModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setInputValue("");
      setError(null);
      setIsSubmitting(false);
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue !== invoiceNo) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  const isConfirmed = inputValue === invoiceNo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Permanently Delete Invoice"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">This action is irreversible!</p>
            <p className="mt-0.5 text-red-700">
              Permanently deleting this invoice will remove all related transactions, payment links, and communication histories. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice No:</span>
            <span className="font-semibold text-slate-900">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Client:</span>
            <span className="font-medium text-slate-900">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount:</span>
            <span className="font-medium text-slate-900">{amountDisplay}</span>
          </div>
        </div>

        {/* Confirmation Input Form */}
        <form onSubmit={handleConfirm} className="space-y-3.5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              To confirm, type <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-red-700 font-semibold">{invoiceNo}</span> below:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter invoice number"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none h-10 px-4 py-2 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
