import React from "react";
import Modal from "@/components/ui/Modal";

const ConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal title={title} description={description} onClose={onClose} closeOnBackdrop={false}>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-container-high)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            destructive ? "bg-[var(--error)] hover:opacity-90" : "bg-[var(--primary)] hover:bg-[#4338CA]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
