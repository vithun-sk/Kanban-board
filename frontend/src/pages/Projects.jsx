import React, { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import ProjectCard from "@/components/projects/ProjectCard";

const Projects = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const projects = [
    {
      id: "flowsync",
      name: "FlowSync",
      description:
        "Collaborative project management platform for modern teams.",
      members: 5,
      tasks: 24,
      progress: 72,
      status: "In Progress",
      createdAt: "Aug 10, 2026",
      color: "primary",
    },
    {
      id: "ecommerce",
      name: "E-Commerce Platform",
      description: "A scalable shopping platform with payments and analytics.",
      members: 8,
      tasks: 41,
      progress: 58,
      status: "In Progress",
      createdAt: "Aug 7, 2026",
      color: "secondary",
    },
    {
      id: "portfolio",
      name: "Portfolio Website",
      description: "Personal portfolio website with project case studies.",
      members: 3,
      tasks: 18,
      progress: 100,
      status: "Completed",
      createdAt: "Jul 28, 2026",
      color: "success",
    },
    {
      id: "task-manager",
      name: "Task Manager",
      description:
        "Simple productivity application for organizing daily tasks.",
      members: 4,
      tasks: 32,
      progress: 35,
      status: "In Progress",
      createdAt: "Jul 22, 2026",
      color: "primary",
    },
    {
      id: "ai-assistant",
      name: "AI Assistant",
      description: "AI-powered assistant for automating repetitive workflows.",
      members: 6,
      tasks: 29,
      progress: 15,
      status: "In Progress",
      createdAt: "Jul 15, 2026",
      color: "secondary",
    },
    {
      id: "landing-page",
      name: "Marketing Landing Page",
      description: "Landing page redesign for a SaaS product.",
      members: 2,
      tasks: 12,
      progress: 100,
      status: "Completed",
      createdAt: "Jul 5, 2026",
      color: "success",
    },
  ];
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || project.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex flex-row">
      <Sidebar />

      <main className="min-h-screen">
        <Topbar />
        <div className="p-8">
          <section className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="mt-2 text-[var(--on-surface-variant)]">
                Manage your projects and collaborate with your team.
              </p>
            </div>

            <button
              onClick={() => navigate("/projects/create")}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-lg"
            >
              <Plus size={19} />
              New Project
            </button>
          </section>

          <section className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Total Projects
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">{projects.length}</h2>
                </div>
                <div className="rounded-lg bg-[var(--primary)]/15 p-3 text-[var(--primary)]">
                  <FolderKanban size={19} />
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--outline)]">
                All Projects
              </p>
            </div>

            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <p className="text-sm text-[var(--on-surface-variant)]">
                Active Projects
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {
                  projects.filter((project) => project.status === "In Progress")
                    .length
                }
              </h2>

              <p className="mt-2 text-xs text-[var(--outline)]">
                Currently in progress
              </p>
            </div>

            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <p className="text-sm text-[var(--on-surface-variant)]">
                Completed Projects
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {
                  projects.filter((project) => project.status === "Completed")
                    .length
                }
              </h2>

              <p className="mt-2 text-xs text-emerald-400">
                Successfully completed
              </p>
            </div>
          </section>

          <section className="mt-8 flex items-center justify-between gap-4 ">
            <div className="relative max-w-md flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--outline)]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex items-center gap-3">
              <SlidersHorizontal size={18} className="text-[var(--outline)]" />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="All">All Projects</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">All Projects</h2>
                <p className="mt-1 text-sm text-[var(--outline)]">
                  {filteredProjects.length} projects found
                </p>
              </div>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="cursor-pointer"
                  >
                    <ProjectCard project={project} />
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container)]">
                <div className="rounded-full bg-[var(--surface-container-high)] p-4 text-[var(--outline)]">
                  <FolderKanban size={28} />
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  No projects found
                </h3>

                <p className="mt-1 text-sm text-[var(--outline)]">
                  Try changing your search or filter.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className=" cursor-pointer mt-4 text-sm font-medium text-[var(--primary)] hover:opacity-85"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Projects;
