import React from "react";
import Modal from "@/components/ui/Modal";
import TaskForm from "@/components/tasks/TaskForm";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const CreateTaskModal = ({ onClose, projectId }) => {
  const { projects, members, currentUser, isDemoMode, createTask, submitting } = useApp();
  const { push } = useToast();
  const canAssignProject = (project) =>
    isDemoMode ||
    Boolean(project?.createdById && currentUser?.id &&
      String(project.createdById) === String(currentUser.id));

  return (
    <Modal
      title="Create task"
      description="Add a task to your project workspace."
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <TaskForm
        initial={projectId ? { projectId } : undefined}
        projects={projects}
        members={members}
        submitting={submitting}
        submitLabel="Create task"
        canAssignProject={canAssignProject}
        onCancel={onClose}
        onSubmit={async (payload) => {
          try {
            const created = await createTask(payload);
            if (created) {
              push(`Task "${created.title}" created.`);
              onClose();
            }
          } catch (err) {
            push(err.message || "Failed to create the task.", "error");
          }
        }}
      />
    </Modal>
  );
};

export default CreateTaskModal;
