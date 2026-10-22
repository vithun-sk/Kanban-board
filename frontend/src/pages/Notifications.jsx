import React, { useState } from "react";
import { Bell } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { relativeTime } from "@/lib/dates";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { push } = useToast();
  const {
    notifications,
    invitations,
    loading,
    respondToInvitation,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
  } = useApp();
  const [filter, setFilter] = useState("All");
  const [respondingTo, setRespondingTo] = useState(null);

  const items = notifications.filter((item) => {
    if (filter === "Unread") return !item.read;
    if (filter === "Read") return item.read;
    return true;
  });

  const openRelated = (item) => {
    markNotificationRead(item.id);
    if (item.relatedType === "task") navigate(`/tasks?task=${item.relatedId}`);
    if (item.relatedType === "project") navigate(`/projects/${item.relatedId}`);
  };

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">
            Workspace updates and project invitations sent to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm"
        >
          Mark all as read
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Team invitations</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--outline)]">Loading invitations…</p>
        ) : invitations.length === 0 ? (
          <p className="mt-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-4 text-sm text-[var(--outline)]">
            No project invitations yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{invitation.projectName}</p>
                    <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                      Invited by {invitation.inviterName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--outline)]">
                      {invitation.status} · Sent {relativeTime(invitation.createdAt)}
                    </p>
                  </div>
                  {invitation.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={respondingTo === invitation.id}
                        onClick={async () => {
                          setRespondingTo(invitation.id);
                          try {
                            await respondToInvitation(invitation.id, "accept");
                            push(`You joined ${invitation.projectName}.`);
                          } catch (err) {
                            push(err.message || "Failed to accept the invitation.", "error");
                          } finally {
                            setRespondingTo(null);
                          }
                        }}
                        className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm text-white disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={respondingTo === invitation.id}
                        onClick={async () => {
                          setRespondingTo(invitation.id);
                          try {
                            await respondToInvitation(invitation.id, "decline");
                            push("Invitation declined.");
                          } catch (err) {
                            push(err.message || "Failed to decline the invitation.", "error");
                          } finally {
                            setRespondingTo(null);
                          }
                        }}
                        className="rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex gap-2">
        {["All", "Unread", "Read"].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === value ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-container)]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<Bell size={28} />} title="No notifications" description="You're all caught up." />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${
                item.read
                  ? "border-[var(--outline-variant)] bg-[var(--surface-container)]"
                  : "border-[var(--primary)] bg-[var(--primary-container)]/40"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <button type="button" className="text-left" onClick={() => openRelated(item)}>
                  <p className="text-xs uppercase tracking-wide text-[var(--outline)]">{item.type}</p>
                  <h2 className="mt-1 font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{item.message}</p>
                  <p className="mt-2 text-xs text-[var(--outline)]">{relativeTime(item.createdAt)}</p>
                </button>
                <div className="flex gap-2">
                  {!item.read ? (
                    <button
                      type="button"
                      className="text-sm text-[var(--primary)]"
                      onClick={() => markNotificationRead(item.id)}
                    >
                      Mark read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-sm text-[var(--error)]"
                    onClick={() => dismissNotification(item.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
