import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({
  title,
  description,
  onClose,
  children,
  wide = false,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] shadow-2xl ${wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--outline-variant)] p-5">
          <div>
            {title ? (
              <h2 id="modal-title" className="text-xl font-bold">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-[var(--outline)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-[var(--outline)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
