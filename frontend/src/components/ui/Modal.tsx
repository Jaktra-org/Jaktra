import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className = "max-w-lg" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    let originalOverflow = "";
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (isOpen) {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        ref={modalRef}
        className={`bg-[#0f1011] border border-[#23252a] text-[#f7f8f8] w-full rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#23252a]/70">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-[#f7f8f8] tracking-tight">{title}</h2>
            {description && <p className="text-xs text-[#8a8f98] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md hover:bg-[#141516] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 text-sm text-[#d0d6e0]">
          {children}
        </div>
      </div>
    </div>
  );
}

