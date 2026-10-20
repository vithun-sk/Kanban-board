import React, { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { CURRENT_USER_ID } from "@/constants";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/dates";

const Messages = () => {
  const { conversations, messages, members, currentUser, sendMessage } = useApp();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [draft, setDraft] = useState("");

  const filtered = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(query.toLowerCase()),
  );
  const thread = useMemo(
    () => messages.filter((message) => message.conversationId === activeId),
    [messages, activeId],
  );
  const active = conversations.find((conversation) => conversation.id === activeId);

  const sender = (id) => members.find((member) => member.id === id);

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeId) return;
    sendMessage(activeId, draft);
    setDraft("");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Messages</h1>
      <p className="mt-2 text-[var(--on-surface-variant)]">
        Local demo conversations stored in this browser. This is not real-time messaging.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<MessageSquare size={28} />}
            title="No conversations yet"
            description="Start a conversation from the Team page."
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
                className="w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm"
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
                    <p className="text-xs text-[var(--outline)]">{conversation.memberIds.length} people</p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="flex min-h-[24rem] flex-col">
            {active ? (
              <>
                <div className="border-b border-[var(--outline-variant)] px-5 py-4">
                  <h2 className="font-semibold">{active.title}</h2>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {thread.length === 0 ? (
                    <p className="text-sm text-[var(--outline)]">No messages yet. Send the first demo note.</p>
                  ) : (
                    thread.map((message) => {
                      const person = sender(message.senderId);
                      const mine =
                        message.senderId === currentUser.id || message.senderId === CURRENT_USER_ID;
                      return (
                        <div key={message.id} className={`max-w-[80%] ${mine ? "ml-auto text-right" : ""}`}>
                          <p className="text-xs text-[var(--outline)]">
                            {person?.name || currentUser.name} · {formatDateTime(message.createdAt)}
                          </p>
                          <p className="mt-1 rounded-lg bg-[var(--surface-container-high)] px-3 py-2 text-sm">
                            {message.body}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 border-t border-[var(--outline-variant)] p-4">
                  <label htmlFor="message-input" className="sr-only">
                    Message
                  </label>
                  <input
                    id="message-input"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a demo message"
                    className="flex-1 rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
                    disabled={!draft.trim()}
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-[var(--outline)]">Select a conversation</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Messages;
