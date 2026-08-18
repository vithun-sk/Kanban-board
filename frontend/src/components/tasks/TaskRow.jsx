import React from "react";
import { CalendarDays, MessageCircle } from "lucide-react";


const TaskRow = ({ task, onClick }) => {
  const priorityStyles = {
    High: "text-red-400 bg-red-400/10",
    Medium: "text-amber-400 bg-amber-400/10",
    Low: "text-emerald-400 bg-emerald-400/10",
  };

  const statusStyles = {
    "To Do": "text-slate-300 bg-slate-400/10",
    "In Progress": "text-blue-400 bg-blue-400/10",
    Completed: "text-emerald-400 bg-emerald-400/10",
    Bugs: "text-red-400 bg-red-400/10",
  };

  return (
    <div
      onClick={() => onClick(task)}
      className="grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-[var(--outline-variant)] px-5 py-4 transition hover:bg-[var(--surface-container-high)]"
    >
      <div>
        <h3 className="font-medium">{task.title}</h3>

        <div className="mt-2 flex gap-2">
          {task.labels.map((label) => (
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
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      <div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
          {task.assigneeInitials}
        </div>

        <span className="text-sm">{task.assignee}</span>
      </div>

      <div className="flex flex-col gap-2 text-xs text-[var(--outline)]">
        <span className="flex items-center gap-1">
          <CalendarDays size={13} />
          {task.dueDate}
        </span>

        <span className="flex items-center gap-1">
          <MessageCircle size={13} />
          {task.comments}
        </span>
      </div>
    </div>
  );
};

export default TaskRow;