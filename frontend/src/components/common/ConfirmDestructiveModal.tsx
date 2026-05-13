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
      <div className="space-y-4 text-[#f7f8f8]">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-red-300">This action is irreversible!</p>
            <p className="mt-0.5 text-red-400/90">
              Permanently deleting this invoice will remove all related transactions, payment links, and communication histories. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="p-3 bg-[#010102] border border-[#23252a] rounded-lg space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[#8a8f98]">Invoice No:</span>
            <span className="font-semibold text-[#f7f8f8]">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8f98]">Client:</span>
            <span className="font-medium text-[#f7f8f8]">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8f98]">Amount:</span>
            <span className="font-medium text-[#f7f8f8]">{amountDisplay}</span>
          </div>
        </div>

        {/* Confirmation Input Form */}
        <form onSubmit={handleConfirm} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#8a8f98]">
              To confirm, type <span className="font-mono bg-[#141516] border border-[#23252a] px-1.5 py-0.5 rounded text-red-400 font-semibold">{invoiceNo}</span> below:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter invoice number"
              className="flex h-9 w-full rounded-md border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-[#23252a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-[#23252a] bg-[#0f1011] hover:bg-[#141516] text-[#f7f8f8] h-8 px-3.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isSubmitting}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:pointer-events-none h-8 px-3.5 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
