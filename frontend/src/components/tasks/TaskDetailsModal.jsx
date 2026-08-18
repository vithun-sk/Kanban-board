import React from "react";
import { X, CalendarDays, MessageCircle, UserRound } from "lucide-react";

const TaskDetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[var(--outline-variant)] p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--primary)]">
              Task Details
            </p>

            <h2 className="mt-2 text-2xl font-bold">{task.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--outline)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-sm font-semibold">Description</h3>

            <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
              {task.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
              <p className="text-xs text-[var(--outline)]">Status</p>
              <p className="mt-2 font-medium">{task.status}</p>
            </div>

            <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
              <p className="text-xs text-[var(--outline)]">Priority</p>
              <p className="mt-2 font-medium">{task.priority}</p>
            </div>

            <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
              <p className="flex items-center gap-2 text-xs text-[var(--outline)]">
                <UserRound size={14} />
                Assignee
              </p>
              <p className="mt-2 font-medium">{task.assignee}</p>
            </div>

            <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
              <p className="flex items-center gap-2 text-xs text-[var(--outline)]">
                <CalendarDays size={14} />
                Due Date
              </p>
              <p className="mt-2 font-medium">{task.dueDate}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Labels</h3>

            <div className="mt-3 flex gap-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs text-[var(--primary)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--outline-variant)] pt-5 text-sm text-[var(--outline)]">
            <MessageCircle size={17} />
            {task.comments} comments
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;