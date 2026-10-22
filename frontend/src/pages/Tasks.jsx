import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import TaskRow from "@/components/tasks/TaskRow";
import TaskFilters from "@/components/tasks/TaskFilter";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { PRIORITY_RANK, TASK_STATUS } from "@/constants";
import { compareISODates } from "@/lib/dates";

const Tasks = () => {
  const { tasks, projects, members, currentUser, isDemoMode, updateTask, deleteTask } = useApp();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("latest");
  const [projectId, setProjectId] = useState("All");
  const [assigneeId, setAssigneeId] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const taskId = params.get("task");
    if (taskId) {
      const match = tasks.find((task) => task.id === taskId);
      if (match) setSelectedTask(match);
    }
  }, [params, tasks]);

  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const description = task.description || "";
      const matchesSearch =
        (task.title || "").toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "All" || task.status === status;
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesProject = projectId === "All" || task.projectId === projectId;
      const matchesAssignee = assigneeId === "All" || task.assigneeId === assigneeId;
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
    });

    const sorted = [...result];
    if (sort === "oldest") sorted.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    else if (sort === "priority") sorted.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9));
    else if (sort === "due") sorted.sort((a, b) => compareISODates(a.dueDate, b.dueDate));
    else if (sort === "title") sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else sorted.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return sorted;
  }, [tasks, search, status, priority, sort, projectId, assigneeId]);

  const selected = tasks.find((task) => task.id === selectedTask?.id) || null;

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">Track and manage work across every project.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus size={19} />
          Create task
        </button>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--outline)]">To Do</p>
          <h2 className="mt-2 text-3xl font-bold">
            {tasks.filter((task) => task.status === TASK_STATUS.TODO).length}
          </h2>
          <Clock3 className="mt-3 text-blue-500" size={21} />
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--outline)]">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold">
            {tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length}
          </h2>
          <AlertCircle className="mt-3 text-amber-500" size={21} />
        </div>
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
          <p className="text-sm text-[var(--outline)]">Done</p>
          <h2 className="mt-2 text-3xl font-bold">
            {tasks.filter((task) => task.status === TASK_STATUS.DONE).length}
          </h2>
          <CheckCircle2 className="mt-3 text-emerald-500" size={21} />
        </div>
      </section>

      <TaskFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        sort={sort}
        setSort={setSort}
        projectId={projectId}
        setProjectId={setProjectId}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        projects={projects}
        members={members}
      />

      <section className="mt-8 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)]">
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--outline)] md:grid">
          <span>Task</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Assignee</span>
          <span>Due</span>
        </div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskRow key={task.id} task={task} onClick={setSelectedTask} />)
        ) : (
          <EmptyState
            title="No tasks found"
            description="Try changing your search or filters, or create a new task."
            action={
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
              >
                Create task
              </button>
            }
          />
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
          currentUser={currentUser}
          isDemoMode={isDemoMode}
        />
      ) : null}
      {showCreate ? <CreateTaskModal onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
};

export default Tasks;
