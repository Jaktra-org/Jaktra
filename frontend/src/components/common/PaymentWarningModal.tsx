import { useState } from 'react';
import { CreditCard, AlertTriangle, X } from 'lucide-react';

interface PaymentWarningModalProps {
  onConfirm: (skipInFuture: boolean) => void;
  onCancel: () => void;
}

export function PaymentWarningModal({ onConfirm, onCancel }: PaymentWarningModalProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#010102]/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#0f1011] rounded-xl shadow-none border border-[#23252a] w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-150 text-[#f7f8f8]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-950/40 border border-amber-900/50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#f7f8f8]">Payment Integration Not Configured</h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#8a8f98] hover:text-[#f7f8f8] transition-colors rounded-md p-1 hover:bg-[#141516]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-4">
          <div className="flex items-start gap-2.5 p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              Payment integration is not configured. Invoice emails will be sent{' '}
              <strong className="text-amber-200">without a payment link</strong>, which may impact customer payment collection.
              Do you want to continue?
            </p>
          </div>

          {/* Don't ask again */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              id="dont-ask-payment-warning"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-4 h-4 rounded border-[#23252a] bg-[#010102] accent-[#f7f8f8] cursor-pointer"
            />
            <span className="text-xs text-[#8a8f98] group-hover:text-[#f7f8f8] transition-colors">
              Don't ask me again
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-[#010102] rounded-b-xl border-t border-[#23252a]">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] bg-transparent border border-[#23252a] rounded-xl hover:bg-[#18191c] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(dontAskAgain)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#010102] bg-[#f7f8f8] rounded-xl hover:bg-[#e1e4e8] active:bg-[#d0d6e0] transition-colors cursor-pointer shadow-xs"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

