import React from "react";
import { FolderKanban, Clock3, CircleCheck, CheckSquare } from "lucide-react";

const StatCard = () => {
  return (
    <section className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Total Projects
            </p>
            <h2 className="text-3xl font-bold mt-2">8</h2>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
            <FolderKanban size={20} />
          </div>
        </div>
        <p className="text-xs text-emerald-400 mt-4">+2 this month</p>
      </div>

      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Active Projects
            </p>
            <h2 className="text-3xl font-bold mt-2">4</h2>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Clock3 size={20} />
          </div>
        </div>
        <p className="text-xs text-[var(--outline)] mt-4">
          Currently in progress
        </p>
      </div>

      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--on-surface-variant)]">
              Completed
            </p>
            <h2 className="text-3xl font-bold mt-2">3</h2>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <CircleCheck size={20} />
          </div>
        </div>
        <p className="text-xs text-emerald-400 mt-4">+1 this month</p>
      </div>

      <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[var(--on-surface-variant)]">My Tasks</p>
            <h2 className="text-3xl font-bold mt-2">24</h2>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400">
            <CheckSquare size={20} />
          </div>
        </div>
        <p className="text-xs text-amber-400 mt-4">7 need attention</p>
      </div>
    </section>
  );
};

export default StatCard;
