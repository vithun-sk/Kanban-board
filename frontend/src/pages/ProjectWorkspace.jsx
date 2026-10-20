import React, { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/layouts/Breadcrumbs";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskRow from "@/components/tasks/TaskRow";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import ProjectForm from "@/components/projects/ProjectForm";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/dates";
import { TASK_STATUS } from "@/constants";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, members, updateProject, deleteProject, updateTask, deleteTask, submitting } = useApp();
  const { push } = useToast();
  const project = projects.find((item) => item.id === id);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [view, setView] = useState("board");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const projectTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.projectId !== id) return false;
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priority === "All" || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, id, search, priority]);

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project ID is not in the demo workspace."
        action={
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
          >
            Back to projects
          </button>
        }
      />
    );
  }

  const counts = {
    todo: projectTasks.filter((task) => task.status === TASK_STATUS.TODO).length,
    doing: projectTasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length,
    review: projectTasks.filter((task) => task.status === TASK_STATUS.IN_REVIEW).length,
    done: projectTasks.filter((task) => task.status === TASK_STATUS.DONE).length,
  };

  const selected = projectTasks.find((task) => task.id === selectedTask?.id) || selectedTask;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Projects", to: "/projects" }, { label: project.name }]} />
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="mt-2 max-w-3xl text-[var(--on-surface-variant)]">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--outline)]">
            <span>{project.status}</span>
            <span>{project.visibility}</span>
            <span>Due {formatDate(project.deadline)}</span>
            <span>{project.progress}% complete</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-[var(--error)] px-4 py-2 text-sm text-[var(--error)]"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} />
            Add task
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
          <div className="h-full bg-[var(--primary)]" style={{ width: `${project.progress}%` }} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Members</h2>
        <div className="flex flex-wrap gap-2">
          {project.memberList.map((member) => (
            <span
              key={member.id}
              className="flex items-center gap-2 rounded-full border border-[var(--outline-variant)] px-3 py-1 text-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] text-white">
                {member.initials}
              </span>
              {member.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">To Do · {counts.todo}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">In Progress · {counts.doing}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">In Review · {counts.review}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">Done · {counts.done}</div>
      </section>

      <section className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks on this board"
          aria-label="Search project tasks"
          className="w-full max-w-md rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2 text-sm"
          >
            <option value="All">All priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button
            type="button"
            onClick={() => setView("board")}
            className={`rounded-lg border px-3 py-2 ${view === "board" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--outline-variant)]"}`}
            aria-pressed={view === "board"}
          >
            <LayoutGrid size={16} />
            <span className="sr-only">Board view</span>
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg border px-3 py-2 ${view === "list" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--outline-variant)]"}`}
            aria-pressed={view === "list"}
          >
            <List size={16} />
            <span className="sr-only">List view</span>
          </button>
        </div>
      </section>

      <section className="mt-6">
        {view === "board" ? (
          <KanbanBoard
            tasks={projectTasks}
            onOpen={setSelectedTask}
            onMove={(taskId, status) => {
              updateTask(taskId, { status });
              push("Task moved in the demo workspace.");
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--outline-variant)]">
            {projectTasks.length === 0 ? (
              <EmptyState title="No tasks match these filters" />
            ) : (
              projectTasks.map((task) => <TaskRow key={task.id} task={task} onClick={setSelectedTask} />)
            )}
          </div>
        )}
      </section>

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
      {showCreate ? <CreateTaskModal projectId={project.id} onClose={() => setShowCreate(false)} /> : null}
      {editing ? (
        <Modal title="Edit project" onClose={() => setEditing(false)} closeOnBackdrop={false}>
          <ProjectForm
            initial={project}
            submitting={submitting}
            onCancel={() => setEditing(false)}
            onSubmit={(payload) => {
              updateProject(project.id, payload);
              push("Project updated in the demo workspace.");
              setEditing(false);
            }}
          />
        </Modal>
      ) : null}
      {confirmDelete ? (
        <ConfirmDialog
          title={`Delete ${project.name}?`}
          description="Tasks in this project will also be removed from the demo workspace."
          confirmLabel="Delete project"
          destructive
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteProject(project.id);
            push("Project deleted.");
            navigate("/projects");
          }}
        />
      ) : null}
    </div>
  );
};

export default ProjectWorkspace;
