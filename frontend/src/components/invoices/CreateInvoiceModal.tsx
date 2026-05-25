import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../ui/Modal";
import { invoiceService } from "../../services/invoice";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "../../utils/error-utils";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose }: CreateInvoiceModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    invoiceNo: "",
    clientName: "",
    invoiceAmount: "",
    dueDate: "",
    contactEmail: "",
    subject: "",
  });

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof invoiceService.createInvoice>[0]) => invoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-aging"] });
      onClose();
      setFormData({
        invoiceNo: "",
        clientName: "",
        invoiceAmount: "",
        dueDate: "",
        contactEmail: "",
        subject: "",
      });
      setError(null);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.invoiceNo || !formData.clientName || !formData.invoiceAmount || !formData.dueDate || !formData.contactEmail) {
      setError("Please fill out all fields.");
      return;
    }
    
    const payload = {
      ...formData,
      invoiceAmount: parseFloat(formData.invoiceAmount as string),
      subject: formData.subject.trim() || undefined,
    };
    
    // Additional basic validations could go here
    mutation.mutate(payload);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Invoice"
      description="Manually add a single invoice to the system."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-[#f7f8f8]">
        {error && (
          <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 rounded-md text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="invoiceNo" className="text-xs font-medium text-[#8a8f98]">Invoice Number</label>
            <input
              id="invoiceNo"
              name="invoiceNo"
              type="text"
              required
              value={formData.invoiceNo}
              onChange={handleChange}
              placeholder="INV-001"
              className="flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="dueDate" className="text-xs font-medium text-[#8a8f98]">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className="flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="clientName" className="text-xs font-medium text-[#8a8f98]">Client Name</label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            required
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Acme Corp"
            className="flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] transition-colors"
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
            placeholder="billing@acmecorp.com"
            className="flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] transition-colors"
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
            placeholder="1500.00"
            className="flex h-9 w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-1.5 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="subject" className="text-xs font-medium text-[#8a8f98]">
            Invoice Description <span className="text-[#62666d] font-normal">(optional)</span>
          </label>
          <textarea
            id="subject"
            name="subject"
            rows={2}
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Web Development Services – Q1 2026"
            maxLength={500}
            className="flex w-full rounded-xl border border-[#23252a] bg-[#010102] px-3 py-2 text-xs text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] resize-none transition-colors"
          />
          <p className="text-[11px] text-[#62666d]">What this invoice is for — used to personalise follow-up emails.</p>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-[#23252a]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] bg-transparent border border-[#23252a] rounded-xl hover:bg-[#18191c] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-[#010102] bg-[#f7f8f8] rounded-xl hover:bg-[#e1e4e8] active:bg-[#d0d6e0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              "Save Invoice"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

}
