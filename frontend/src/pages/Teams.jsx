import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Field, inputClass } from "@/components/ui/Field";
import { MEMBER_ROLES } from "@/constants";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail } from "@/lib/validation";
import { findUserByEmail } from "@/services/membersService";

const Teams = () => {
  const navigate = useNavigate();
  const {
    members,
    tasks,
    projects,
    addMember,
    updateMember,
    removeMember,
    removeProjectMember,
    createConversation,
    isDemoMode,
    currentUser,
    sendInvitation,
  } = useApp();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [detail, setDetail] = useState(null);

  const manageableProjects = useMemo(
    () =>
      (projects || []).filter(
        (project) =>
          project.createdById &&
          currentUser?.id &&
          String(project.createdById) === String(currentUser.id)
      ),
    [projects, currentUser?.id]
  );

  const filtered = useMemo(() => {
    let base = members || [];
    // Only show current user and members of accessible projects
    if (!isDemoMode && projects) {
      const projectMemberUserIds = new Set();
      for (const project of projects) {
        if (Array.isArray(project.memberList)) {
          for (const pm of project.memberList) {
            if (pm?.userId) projectMemberUserIds.add(pm.userId);
          }
        }
        if (Array.isArray(project.memberIds)) {
          for (const mid of project.memberIds) {
            projectMemberUserIds.add(mid);
          }
        }
      }
      if (currentUser?.id) projectMemberUserIds.add(currentUser.id);
      base = base.filter((m) => projectMemberUserIds.has(m.id));
    }
    return base.filter((member) => {
      const matchesSearch =
        (member.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (member.email || "").toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === "All" || member.role === role;
      return matchesSearch && matchesRole;
    });
  }, [members, search, role, projects, isDemoMode, currentUser]);

  const taskCount = (id) => tasks.filter((task) => task.assigneeId === id).length;
  const canRemoveMember = (member) =>
    isDemoMode ||
    manageableProjects.some(
      (project) =>
        String(project.createdById) !== String(member.id) &&
        (project.memberList || []).some(
          (membership) => String(membership.userId) === String(member.id),
        )
    );

  const submitInvite = async (event) => {
    event.preventDefault();
    const next = {};
    if (isDemoMode && !name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email.";
    else if (
      isDemoMode &&
      members.some((member) => member.email?.toLowerCase() === email.trim().toLowerCase())
    ) {
      next.email = "That email is already on the team.";
    }
    const targetProject = manageableProjects.find((project) => project.id === selectedProjectId);
    if (!isDemoMode && !targetProject) next.project = "You do not have a project you can manage.";
    else if (
      !isDemoMode &&
      targetProject.memberList?.some(
        (member) => member.email?.toLowerCase() === email.trim().toLowerCase()
      )
    ) {
      next.email = "That account is already a member of this project.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      if (isDemoMode) {
        await addMember({ name, email, role: inviteRole });
        push("Member added to demo workspace.");
      } else {
        const account = await findUserByEmail(email.trim());
        await sendInvitation(targetProject.id, account.id);
        push(`Invitation sent to ${account.name} for ${targetProject.name}.`);
      }
      setInviteOpen(false);
      setName("");
      setEmail("");
      setInviteRole("Member");
      setSelectedProjectId("");
    } catch (err) {
      setErrors({ email: err.message || "Unable to send the invitation." });
    }
  };

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
      <p className="mt-2 text-[var(--on-surface-variant)]">
        {isDemoMode
          ? "Demo members for this workspace. Roles are labels only and are not enforced as permissions."
          : "You and the members of your accessible projects. Invitations require acceptance before membership begins."}
      </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          disabled={!isDemoMode && manageableProjects.length === 0}
          className="rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {isDemoMode ? "Add member" : "Invite to project"}
        </button>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search members"
          aria-label="Search members"
          className="min-w-[220px] flex-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2.5 text-sm"
        >
          <option value="All">All roles</option>
          {MEMBER_ROLES.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </section>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<Users size={28} />} title="No members found" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => (
            <article
              key={member.id}
              className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] font-semibold text-white">
                  {member.initials}
                </div>
                <div>
                  <h2 className="font-semibold">{member.name}</h2>
                  <p className="text-sm text-[var(--outline)]">{member.email}</p>
                  <p className="mt-2 text-xs">{member.role} · {member.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm">{taskCount(member.id)} assigned tasks</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="text-sm text-[var(--primary)]" onClick={() => setDetail(member)}>
                  View
                </button>
                <button type="button" className="text-sm text-[var(--primary)]" onClick={() => setEditing(member)}>
                  Edit role
                </button>
                {canRemoveMember(member) ? (
                  <button
                    type="button"
                    className="text-sm text-[var(--error)]"
                    onClick={() => setRemoving(member)}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {inviteOpen ? (
        <Modal
          title={isDemoMode ? "Add member" : "Invite a teammate"}
          description={
            isDemoMode
              ? "This adds a local demo profile. No email is sent."
              : "Invite an existing registered FlowSync account to a project. They become a member only after accepting."
          }
          onClose={() => setInviteOpen(false)}
          closeOnBackdrop={false}
        >
          <form onSubmit={submitInvite} className="space-y-4">
            {isDemoMode ? (
              <Field label="Full name" htmlFor="invite-name" error={errors.name}>
                <input id="invite-name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
              </Field>
            ) : (
              <Field label="Project" htmlFor="invite-project" error={errors.project}>
                <select
                  id="invite-project"
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a project</option>
                  {manageableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Email" htmlFor="invite-email" error={errors.email}>
              <input id="invite-email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
            </Field>
            {isDemoMode ? (
              <Field label="Role" htmlFor="invite-role">
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value)}
                  className={inputClass}
                >
                  {MEMBER_ROLES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
            ) : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white">
                {isDemoMode ? "Add locally" : "Send invitation"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editing ? (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditing(null)} closeOnBackdrop={false}>
          <Field label="Role" htmlFor="edit-role">
            <select
              id="edit-role"
              defaultValue={editing.role}
              onChange={(event) => setEditing((current) => ({ ...current, role: event.target.value }))}
              className={inputClass}
            >
              {MEMBER_ROLES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await updateMember(editing.id, { role: editing.role });
                  push(isDemoMode ? "Role updated in demo workspace." : "Member role updated.");
                  setEditing(null);
                } catch (err) {
                  push(err.message || "Failed to update the member role.", "error");
                }
              }}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
            >
              Save
            </button>
          </div>
        </Modal>
      ) : null}

      {detail ? (
        <Modal title={detail.name} description={detail.email} onClose={() => setDetail(null)}>
          <p className="text-sm">{detail.role} · {detail.title}</p>
          <p className="mt-3 text-sm">{taskCount(detail.id)} assigned tasks</p>
          <button
            type="button"
            className="mt-5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white"
            onClick={async () => {
              try {
                await createConversation(detail.id);
                setDetail(null);
                navigate("/messages");
              } catch (err) {
                push(err.message || "Failed to open the conversation.", "error");
              }
            }}
          >
            {isDemoMode ? "Open demo conversation" : "Send message"}
          </button>
        </Modal>
      ) : null}

      {removing ? (
        <ConfirmDialog
          title={`Remove ${removing.name}?`}
          description={
            isDemoMode
              ? "They will be removed from this workspace and unassigned from tasks."
              : String(currentUser?.role || "").toLowerCase() === "admin"
                ? "They will be removed from all project memberships. Their FlowSync account stays untouched."
                : "They will be removed from the projects you own or administer. Memberships in other projects are unchanged, and their account stays untouched."
          }
          confirmLabel="Remove member"
          destructive
          onClose={() => setRemoving(null)}
          onConfirm={async () => {
            try {
              if (isDemoMode) {
                await removeMember(removing.id);
              } else {
                const memberships = manageableProjects.flatMap((project) =>
                  (project.memberList || [])
                    .filter((membership) => String(membership.userId) === String(removing.id))
                    .map((membership) => ({ projectId: project.id, membershipId: membership.id }))
                );
                for (const membership of memberships) {
                  await removeProjectMember(membership.projectId, membership.membershipId);
                }
              }
              push(
                isDemoMode
                  ? "Member removed."
                  : "Member removed from the projects you lead. Their account is unchanged."
              );
              setRemoving(null);
            } catch (err) {
              push(err.message || "Failed to remove the member.", "error");
            }
          }}
        />
      ) : null}
    </div>
  );
};

export default Teams;
