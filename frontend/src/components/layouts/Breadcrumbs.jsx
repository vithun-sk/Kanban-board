import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({ items = [] }) => {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[var(--outline)]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-[var(--primary)]">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-[var(--on-surface)]" : ""}>{item.label}</span>
              )}
              {!last ? <ChevronRight size={14} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
