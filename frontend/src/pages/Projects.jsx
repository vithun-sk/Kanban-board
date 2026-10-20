import React, { useMemo, useState } from "react";
import { FolderKanban, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PROJECT_STATUS_LIST } from "@/constants";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject, submitting } = useApp();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("recent");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filteredProjects = useMemo(() => {
    const result = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || project.status === filter;
      return matchesSearch && matchesFilter;
    });
    return [...result].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "deadline") return (a.deadline || "").localeCompare(b.deadline || "");
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
  }, [projects, search, filter, sort]);

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">
            Manage your projects and collaborate with your team.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/projects/create")}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus size={19} />
          New project
        </button>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--on-surface-variant)]">Total projects</p>
          <h2 className="mt-2 text-3xl font-bold">{projects.length}</h2>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--on-surface-variant)]">Active</p>
          <h2 className="mt-2 text-3xl font-bold">
            {projects.filter((project) => project.status === "In Progress").length}
          </h2>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--on-surface-variant)]">Completed</p>
          <h2 className="mt-2 text-3xl font-bold">
            {projects.filter((project) => project.status === "Completed").length}
          </h2>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SlidersHorizontal size={18} className="text-[var(--outline)]" />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
          >
            <option value="All">All projects</option>
            {PROJECT_STATUS_LIST.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
          >
            <option value="recent">Recently updated</option>
            <option value="name">Name</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
      </section>

      <section className="mt-8">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/projects/${project.id}`)}
                onEdit={() => setEditing(project)}
                onDelete={() => setDeleting(project)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FolderKanban size={28} />}
            title={projects.length === 0 ? "No projects yet" : "No projects found"}
            description={
              projects.length === 0
                ? "Create a project to start using the board."
                : "Try a different search or filter."
            }
            action={
              projects.length === 0 ? (
                <button
                  type="button"
                  onClick={() => navigate("/projects/create")}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
                >
                  Create project
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="text-sm font-medium text-[var(--primary)]"
                >
                  Clear filters
                </button>
              )
            }
          />
        )}
      </section>

      {editing ? (
        <Modal title="Edit project" onClose={() => setEditing(null)} closeOnBackdrop={false}>
          <ProjectForm
            initial={editing}
            submitting={submitting}
            onCancel={() => setEditing(null)}
            onSubmit={async (payload) => {
              updateProject(editing.id, payload);
              push("Project updated in the demo workspace.");
              setEditing(null);
            }}
          />
        </Modal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          description="This also removes tasks in this project from the demo workspace."
          confirmLabel="Delete project"
          destructive
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            deleteProject(deleting.id);
            push("Project deleted from the demo workspace.");
            setDeleting(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default Projects;
