import React from "react";

export function Field({ label, htmlFor, error, hint, children }) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
      ) : null}
      {children}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-[var(--outline)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30";
