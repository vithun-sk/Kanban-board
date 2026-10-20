import React from "react";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/dates";

const priorityStyles = {
  Urgent: "text-red-700 bg-red-500/10",
  High: "text-red-600 bg-red-400/10",
  Medium: "text-amber-700 bg-amber-400/10",
  Low: "text-emerald-700 bg-emerald-400/10",
};

const statusStyles = {
  "To Do": "text-slate-700 bg-slate-400/10",
  "In Progress": "text-blue-700 bg-blue-400/10",
  "In Review": "text-violet-700 bg-violet-400/10",
  Done: "text-emerald-700 bg-emerald-400/10",
};

const TaskRow = ({ task, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(task)}
      className="grid w-full grid-cols-1 items-center gap-3 border-b border-[var(--outline-variant)] px-5 py-4 text-left transition hover:bg-[var(--surface-container-high)] md:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
    >
      <div className="min-w-0">
        <h3 className="font-medium">{task.title}</h3>
        <p className="mt-1 truncate text-xs text-[var(--outline)]">{task.projectName}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(task.labels || []).map((label) => (
            <span
              key={label}
              className="rounded-full bg-[var(--surface-container-highest)] px-2 py-1 text-[10px] font-medium text-[var(--on-surface-variant)]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status] || ""}`}>
          {task.status}
        </span>
      </div>
      <div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority] || ""}`}>
          {task.priority}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
          {task.assigneeInitials}
        </div>
        <span className="text-sm">{task.assignee}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs ${task.overdue ? "text-[var(--error)]" : "text-[var(--outline)]"}`}>
        <CalendarDays size={13} />
        {formatDate(task.dueDate)}
        {task.overdue ? " · Overdue" : ""}
      </div>
    </button>
  );
};

export default TaskRow;
