import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../ui/Modal";
import { invoiceService } from "../../services/invoice";
import type { Invoice } from "../../types/api";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "../../utils/error-utils";

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export function EditInvoiceModal({ isOpen, onClose, invoice }: EditInvoiceModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientName: invoice.clientName,
    invoiceAmount: invoice.invoiceAmount,
    dueDate: invoice.dueDate.split('T')[0],
    contactEmail: invoice.contactEmail,
    subject: invoice.subject ?? "",
  });

  const [prevInvoice, setPrevInvoice] = useState(invoice);
  if (invoice.id !== prevInvoice.id || invoice.updatedAt !== prevInvoice.updatedAt) {
    setPrevInvoice(invoice);
    setFormData({
      clientName: invoice.clientName,
      invoiceAmount: invoice.invoiceAmount,
      dueDate: invoice.dueDate.split('T')[0],
      contactEmail: invoice.contactEmail,
      subject: invoice.subject ?? "",
    });
  }

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof invoiceService.updateInvoice>[1]) => invoiceService.updateInvoice(invoice.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice.id] });
      queryClient.invalidateQueries({ queryKey: ["invoice-timeline", invoice.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      onClose();
      setError(null);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.clientName || !formData.invoiceAmount || !formData.dueDate || !formData.contactEmail) {
      setError("Please fill out all fields.");
      return;
    }
    
    const payload = {
      ...formData,
      invoiceAmount: parseFloat(formData.invoiceAmount as string),
      subject: formData.subject.trim() || null,
    };
    
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Invoice ${invoice.invoiceNo}`}
      description="Update client details or amounts."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-[#f7f8f8]">
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="clientName" className="text-xs font-medium text-[#8a8f98]">Client Name</label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            required
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Client or Company Name"
            className="flex h-9 w-full rounded-xl border border-[#1e2025] bg-[#0e1013]/60 px-3 py-1.5 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contactEmail" className="text-xs font-medium text-[#8a8f98]">Contact Email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="billing@example.com"
            className="flex h-9 w-full rounded-xl border border-[#1e2025] bg-[#0e1013]/60 px-3 py-1.5 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="dueDate" className="text-xs font-medium text-[#8a8f98]">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className="flex h-9 w-full rounded-xl border border-[#1e2025] bg-[#0e1013]/60 px-3 py-1.5 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="invoiceAmount" className="text-xs font-medium text-[#8a8f98]">Amount ($)</label>
            <input
              id="invoiceAmount"
              name="invoiceAmount"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.invoiceAmount}
              onChange={handleChange}
              placeholder="0.00"
              className="flex h-9 w-full rounded-xl border border-[#1e2025] bg-[#0e1013]/60 px-3 py-1.5 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-xs font-medium text-[#8a8f98]">
            Invoice Description <span className="text-[#8a8f98]/60 font-normal">(optional)</span>
          </label>
          <textarea
            id="subject"
            name="subject"
            rows={2}
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Web Development Services – Q1 2026"
            maxLength={500}
            className="flex w-full rounded-xl border border-[#1e2025] bg-[#0e1013]/60 px-3 py-2 text-xs text-[#f7f8f8] placeholder-[#8a8f98] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] resize-none transition-colors"
          />
          <p className="text-[11px] text-[#8a8f98]/80">What this invoice is for — used to personalise follow-up emails.</p>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-[#1e2025]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#f7f8f8] bg-[#13161c] border border-[#1e2025] rounded-xl hover:bg-[#1d212a] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#5e6ad2] hover:bg-[#4b55c4] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.98] cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

}
