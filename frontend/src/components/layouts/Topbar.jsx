import React, { useMemo, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const Topbar = ({ onMenu }) => {
  const navigate = useNavigate();
  const { currentUser, unreadCount, projects, tasks } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return { projects: [], tasks: [] };
    return {
      projects: projects
        .filter(
          (project) =>
            (project.name || "").toLowerCase().includes(value) ||
            (project.description || "").toLowerCase().includes(value),
        )
        .slice(0, 5),
      tasks: tasks
        .filter(
          (task) =>
            (task.title || "").toLowerCase().includes(value) ||
            (task.description || "").toLowerCase().includes(value),
        )
        .slice(0, 5),
    };
  }, [query, projects, tasks]);

  const hasResults = results.projects.length + results.tasks.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--outline-variant)] bg-[var(--surface)] px-4 sm:h-20 sm:px-8">
      <button
        type="button"
        className="rounded-lg p-2 lg:hidden"
        aria-label="Open navigation"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>

      <div className="relative min-w-0 flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 180)}
          placeholder="Search projects and tasks"
          aria-label="Search projects and tasks"
          className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)]"
        />
        {open && query.trim() ? (
          <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-bright)] shadow-lg">
            {!hasResults ? (
              <p className="px-4 py-3 text-sm text-[var(--outline)]">No matching projects or tasks.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto py-2">
                {results.projects.length > 0 ? (
                  <div>
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--outline)]">
                      Projects
                    </p>
                    {results.projects.map((project) => (
                      <button
                        type="button"
                        key={project.id}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-container)]"
                        onMouseDown={() => {
                          navigate(`/projects/${project.id}`);
                          setQuery("");
                        }}
                      >
                        {project.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                {results.tasks.length > 0 ? (
                  <div className="mt-2">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--outline)]">
                      Tasks
                    </p>
                    {results.tasks.map((task) => (
                      <button
                        type="button"
                        key={task.id}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-container)]"
                        onMouseDown={() => {
                          navigate(`/tasks?task=${task.id}`);
                          setQuery("");
                        }}
                      >
                        {task.title}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => navigate("/notifications")}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className="relative rounded-lg p-2 text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
      >
        <Bell size={21} />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--primary)]" />
        ) : null}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex items-center gap-3 rounded-lg p-1"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
            {currentUser.initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-xs text-[var(--outline)]">{currentUser.title || currentUser.role}</p>
          </div>
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-bright)] shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-container)]"
              onClick={() => {
                setMenuOpen(false);
                navigate("/settings");
              }}
            >
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-container)]"
              onClick={() => {
                setMenuOpen(false);
                navigate("/notifications");
              }}
            >
              Notifications
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Topbar;
