import { useState } from "react";
import { Modal } from "../ui/Modal";
import { ToneSelector } from "../agent/ToneSelector";
import type { Invoice } from "../../types/api";

interface TriggerFollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tone: string) => void;
  invoice: Invoice;
  isPending: boolean;
}

const toneLabels: Record<string, string> = {
  stage_1_warm: 'Warm (Stage 1)',
  stage_2_firm: 'Firm (Stage 2)',
  stage_3_serious: 'Serious (Stage 3)',
  stage_4_stern: 'Stern (Stage 4)',
};

export function TriggerFollowupModal({
  isOpen,
  onClose,
  onConfirm,
  invoice,
  isPending,
}: TriggerFollowupModalProps) {
  const recommendedTone = invoice.urgencyTier;
  const isRecommendedValid = !!(recommendedTone && recommendedTone in toneLabels);
  const initialTone = isRecommendedValid ? recommendedTone! : "";
  const [selectedTone, setSelectedTone] = useState<string>(initialTone);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInvoiceId, setPrevInvoiceId] = useState(invoice.id);
  if (isOpen !== prevIsOpen || invoice.id !== prevInvoiceId) {
    setPrevIsOpen(isOpen);
    setPrevInvoiceId(invoice.id);
    if (isOpen) {
      setSelectedTone(isRecommendedValid ? recommendedTone! : "");
    }
  }

  const getNoRecommendationReason = () => {
    if (invoice.paymentStatus === 'Paid') {
      return "Invoice is already paid";
    }
    
    if (invoice.daysOverdue !== undefined && invoice.daysOverdue >= 31) {
      return "Invoice or installment has escalated to legal status";
    }

    if (invoice.hasActivePaymentPlan) {
      return "Next installment schedule is not yet due (outside 7-day reminder window)";
    }

    const due = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffMs = today.getTime() - due.getTime();
    const daysOverdueCalculated = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysOverdueCalculated < 0) {
      const daysUntilDue = -daysOverdueCalculated;
      if (daysUntilDue > 7) {
        return `Invoice is not yet due and falls outside the 7-day pre-due threshold; due in ${daysUntilDue} days`;
      }
    }
    
    return "Invoice has not been processed by the triage engine yet";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTone) return;
    onConfirm(selectedTone);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trigger Follow-up"
      description="Review the communication details before sending a follow-up to the client."
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-[#f7f8f8]">
        {/* Recommended Tone Indicator */}
        <div className="rounded-xl p-4 bg-[#010102] border border-[#23252a]">
          <div className="space-y-2">
            {isRecommendedValid ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#f7f8f8]">Triage Engine Recommendation</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5e6ad2]/20 text-[#828fff] border border-[#5e6ad2]/40 uppercase tracking-wider">
                    AI Recommendation
                  </span>
                </div>
                <p className="text-xs text-[#8a8f98]">
                  Based on current payment status and invoice age, the AI suggests the following tone:
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-[#18191c] text-[#f7f8f8] border border-[#34343a]">
                    {toneLabels[recommendedTone!]}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#f7f8f8]">No Recommended Tone</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                    Notice
                  </span>
                </div>
                <p className="text-xs text-[#8a8f98] leading-relaxed">
                  ({getNoRecommendationReason()}).
                </p>
              </>
            )}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-1.5 pb-2">
          <label htmlFor="modal-tone-select" className="text-xs font-bold text-[#f7f8f8] block">
            Communication Tone
          </label>
          <ToneSelector
            id="modal-tone-select"
            value={selectedTone}
            onChange={setSelectedTone}
            includeAuto={false}
            placeholder="Select Tone"
            placement="top"
            className="w-full"
          />
          {!isRecommendedValid && !selectedTone && (
            <p className="text-xs text-red-400 font-medium pt-1">
              Please select a tone before proceeding.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#23252a] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#8a8f98] hover:text-[#f7f8f8] bg-transparent border border-[#23252a] rounded-xl hover:bg-[#18191c] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !selectedTone}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[#010102] bg-[#f7f8f8] rounded-xl hover:bg-[#e1e4e8] active:bg-[#d0d6e0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
          >
            {isPending ? "Sending..." : "Send Follow-up"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
