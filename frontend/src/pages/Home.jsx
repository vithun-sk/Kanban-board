import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TaskRow from "@/components/tasks/TaskRow";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { CURRENT_USER_ID, TASK_STATUS } from "@/constants";
import { compareISODates, formatDate, todayISO } from "@/lib/dates";

const Home = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    projects,
    tasks,
    activity,
    metrics,
    members,
    updateProject,
    deleteProject,
    updateTask,
    deleteTask,
    submitting,
  } = useApp();
  const { push } = useToast();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const myId = currentUser.id === "demo-user" ? CURRENT_USER_ID : currentUser.id;
  const myTasks = tasks.filter((task) => task.assigneeId === myId).slice(0, 5);
  const recentProjects = projects.slice(0, 3);
  const upcoming = useMemo(() => {
    const today = todayISO();
    return tasks
      .filter((task) => task.dueDate && task.status !== TASK_STATUS.DONE && task.dueDate >= today)
      .sort((a, b) => compareISODates(a.dueDate, b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  const distribution = [
    { label: "To Do", value: metrics.todo, color: "bg-slate-400" },
    { label: "In Progress", value: metrics.inProgress, color: "bg-blue-500" },
    { label: "In Review", value: metrics.inReview, color: "bg-violet-500" },
    { label: "Done", value: metrics.completed, color: "bg-emerald-500" },
  ];
  const total = Math.max(metrics.totalTasks, 1);

  const selected = tasks.find((task) => task.id === selectedTask?.id) || null;

  return (
    <div>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-[var(--outline)]">{dateLabel}</p>
          <h1 className="text-3xl font-bold">Welcome back, {currentUser.name.split(" ")[0]}</h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg border border-[var(--outline-variant)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--surface-container)]"
          >
            Create task
          </button>
          <button
            type="button"
            onClick={() => navigate("/projects/create")}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white transition hover:bg-[#4338CA]"
          >
            <Plus size={19} />
            Create project
          </button>
        </div>
      </section>

      <StatCard metrics={metrics} />

      <section className="mb-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <h2 className="text-lg font-semibold">Task status</h2>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
            {distribution.map((item) => (
              <div
                key={item.label}
                className={item.color}
                style={{ width: `${(item.value / total) * 100}%` }}
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {distribution.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                {item.label} ({item.value})
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <h2 className="text-lg font-semibold">Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--outline)]">No upcoming due dates.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="w-full text-left text-sm hover:text-[var(--primary)]"
                    onClick={() => setSelectedTask(task)}
                  >
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-[var(--outline)]">
                      {formatDate(task.dueDate)} · {task.projectName}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent projects</h2>
            <p className="mt-1 text-sm text-[var(--outline)]">Your recently active projects</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View all
          </button>
        </div>
        {recentProjects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create a project to start organizing work."
            action={
              <button
                type="button"
                onClick={() => navigate("/projects/create")}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
              >
                Create project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/projects/${project.id}`)}
                onEdit={() => setEditingProject(project)}
                onDelete={() => setDeletingProject(project)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">My tasks</h2>
            <p className="mt-1 text-sm text-[var(--outline)]">Tasks assigned to you</p>
          </div>
          <button type="button" onClick={() => navigate("/tasks")} className="text-sm text-[var(--primary)] hover:underline">
            View all
          </button>
        </div>
        {myTasks.length === 0 ? (
          <EmptyState title="No assigned tasks" description="Tasks assigned to you will appear here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)]">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--outline)] md:grid">
              <span>Task</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Due</span>
            </div>
            {myTasks.map((task) => (
              <TaskRow key={task.id} task={task} onClick={setSelectedTask} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[var(--outline)]">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {activity.slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-lg border border-[var(--outline-variant)] px-4 py-3 text-sm">
                {item.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {editingProject ? (
        <Modal title="Edit project" onClose={() => setEditingProject(null)} closeOnBackdrop={false}>
          <ProjectForm
            initial={editingProject}
            submitting={submitting}
            onCancel={() => setEditingProject(null)}
            onSubmit={async (payload) => {
              await updateProject(editingProject.id, payload);
              push("Project updated.");
              setEditingProject(null);
            }}
          />
        </Modal>
      ) : null}

      {deletingProject ? (
        <ConfirmDialog
          title={`Delete ${deletingProject.name}?`}
          description="This will remove the project and its associated tasks from the workspace."
          confirmLabel="Delete project"
          destructive
          onClose={() => setDeletingProject(null)}
          onConfirm={async () => {
            await deleteProject(deletingProject.id);
            push("Project deleted.");
            setDeletingProject(null);
          }}
        />
      ) : null}

      {selected ? (
        <TaskDetailsModal
          task={selected}
          members={members}
          projects={projects}
          onClose={() => setSelectedTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      ) : null}
      {showCreate ? <CreateTaskModal onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
};

export default Home;
