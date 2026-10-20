import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

// Modal stack to ensure Escape key only closes the topmost open modal
const modalStack = [];

const Modal = ({
  title,
  description,
  onClose,
  children,
  wide = false,
  closeOnBackdrop = true,
}) => {
  const generatedId = useId();
  const titleId = `modal-title-${generatedId.replace(/:/g, "")}`;
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const entry = {
      close: () => onCloseRef.current?.(),
    };
    modalStack.push(entry);

    const onKey = (event) => {
      if (event.key === "Escape") {
        const top = modalStack[modalStack.length - 1];
        if (top === entry) {
          event.stopPropagation();
          entry.close();
        }
      }
    };

    document.addEventListener("keydown", onKey);

    // Initial focus on dialog
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      const index = modalStack.indexOf(entry);
      if (index !== -1) {
        modalStack.splice(index, 1);
      }
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] shadow-2xl outline-none ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--outline-variant)] p-5">
          <div>
            {title ? (
              <h2 id={titleId} className="text-xl font-bold">
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
