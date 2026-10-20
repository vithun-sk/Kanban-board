import React, { useState } from "react";
import { Field, inputClass } from "@/components/ui/Field";
import { PROJECT_STATUS_LIST, PROJECT_VISIBILITY } from "@/constants";
import { validateDateRange } from "@/lib/validation";

const ProjectForm = ({ initial, onSubmit, onCancel, submitting, submitLabel = "Save project" }) => {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState(initial?.status || "In Progress");
  const [visibility, setVisibility] = useState(initial?.visibility || PROJECT_VISIBILITY.TEAM);
  const [color, setColor] = useState(initial?.color || "#4f46e5");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Project name is required.";
    if (!validateDateRange(startDate, deadline)) {
      nextErrors.deadline = "Deadline must be on or after the start date.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ name, description, status, visibility, color, startDate, deadline });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Project name" htmlFor="project-name" error={errors.name}>
        <input
          id="project-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Description" htmlFor="project-description">
        <textarea
          id="project-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" htmlFor="project-start">
          <input
            id="project-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Deadline" htmlFor="project-deadline" error={errors.deadline}>
          <input
            id="project-deadline"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="project-status">
          <select
            id="project-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClass}
          >
            {PROJECT_STATUS_LIST.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Visibility" htmlFor="project-visibility">
          <select
            id="project-visibility"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className={inputClass}
          >
            {Object.values(PROJECT_VISIBILITY).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Color" htmlFor="project-color">
        <input
          id="project-color"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-16 cursor-pointer rounded border border-[var(--outline-variant)] bg-transparent"
        />
      </Field>
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

export default ProjectForm;
