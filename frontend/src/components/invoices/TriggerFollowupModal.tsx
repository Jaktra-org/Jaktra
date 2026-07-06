import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { ToneSelector } from "../agent/ToneSelector";
import { Loader2, Zap, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) {
      setSelectedTone(isRecommendedValid ? recommendedTone! : "");
    }
  }, [isOpen, recommendedTone, isRecommendedValid]);

  const getNoRecommendationReason = () => {
    if (invoice.paymentStatus === 'Paid') {
      return "Invoice is already paid";
    }
    
    if (invoice.daysOverdue !== undefined && invoice.daysOverdue >= 31) {
      return "Invoice has escalated to legal status";
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recommended Tone Indicator */}
        <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
          <div className="flex items-start space-x-3">
            {isRecommendedValid ? (
              <>
                <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Triage Engine Recommendation</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Based on current payment status and invoice age, the AI suggests the following tone:
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {toneLabels[recommendedTone!]}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">No Recommended Tone</h4>
                  <p className="text-xs text-slate-500 mt-1">
                  ({getNoRecommendationReason()}).
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label htmlFor="modal-tone-select" className="text-sm font-medium text-slate-700 block">
            Communication Tone
          </label>
          <ToneSelector
            id="modal-tone-select"
            value={selectedTone}
            onChange={setSelectedTone}
            includeAuto={false}
            placeholder="Select Tone"
            className="w-full h-10 border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {!isRecommendedValid && !selectedTone && (
            <p className="text-xs text-red-500 font-medium mt-1">
              Please select a tone before proceeding.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !selectedTone}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
              </>
            ) : (
              "Send Follow-up"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
