import React from "react";
import { Circle, CircleCheck } from "lucide-react";


const TaskRow = () => {
  const tasks = [
    {
      title: "Design authentication screens",
      project: "FlowSync",
      status: "In Progress",
      priority: "High",
    },
    {
      title: "Connect project API",
      project: "E-Commerce Platform",
      status: "To Do",
      priority: "Medium",
    },
    {
      title: "Fix responsive navbar",
      project: "FlowSync",
      status: "Completed",
      priority: "Low",
    },
    {
      title: "Implement payment flow",
      project: "E-Commerce Platform",
      status: "In Progress",
      priority: "High",
    },
  ];
  return (
    <div className="bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_180px_140px_100px] px-5 py-3 border-b border-[var(--outline-variant)] text-xs uppercase tracking-wide text-[var(--outline)]">
        <span>Task</span>
        <span>Project</span>
        <span>Status</span>
        <span>Priority</span>
      </div>

      {tasks.map((task, index) => (
        <div
          key={task.title}
          className={`grid grid-cols-[1fr_180px_140px_100px] items-center px-5 py-4 ${
            index !== tasks.length - 1
              ? "border-b border-[var(--outline-variant)]"
              : ""
          } hover:bg-[var(--surface-container-high)] transition`}
        >
          <div className="flex items-center gap-3">
            {task.status === "Completed" ? (
              <CircleCheck size={19} className="text-emerald-400" />
            ) : (
              <Circle size={19} className="text-[var(--outline)]" />
            )}

            <span className="text-sm font-medium">{task.title}</span>
          </div>

          <span className="text-sm text-[var(--on-surface-variant)]">
            {task.project}
          </span>

          <span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                task.status === "Completed"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : task.status === "In Progress"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-slate-500/15 text-slate-400"
              }`}
            >
              {task.status}
            </span>
          </span>

          <span
            className={`text-xs font-medium ${
              task.priority === "High"
                ? "text-red-400"
                : task.priority === "Medium"
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          >
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TaskRow;
