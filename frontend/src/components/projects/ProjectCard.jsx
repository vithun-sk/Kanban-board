import React from "react";
import { FolderKanban, MoreHorizontal } from "lucide-react";

const ProjectCard = ({ project }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div
        key={project.name}
        className="w-90 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-xl p-5 hover:border-[var(--primary)] transition cursor-pointer"
      >
        <div className="flex justify-between">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)]">
            <FolderKanban size={20} />
          </div>

          <button className="text-[var(--outline)] hover:text-[var(--on-surface)]">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <h3 className="font-semibold text-lg mt-4">{project.name}</h3>

        <p className="text-sm text-[var(--on-surface-variant)] mt-1 line-clamp-2">
          {project.description}
        </p>

        <div className="flex justify-between items-center mt-5 text-xs text-[var(--outline)]">
          <span>{project.members} members</span>
          <span>{project.tasks} tasks</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[var(--on-surface-variant)]">Progress</span>
            <span>{project.progress}%</span>
          </div>

          <div className="h-2 bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-row flex justify-between">
          <span
            className={`text-xs px-2.5 py-1 rounded-full ${
              project.status === "Completed"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-indigo-500/15 text-indigo-400"
            }`}
          >
            {project.status}
          </span>
          <span className="text-xs pt-1 text-[var(--on-surface-variant)]">
            {project.createdAt}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
