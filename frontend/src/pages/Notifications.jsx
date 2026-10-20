import React, { useState } from "react";
import { Bell } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { relativeTime } from "@/lib/dates";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
  } = useApp();
  const [filter, setFilter] = useState("All");

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
            Demo activity from this workspace. These are not live user events.
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
