import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { TASK_PRIORITY_LIST, TASK_STATUS_LIST } from "@/constants";

const TaskFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  sort,
  setSort,
  projectId,
  setProjectId,
  assigneeId,
  setAssigneeId,
  projects = [],
  members = [],
}) => {
  return (
    <section className="mt-8 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
        />
      </div>
      <SlidersHorizontal size={18} className="text-[var(--outline)]" />
      {setProjectId ? (
        <select
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          aria-label="Filter by project"
          className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
        >
          <option value="All">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      ) : null}
      {setAssigneeId ? (
        <select
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          aria-label="Filter by assignee"
          className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
        >
          <option value="All">All assignees</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      ) : null}
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        aria-label="Filter by status"
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="All">All status</option>
        {TASK_STATUS_LIST.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        aria-label="Filter by priority"
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="All">All priority</option>
        {TASK_PRIORITY_LIST.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(event) => setSort(event.target.value)}
        aria-label="Sort tasks"
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="due">Due date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </section>
  );
};

export default TaskFilters;
