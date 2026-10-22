import React, { useEffect, useState } from "react";
import { CalendarDays, UserRound } from "lucide-react";
import Modal from "@/components/ui/Modal";
import TaskForm from "@/components/tasks/TaskForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
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
  currentUser,
  isDemoMode = false,
}) => {
  const { push } = useToast();
  const [draft, setDraft] = useState(task);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(task);
    setEditing(false);
  }, [task]);

  if (!task) return null;

  const project = projects.find((item) => String(item.id) === String(task.projectId));
  const isProjectLeader =
    isDemoMode ||
    Boolean(project?.createdById && currentUser?.id &&
      String(project.createdById) === String(currentUser.id));
  const canAssignProject = (taskProject) =>
    String(taskProject?.id) === String(task.projectId) &&
    (isDemoMode ||
      Boolean(
        taskProject?.createdById &&
          currentUser?.id &&
          String(taskProject.createdById) === String(currentUser.id),
      ));

  const handleQuickUpdate = async (patch) => {
    const previous = draft;
    setDraft((current) => ({ ...current, ...patch }));
    try {
      await onSave(task.id, patch);
    } catch (err) {
      setDraft(previous);
      push(err.message || "Failed to update the task.", "error");
    }
  };

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
            submitting={submitting || saving}
            canAssignProject={canAssignProject}
            onCancel={() => setEditing(false)}
            onSubmit={async (payload) => {
              setSaving(true);
              try {
                await onSave(task.id, payload);
                setEditing(false);
                push("Task updated.");
              } catch (err) {
                push(err.message || "Failed to update the task.", "error");
              } finally {
                setSaving(false);
              }
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
                  onChange={(event) => handleQuickUpdate({ status: event.target.value })}
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
                  onChange={(event) => handleQuickUpdate({ priority: event.target.value })}
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
              {isProjectLeader ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--error)]"
                >
                  Delete
                </button>
              ) : null}
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
          description="This will permanently delete this task from the project."
          confirmLabel="Delete task"
          destructive
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            try {
              await onDelete(task.id);
              push("Task deleted.");
              setConfirmDelete(false);
              onClose();
            } catch (err) {
              push(err.message || "Failed to delete the task.", "error");
              setConfirmDelete(false);
            }
          }}
        />
      ) : null}
    </>
  );
};

export default TaskDetailsModal;
