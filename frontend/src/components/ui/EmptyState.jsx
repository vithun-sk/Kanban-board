import React from "react";

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container)] px-6 py-10 text-center">
      {icon ? (
        <div className="rounded-full bg-[var(--surface-container-high)] p-4 text-[var(--outline)]">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--outline)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
