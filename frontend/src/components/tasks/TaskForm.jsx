import React, { useState } from "react";
import { Field, inputClass } from "@/components/ui/Field";
import { LABEL_OPTIONS, TASK_PRIORITY_LIST, TASK_STATUS_LIST } from "@/constants";
import { validateDateRange } from "@/lib/validation";

const TaskForm = ({
  initial,
  projects,
  members,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = "Save task",
  canAssignProject = () => false,
}) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [projectId, setProjectId] = useState(initial?.projectId || projects[0]?.id || "");
  const [status, setStatus] = useState(initial?.status || "To Do");
  const [priority, setPriority] = useState(initial?.priority || "Medium");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId || "");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [labels, setLabels] = useState(initial?.labels || []);
  const [errors, setErrors] = useState({});
  const selectedProject = projects.find(
    (project) => String(project.id) === String(projectId),
  );
  const canAssign = canAssignProject(selectedProject);
  const projectMemberIds = new Set([
    ...(selectedProject?.memberList || []).map((membership) => String(membership.userId)),
    ...(selectedProject?.memberIds || []).map(String),
    ...(selectedProject?.createdById ? [String(selectedProject.createdById)] : []),
  ]);
  const projectMembers = members.filter((member) => projectMemberIds.has(String(member.id)));

  const toggleLabel = (label) => {
    setLabels((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Task title is required.";
    if (!projectId) nextErrors.projectId = "Select a project.";
    if (!validateDateRange(startDate, dueDate)) {
      nextErrors.dueDate = "Due date must be on or after the start date.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const payload = {
      title,
      description,
      projectId,
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      labels,
    };
    if (canAssign) payload.assigneeId = assigneeId || null;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title" htmlFor="task-title" error={errors.title}>
        <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
      </Field>
      <Field label="Description" htmlFor="task-description">
        <textarea
          id="task-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project" htmlFor="task-project" error={errors.projectId}>
          <select
            id="task-project"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className={inputClass}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        {canAssign ? (
          <Field label="Assignee" htmlFor="task-assignee">
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="task-status">
          <select id="task-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
            {TASK_STATUS_LIST.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority" htmlFor="task-priority">
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className={inputClass}
          >
            {TASK_PRIORITY_LIST.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" htmlFor="task-start">
          <input
            id="task-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Due date" htmlFor="task-due" error={errors.dueDate}>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Labels</legend>
        <div className="flex flex-wrap gap-2">
          {LABEL_OPTIONS.map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={labels.includes(label)}
                onChange={() => toggleLabel(label)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA] disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
