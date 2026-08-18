import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const TaskFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  sort,
  setSort,
}) => {
  return (
    <section className="mt-8 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[280px] flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
        />
      </div>

      <div className="flex items-center gap-2 text-[var(--outline)]">
        <SlidersHorizontal size={18} />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="All">All Status</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Bugs">Bugs</option>
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="All">All Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="priority">Priority</option>
      </select>
    </section>
  );
};

export default TaskFilters;