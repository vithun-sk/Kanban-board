import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 text-center">
      <p className="text-sm font-semibold text-[var(--primary)]">404</p>
      <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-[var(--on-surface-variant)]">
        That route does not exist in FlowSync. Return to the landing page or your workspace.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm">
          Home
        </Link>
        <Link to="/home" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white">
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
