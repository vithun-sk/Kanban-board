import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/projects/ProjectCard";
import TaskRow from "@/components/tasks/TaskRow";
import { projects } from "@/Data/projectsData";
import { tasks } from "@/Data/tasksData";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";

const Home = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState();

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();

      const dateOptions = {
         month: "long",
        day: "numeric",
        weekday: "long",
        year: "numeric",
       
      };

      setCurrentDate(now.toLocaleDateString('en-US' , dateOptions))
    };

    updateDate();
  }, []);
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
                {currentDate}
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
              {projects.slice(-3).map((project) => (
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
            <div className="mt-8 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--outline)]">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Assignee</span>
                <span>Due / Comments</span>
              </div>
              {tasks.slice(-4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="cursor-pointer"
                >
                  <TaskRow task={task} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Home;
