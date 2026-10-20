import React from "react";
import { FolderKanban, Clock3, CircleCheck, AlertTriangle, CheckSquare } from "lucide-react";

const cards = [
  { key: "totalProjects", label: "Total projects", icon: FolderKanban, hint: "Across this workspace" },
  { key: "totalTasks", label: "Total tasks", icon: CheckSquare, hint: "All tracked work" },
  { key: "inProgress", label: "In progress", icon: Clock3, hint: "Currently active" },
  { key: "completed", label: "Completed", icon: CircleCheck, hint: "Marked done" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, hint: "Past due and not done" },
];

const StatCard = ({ metrics }) => {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--on-surface-variant)]">{card.label}</p>
                <h2 className="mt-2 text-3xl font-bold">{metrics?.[card.key] ?? 0}</h2>
              </div>
              <div className="rounded-lg bg-[var(--primary)]/15 p-2.5 text-[var(--primary)]">
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--outline)]">{card.hint}</p>
          </div>
        );
      })}
    </section>
  );
};

export default StatCard;
