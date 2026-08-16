import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/projects/ProjectCard";
import TaskRow from "@/components/dashboard/TaskRow";

const Home = () => {
  const navigate = useNavigate();
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
  ];

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex flex-row">
      <div>
        <Sidebar />
      </div>
      <main className="min-h-screen min-w-0">
        <Topbar />
        {/* Welcome Message */}
        <div className="p-8">
          <section className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm text-[var(--outline)] mb-1">
                Sunday, August 16, 2026
              </p>
              <h1 className="text-3xl font-bold">
                Welcome back, Vithun
                <span className="ml-2">👋</span>
              </h1>
              <p className="text-[var(--on-surface-variant)] mt-2">
                Here's what's happening across your workspace today.
              </p>
            </div>
            <button
              onClick={() => navigate("/projects")}
              className="cursor-pointer flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#4338CA] transition"
            >
              <Plus size={19} />
              Create Project
            </button>
          </section>
          {/* Stats */}
          <StatCard />
          {/* Projects */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Recent Projects</h2>
                <p className="text-sm text-[var(--outline)] mt-1">
                  Your recently active projects
                </p>
              </div>
              <button
                onClick={() => navigate("/projects")}
                className="text-sm text-[var(--primary)] hover:opacity-85 cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {projects.map((project) => (
                <div key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </section>
          {/* Tasks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">My Tasks</h2>
                <p className="text-sm text-[var(--outline)] mt-1">
                  Tasks assigned to you across projects
                </p>
              </div>

              <button
                onClick={() => navigate("/tasks")}
                className="text-sm text-[var(--primary)] hover:opacity-85 cursor-pointer "
              >
                View all
              </button>
            </div>
            <TaskRow />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
