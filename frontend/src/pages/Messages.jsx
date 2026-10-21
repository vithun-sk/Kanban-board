import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import TeamChat from "@/components/messages/TeamChat";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";

const Messages = () => {
  const { conversations, loadMessages, loading } = useApp();
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);

  const filtered = conversations.filter((conversation) =>
    (conversation.title || "").toLowerCase().includes(query.toLowerCase()),
  );
  const active = conversations.find((conversation) => conversation.id === activeId);

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId).catch((err) => {
      push(err.message || "Failed to load messages.", "error");
    });
  }, [activeId, loadMessages, push]);

  const memberCount = useMemo(
    () => (active?.memberIds || []).length,
    [active?.memberIds]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-[var(--on-surface-variant)]">
        Conversations with your team are stored on the server and delivered in real time.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<MessageSquare size={28} />}
            title="No conversations yet"
            description="Open a project and use the team chat to start a conversation."
          />
        </div>
      ) : (
        <div className="mt-8 grid min-h-[32rem] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] lg:grid-cols-[20rem_1fr]">
          <aside className="border-b border-[var(--outline-variant)] lg:border-b-0 lg:border-r">
            <div className="p-4">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2 text-sm"
              />
            </div>
            <ul>
              {filtered.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`w-full px-4 py-3 text-left ${
                      conversation.id === activeId ? "bg-[var(--primary-container)]" : "hover:bg-[var(--surface-container)]"
                    }`}
                  >
                    <p className="font-medium">{conversation.title}</p>
                    <p className="text-xs text-[var(--outline)]">
                      {(conversation.memberIds || []).length} people
                      {conversation.projectId ? " · project team" : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="flex min-h-[24rem] flex-col p-0">
            {active ? (
              <TeamChat
                conversationId={active.id}
                title={active.title}
                description={
                  active.projectId
                    ? "Project team conversation."
                    : `${memberCount} participants.`
                }
                emptyDescription="No messages yet. Send the first message."
                className="border-0"
              />
            ) : (
              <p className="p-5 text-sm text-[var(--outline)]">Select a conversation to read it.</p>
            )}
          </section>
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--outline)]">Loading conversations…</p>
      ) : null}
    </div>
  );
};

export default Messages;
