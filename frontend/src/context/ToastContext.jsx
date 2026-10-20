import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createId } from "@/lib/ids";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message, tone = "info") => {
    const id = createId("toast");
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[2000] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              toast.tone === "error"
                ? "border-[var(--error)] bg-[var(--error-container)] text-[var(--on-error-container)]"
                : "border-[var(--outline-variant)] bg-[var(--surface-bright)] text-[var(--on-surface)]"
            }`}
          >
            <p>{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-1 hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
