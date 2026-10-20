import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/layouts/Breadcrumbs";
import ProjectForm from "@/components/projects/ProjectForm";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { createProject, submitting } = useApp();
  const { push } = useToast();

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { label: "Projects", to: "/projects" },
          { label: "Create project" },
        ]}
      />
      <h1 className="text-3xl font-bold">Create project</h1>
      <p className="mt-2 mb-8 text-[var(--on-surface-variant)]">
        Add a new project to your workspace.
      </p>
      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6">
        <ProjectForm
          submitting={submitting}
          submitLabel="Create project"
          onCancel={() => navigate("/projects")}
          onSubmit={async (payload) => {
            const project = await createProject(payload);
            if (project) {
              push("Project created successfully.");
              navigate(`/projects/${project.id}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProjectCreate;
