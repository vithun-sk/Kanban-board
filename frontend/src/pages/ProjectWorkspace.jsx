import React, { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, MessageSquare, Plus, UserPlus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/layouts/Breadcrumbs";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskRow from "@/components/tasks/TaskRow";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import ProjectForm from "@/components/projects/ProjectForm";
import TeamChat from "@/components/messages/TeamChat";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { formatDate, relativeTime } from "@/lib/dates";
import { isValidEmail } from "@/lib/validation";
import { MEMBER_ROLES, TASK_STATUS } from "@/constants";
import { findUserByEmail } from "@/services/membersService";
import {
  cancelProjectInvitation,
  listProjectInvitations,
} from "@/services/invitationsService";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    members,
    notifications,
    conversations,
    currentUser,
    updateProject,
    deleteProject,
    updateTask,
    deleteTask,
    addProjectMember,
    removeProjectMember,
    sendInvitation,
    markNotificationRead,
    openTeamConversation,
    submitting,
    isDemoMode,
  } = useApp();
  const { push } = useToast();
  const project = projects.find((item) => String(item.id) === String(id));
  const projectId = project?.id;
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [view, setView] = useState("board");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("Member");
  const [memberError, setMemberError] = useState(null);
  const [memberLookup, setMemberLookup] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const [projectInvitations, setProjectInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const projectConversation = useMemo(() => {
    const fromApi = conversations.find((conversation) => conversation.projectId === project?.id);
    return fromApi || null;
  }, [conversations, project?.id]);

  useEffect(() => {
    if (!project) return;
    if (chatConversationId) return;
    if (projectConversation) {
      setChatConversationId(projectConversation.id);
    }
  }, [project, projectConversation, chatConversationId]);

  const handleOpenChat = async () => {
    setChatError(null);
    setChatLoading(true);
    try {
      const conversation = await openTeamConversation(project.id);
      setChatConversationId(conversation?.id || null);
      setChatOpen(true);
      const unreadProjectMessages = notifications.filter(
        (item) =>
          !item.read &&
          item.type === "message" &&
          item.relatedType === "project" &&
          String(item.relatedId) === String(project.id),
      );
      try {
        await Promise.all(unreadProjectMessages.map((item) => markNotificationRead(item.id)));
      } catch (err) {
        push(err.message || "Chat opened, but unread notifications could not be cleared.", "error");
      }
    } catch (err) {
      setChatError(err.message || "Failed to open the team conversation.");
      push(err.message || "Failed to open the team conversation.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const projectTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.projectId !== id) return false;
      const description = task.description || "";
      const matchesSearch =
        (task.title || "").toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priority === "All" || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, id, search, priority]);
  const unreadMessageCount = useMemo(
    () =>
      notifications.filter(
        (item) =>
          !item.read &&
          item.type === "message" &&
          item.relatedType === "project" &&
          String(item.relatedId) === String(project?.id),
      ).length,
    [notifications, project?.id],
  );

  const isProjectLeader =
    isDemoMode ||
    Boolean(project?.createdById && currentUser?.id &&
      String(project.createdById) === String(currentUser.id));
  const canManageMembers = isProjectLeader;

  useEffect(() => {
    if (!projectId || !canManageMembers || isDemoMode) {
      setProjectInvitations([]);
      setLoadingInvitations(false);
      return undefined;
    }

    let active = true;
    setLoadingInvitations(true);
    listProjectInvitations(projectId)
      .then((items) => {
        if (active) setProjectInvitations(items || []);
      })
      .catch((err) => {
        if (active) push(err.message || "Failed to load project invitations.", "error");
      })
      .finally(() => {
        if (active) setLoadingInvitations(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, canManageMembers, isDemoMode, push]);

  const handleMemberEmailChange = (value) => {
    setMemberEmail(value);
    setMemberError(null);
    setMemberLookup(null);
  };

  const handleLookupMember = async () => {
    const email = memberEmail.trim();
    if (!email) {
      setMemberError("Enter the email address of the teammate.");
      return null;
    }
    if (!isValidEmail(email)) {
      setMemberError("Enter a valid email address.");
      return null;
    }
    setAddingMember(true);
    setMemberError(null);
    try {
      const account = await findUserByEmail(email);
      setMemberLookup(account);
      return account;
    } catch (err) {
      setMemberLookup(null);
      setMemberError(err.message || "No registered FlowSync account found for that email.");
      return null;
    } finally {
      setAddingMember(false);
    }
  };

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The requested project was not found in your workspace."
        action={
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
          >
            Back to projects
          </button>
        }
      />
    );
  }

  const counts = {
    todo: projectTasks.filter((task) => task.status === TASK_STATUS.TODO).length,
    doing: projectTasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length,
    review: projectTasks.filter((task) => task.status === TASK_STATUS.IN_REVIEW).length,
    done: projectTasks.filter((task) => task.status === TASK_STATUS.DONE).length,
  };

  const selected = projectTasks.find((task) => task.id === selectedTask?.id) || selectedTask;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Projects", to: "/projects" }, { label: project.name }]} />
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
          <p className="mt-2 max-w-3xl text-[var(--on-surface-variant)]">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--outline)]">
            <span>{project.status}</span>
            <span>{project.visibility}</span>
            <span>Due {formatDate(project.deadline)}</span>
            <span>{project.progress}% complete</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isProjectLeader ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-[var(--error)] px-4 py-2 text-sm text-[var(--error)]"
              >
                Delete
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} />
            Add task
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
          <div className="h-full bg-[var(--primary)]" style={{ width: `${project.progress}%` }} />
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Members ({project.memberList.length})</h2>
          {canManageMembers ? (
            <button
              type="button"
              onClick={() => {
                setMemberEmail("");
                setMemberRole("Member");
                setMemberError(null);
                setMemberLookup(null);
                setAddMemberOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
            >
              <UserPlus size={14} />
              {isDemoMode ? "Add member" : "Invite member"}
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.memberList.map((member) => (
            <span
              key={member.id}
              className="flex items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-1 text-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] text-white">
                {member.initials}
              </span>
              <span>{member.name}</span>
              {member.role ? (
                <span className="text-xs text-[var(--outline)]">({member.role})</span>
              ) : null}
              {canManageMembers && String(member.userId) !== String(project.createdById) ? (
                <button
                  type="button"
                  title="Remove from project"
                  onClick={() => setRemovingMember(member)}
                  className="ml-1 text-[var(--outline)] opacity-70 hover:opacity-100 hover:text-[var(--error)]"
                >
                  <X size={12} />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      </section>

      {canManageMembers && !isDemoMode ? (
        <section className="mt-6 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-4">
          <h2 className="font-semibold">Project invitations</h2>
          {loadingInvitations ? (
            <p className="mt-3 text-sm text-[var(--outline)]">Loading invitations…</p>
          ) : projectInvitations.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--outline)]">No invitations have been sent.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--outline-variant)]">
              {projectInvitations.map((invitation) => (
                <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {invitation.inviteeName} · {invitation.inviteeEmail}
                    </p>
                    <p className="mt-1 text-xs text-[var(--outline)]">
                      {invitation.status} · Sent {relativeTime(invitation.createdAt)}
                    </p>
                  </div>
                  {invitation.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const updated = await cancelProjectInvitation(project.id, invitation.id);
                          setProjectInvitations((items) =>
                            items.map((item) => item.id === updated.id ? updated : item)
                          );
                          push("Invitation cancelled.");
                        } catch (err) {
                          push(err.message || "Failed to cancel the invitation.", "error");
                        }
                      }}
                      className="text-sm text-[var(--error)]"
                    >
                      Cancel
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            Team chat
            {unreadMessageCount > 0 ? (
              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] text-white">
                {unreadMessageCount} unread
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={handleOpenChat}
            disabled={chatLoading}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-60"
          >
            <MessageSquare size={14} />
            {chatOpen ? "Refresh chat" : "Open team chat"}
          </button>
        </div>
        {chatError ? (
          <p className="mb-2 rounded-lg bg-[var(--error-container)] px-3 py-2 text-sm text-[var(--on-error-container)]">
            {chatError}
          </p>
        ) : null}
        {chatOpen && chatConversationId ? (
          <TeamChat
            conversationId={chatConversationId}
            title={`${project.name} team chat`}
            description="Messages are stored on the server and stay available after a refresh."
            emptyDescription="No messages yet. Start the conversation with your team."
          />
        ) : (
          <p className="rounded-xl border border-[var(--outline-variant)] px-4 py-6 text-sm text-[var(--outline)]">
            Open the team chat to talk with the project members.
          </p>
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">To Do · {counts.todo}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">In Progress · {counts.doing}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">In Review · {counts.review}</div>
        <div className="rounded-lg border border-[var(--outline-variant)] p-4 text-sm">Done · {counts.done}</div>
      </section>

      <section className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks on this board"
          aria-label="Search project tasks"
          className="w-full max-w-md rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2 text-sm"
          >
            <option value="All">All priorities</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button
            type="button"
            onClick={() => setView("board")}
            className={`rounded-lg border px-3 py-2 ${view === "board" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--outline-variant)]"}`}
            aria-pressed={view === "board"}
          >
            <LayoutGrid size={16} />
            <span className="sr-only">Board view</span>
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg border px-3 py-2 ${view === "list" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--outline-variant)]"}`}
            aria-pressed={view === "list"}
          >
            <List size={16} />
            <span className="sr-only">List view</span>
          </button>
        </div>
      </section>

      <section className="mt-6">
        {view === "board" ? (
          <KanbanBoard
            tasks={projectTasks}
            onOpen={setSelectedTask}
            onMove={async (taskId, status) => {
              try {
                await updateTask(taskId, { status });
                push("Task status updated.");
              } catch (err) {
                push(err.message || "Failed to update task status.", "error");
              }
            }}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--outline-variant)]">
            {projectTasks.length === 0 ? (
              <EmptyState title="No tasks match these filters" />
            ) : (
              projectTasks.map((task) => <TaskRow key={task.id} task={task} onClick={setSelectedTask} />)
            )}
          </div>
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
      {showCreate ? <CreateTaskModal projectId={project.id} onClose={() => setShowCreate(false)} /> : null}
      {editing ? (
        <Modal title="Edit project" onClose={() => setEditing(false)} closeOnBackdrop={false}>
          <ProjectForm
            initial={project}
            submitting={submitting}
            onCancel={() => setEditing(false)}
            onSubmit={async (payload) => {
              try {
                await updateProject(project.id, payload);
                push("Project updated successfully.");
                setEditing(false);
              } catch (err) {
                push(err.message || "Failed to update project.", "error");
              }
            }}
          />
        </Modal>
      ) : null}
      {confirmDelete ? (
        <ConfirmDialog
          title={`Delete ${project.name}?`}
          description="Tasks in this project will also be removed."
          confirmLabel="Delete project"
          destructive
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            try {
              await deleteProject(project.id);
              push("Project deleted.");
              navigate("/projects");
            } catch (err) {
              push(err.message || "Failed to delete project.", "error");
            }
          }}
        />
      ) : null}
      {addMemberOpen ? (
        <Modal
          title={`${isDemoMode ? "Add member to" : "Invite member to"} ${project.name}`}
          description={
            isDemoMode
              ? "This adds a local demo profile."
              : "Look up an existing FlowSync account. Membership begins after they accept the invitation."
          }
          onClose={() => setAddMemberOpen(false)}
          closeOnBackdrop={false}
        >
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const account =
                memberLookup?.email?.toLowerCase() === memberEmail.trim().toLowerCase()
                  ? memberLookup
                  : await handleLookupMember();
              if (!account) return;
              setAddingMember(true);
              try {
                if (isDemoMode) {
                  await addProjectMember(project.id, {
                    userId: account.id,
                    email: account.email,
                    role: memberRole,
                  });
                  push(`${account.name} was added to the demo project.`);
                } else {
                  const invitation = await sendInvitation(project.id, account.id);
                  setProjectInvitations((items) => [invitation, ...items]);
                  push(`Invitation sent to ${account.name}.`);
                }
                setAddMemberOpen(false);
                setMemberEmail("");
                setMemberLookup(null);
              } catch (err) {
                setMemberError(err.message || "Failed to add member to project.");
                push(err.message || "Failed to add member to project.", "error");
              } finally {
                setAddingMember(false);
              }
            }}
            className="space-y-4"
          >
            <Field label="Teammate email" htmlFor="project-member-email" error={memberError}>
              <input
                id="project-member-email"
                type="email"
                value={memberEmail}
                onChange={(event) => handleMemberEmailChange(event.target.value)}
                placeholder="teammate@example.com"
                className={inputClass}
              />
            </Field>
            {memberLookup ? (
              <p className="rounded-lg bg-[var(--surface-container)] px-3 py-2 text-sm">
                Found account <strong>{memberLookup.name}</strong> ({memberLookup.email}).
              </p>
            ) : null}
            {isDemoMode ? (
              <Field label="Role in project" htmlFor="select-project-role">
                <select
                  id="select-project-role"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className={inputClass}
                >
                  {MEMBER_ROLES.filter((role) => role !== "Owner").map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddMemberOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!memberEmail.trim() || addingMember}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {addingMember ? "Sending…" : isDemoMode ? "Add locally" : "Send invitation"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
      {removingMember ? (
        <ConfirmDialog
          title={`Remove ${removingMember.name}?`}
          description={`Remove this member from ${project.name}? Their assigned tasks will remain in the project.`}
          confirmLabel="Remove member"
          destructive
          onClose={() => setRemovingMember(null)}
          onConfirm={async () => {
            try {
              await removeProjectMember(project.id, removingMember.id);
              push("Member removed from project.");
              setRemovingMember(null);
            } catch (err) {
              push(err.message || "Failed to remove member.", "error");
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default ProjectWorkspace;
