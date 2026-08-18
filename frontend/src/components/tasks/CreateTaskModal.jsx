import React, { useState } from "react";
import { X } from "lucide-react";

const CreateTaskModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      projectId: "flowsync",
      title,
      description,
      status,
      priority,
      assignee: "Vithun S K",
      assigneeInitials: "VS",
      labels: ["New"],
      dueDate: "Not assigned",
      createdAt: new Date().toLocaleDateString(),
      comments: 0,
    };

    onCreate(newTask);
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--outline-variant)] p-6">
          <div>
            <h2 className="text-xl font-bold">Create Task</h2>
            <p className="mt-1 text-sm text-[var(--outline)]">
              Add a new task to your workspace.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--outline)] hover:bg-[var(--surface-container-high)]"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="text-sm font-medium">Task Title</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="mt-2 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows="4"
              className="mt-2 w-full resize-none rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Bugs</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--primary)] py-3 font-medium text-white transition hover:bg-[#4338CA]"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;