import React, { useEffect, useState } from "react";
import { CalendarDays, UserRound } from "lucide-react";
import Modal from "@/components/ui/Modal";
import TaskForm from "@/components/tasks/TaskForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TASK_PRIORITY_LIST, TASK_STATUS_LIST } from "@/constants";
import { formatDate } from "@/lib/dates";
import { Field, inputClass } from "@/components/ui/Field";

const TaskDetailsModal = ({
  task,
  onClose,
  onSave,
  onDelete,
  members = [],
  projects = [],
  submitting = false,
}) => {
  const [draft, setDraft] = useState(task);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(task);
    setEditing(false);
  }, [task]);

  if (!task) return null;

  return (
    <>
      <Modal
        title={editing ? "Edit task" : "Task details"}
        description={task.projectName}
        onClose={onClose}
        wide
        closeOnBackdrop={!editing}
      >
        {editing ? (
          <TaskForm
            key={task.id}
            initial={task}
            projects={projects}
            members={members}
            submitting={submitting}
            onCancel={() => setEditing(false)}
            onSubmit={(payload) => {
              onSave(task.id, payload);
              setEditing(false);
            }}
          />
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-2xl font-bold">{draft.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">
                {draft.description || "No description provided."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" htmlFor="details-status">
                <select
                  id="details-status"
                  value={draft.status}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, status: event.target.value }));
                    onSave(task.id, { status: event.target.value });
                  }}
                  className={inputClass}
                >
                  {TASK_STATUS_LIST.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority" htmlFor="details-priority">
                <select
                  id="details-priority"
                  value={draft.priority}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, priority: event.target.value }));
                    onSave(task.id, { priority: event.target.value });
                  }}
                  className={inputClass}
                >
                  {TASK_PRIORITY_LIST.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
                <p className="flex items-center gap-2 text-xs text-[var(--outline)]">
                  <UserRound size={14} />
                  Assignee
                </p>
                <p className="mt-2 font-medium">{draft.assignee}</p>
              </div>
              <div className="rounded-xl bg-[var(--surface-container-high)] p-4">
                <p className="flex items-center gap-2 text-xs text-[var(--outline)]">
                  <CalendarDays size={14} />
                  Due date
                </p>
                <p className={`mt-2 font-medium ${draft.overdue ? "text-[var(--error)]" : ""}`}>
                  {formatDate(draft.dueDate)}
                  {draft.overdue ? " · Overdue" : ""}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Labels</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(draft.labels || []).length === 0 ? (
                  <span className="text-sm text-[var(--outline)]">No labels</span>
                ) : (
                  draft.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs text-[var(--primary)]"
                    >
                      {label}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--outline-variant)] pt-5">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--error)]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA]"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </Modal>
      {confirmDelete ? (
        <ConfirmDialog
          title="Delete this task?"
          description="This removes the task from the demo workspace. You can reset demo data later from Settings."
          confirmLabel="Delete task"
          destructive
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => {
            onDelete(task.id);
            setConfirmDelete(false);
            onClose();
          }}
        />
      ) : null}
    </>
  );
};

export default TaskDetailsModal;
