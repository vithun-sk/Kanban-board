import React, { useState } from "react";
import { formatDate } from "@/lib/dates";
import { TASK_STATUS_LIST } from "@/constants";

const priorityStyles = {
  Urgent: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

const KanbanCard = ({ task, onOpen, onStatusChange }) => {
  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/task-id", task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      className={`rounded-lg border bg-[var(--surface-bright)] p-3 shadow-sm ${
        task.overdue ? "border-[var(--error)]" : "border-[var(--outline-variant)]"
      }`}
    >
      <button type="button" onClick={() => onOpen(task)} className="w-full text-left">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={`h-2 w-2 rounded-full ${priorityStyles[task.priority] || "bg-slate-400"}`} />
          <span className="text-[10px] uppercase tracking-wide text-[var(--outline)]">{task.priority}</span>
        </div>
        <h3 className="font-medium">{task.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-[var(--outline)]">{task.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {(task.labels || []).slice(0, 2).map((label) => (
            <span key={label} className="rounded bg-[var(--surface-container)] px-2 py-0.5 text-[10px]">
              {label}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--outline)]">
          <span>{task.assigneeInitials}</span>
          <span className={task.overdue ? "text-[var(--error)]" : ""}>
            {formatDate(task.dueDate, { month: "short", day: "numeric" })}
          </span>
        </div>
      </button>
      <label className="sr-only" htmlFor={`status-${task.id}`}>
        Change status
      </label>
      <select
        id={`status-${task.id}`}
        value={task.status}
        onChange={(event) => onStatusChange(task.id, event.target.value)}
        className="mt-3 w-full rounded-md border border-[var(--outline-variant)] bg-[var(--surface)] px-2 py-1 text-xs"
      >
        {TASK_STATUS_LIST.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </article>
  );
};

const KanbanBoard = ({ tasks, onOpen, onMove }) => {
  const [overStatus, setOverStatus] = useState(null);

  const handleDrop = (event, status) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id");
    setOverStatus(null);
    if (taskId) onMove(taskId, status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {TASK_STATUS_LIST.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              setOverStatus(status);
            }}
            onDragLeave={() => setOverStatus(null)}
            onDrop={(event) => handleDrop(event, status)}
            className={`flex min-h-[24rem] w-72 shrink-0 flex-col rounded-xl border p-3 ${
              overStatus === status
                ? "border-[var(--primary)] bg-[var(--primary-container)]/40"
                : "border-[var(--outline-variant)] bg-[var(--surface-container)]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{status}</h2>
              <span className="text-xs text-[var(--outline)]">{columnTasks.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {columnTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--outline-variant)] px-3 py-8 text-center text-sm text-[var(--outline)]">
                  No tasks in {status}.
                </p>
              ) : (
                columnTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onOpen={onOpen}
                    onStatusChange={(id, nextStatus) => onMove(id, nextStatus)}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
