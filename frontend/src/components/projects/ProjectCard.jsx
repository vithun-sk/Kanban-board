import React from "react";
import { FolderKanban, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/dates";

const ProjectCard = ({ project, canManage = false, onOpen, onEdit, onDelete }) => {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 transition hover:border-[var(--primary)]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${project.color}22`, color: project.color }}
          >
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--on-surface-variant)]">
              {project.description}
            </p>
          </div>
        </button>
        {canManage ? (
          <div className="relative">
            <details className="group">
              <summary className="flex cursor-pointer list-none rounded-lg p-1 text-[var(--outline)] hover:text-[var(--on-surface)]">
                <MoreHorizontal size={20} />
                <span className="sr-only">Project actions</span>
              </summary>
              <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-bright)] shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-container)]"
                  onClick={onEdit}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--surface-container)]"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </div>
            </details>
          </div>
        ) : null}
      </div>

      <button type="button" onClick={onOpen} className="mt-5 text-left">
        <div className="flex items-center justify-between text-xs text-[var(--outline)]">
          <span>{project.members} members</span>
          <span>{project.tasks} tasks</span>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-[var(--on-surface-variant)]">Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              project.status === "Completed"
                ? "bg-emerald-500/15 text-emerald-600"
                : project.status === "On Hold"
                  ? "bg-amber-500/15 text-amber-600"
                  : "bg-indigo-500/15 text-indigo-600"
            }`}
          >
            {project.status}
          </span>
          <span className="truncate text-xs text-[var(--on-surface-variant)]">
            Due {formatDate(project.deadline)}
          </span>
        </div>
      </button>
    </article>
  );
};

export default ProjectCard;
