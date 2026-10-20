import React from "react";
import Modal from "@/components/ui/Modal";
import TaskForm from "@/components/tasks/TaskForm";
import { useApp } from "@/context/AppContext";

const CreateTaskModal = ({ onClose, projectId }) => {
  const { projects, members, createTask, submitting } = useApp();

  return (
    <Modal
      title="Create task"
      description="Add a task to the shared demo workspace."
      onClose={onClose}
      closeOnBackdrop={false}
    >
      <TaskForm
        initial={projectId ? { projectId } : undefined}
        projects={projects}
        members={members}
        submitting={submitting}
        submitLabel="Create task"
        onCancel={onClose}
        onSubmit={async (payload) => {
          const created = await createTask(payload);
          if (created) onClose();
        }}
      />
    </Modal>
  );
};

export default CreateTaskModal;
