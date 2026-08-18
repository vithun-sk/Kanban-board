import React, { useMemo, useState } from "react";
import { Plus, CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import TaskRow from "@/components/tasks/TaskRow";
import TaskFilters from "@/components/tasks/TaskFilter";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import { tasks as initialTasks } from "@/Data/tasksData";

const MyTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("latest");

  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" || task.status === status;

      const matchesPriority = priority === "All" || task.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    if (sort === "oldest") {
      return [...result].reverse();
    }

    if (sort === "priority") {
      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
      };

      return [...result].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    }

    return result;
  }, [tasks, search, status, priority, sort]);

  const handleCreateTask = (newTask) => {
    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setShowCreateModal(false);
  };

  const todoCount = tasks.filter((task) => task.status === "To Do").length;
  const progressCount = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex flex-row">
      <div>
        <Sidebar />
      </div>
      <main className="min-h-screen flex flex-col flex-1">
        <Topbar />
        <div className="p-8">
          <section className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Tasks</h1>

              <p className="mt-2 text-[var(--on-surface-variant)]">
                Track and manage all your assigned tasks.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-lg"
            >
              <Plus size={19} />
              Create Task
            </button>
          </section>

          <section className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--outline)]">To Do</p>

                  <h2 className="mt-2 text-3xl font-bold">{todoCount}</h2>
                </div>

                <div className="rounded-lg bg-blue-400/10 p-3 text-blue-400">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--outline)]">In Progress</p>

                  <h2 className="mt-2 text-3xl font-bold">{progressCount}</h2>
                </div>

                <div className="rounded-lg bg-amber-400/10 p-3 text-amber-400">
                  <AlertCircle size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--outline)]">Completed</p>

                  <h2 className="mt-2 text-3xl font-bold">{completedCount}</h2>
                </div>

                <div className="rounded-lg bg-emerald-400/10 p-3 text-emerald-400">
                  <CheckCircle2 size={21} />
                </div>
              </div>
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
          />

          <section className="mt-8 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--outline)]">
              <span>Task</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Assignee</span>
              <span>Due / Comments</span>
            </div>

            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskRow key={task.id} task={task} onClick={setSelectedTask} />
              ))
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center">
                <h3 className="text-lg font-semibold">No tasks found</h3>

                <p className="mt-2 text-sm text-[var(--outline)]">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

export default MyTasks;
