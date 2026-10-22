import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Wifi, WifiOff } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { formatDateTime } from "@/lib/dates";

const CONNECTION_LABELS = {
  connected: { text: "Live", className: "text-emerald-700 bg-emerald-500/10" },
  connecting: { text: "Connecting…", className: "text-amber-700 bg-amber-500/10" },
  disconnected: { text: "Reconnecting…", className: "text-amber-700 bg-amber-500/10" },
  error: { text: "Live updates unavailable", className: "text-[var(--error)] bg-[var(--error-container)]" },
  idle: { text: "Live updates off", className: "text-[var(--outline)] bg-[var(--surface-container)]" },
};

/**
 * Conversation panel that is used by the project workspace and the messages page.
 * History is loaded through the REST API, new messages arrive over the real-time
 * connection and are merged by id so a message is never displayed twice.
 */
const TeamChat = ({
  conversationId,
  title = "Team chat",
  description = "",
  emptyDescription = "No messages yet. Start the conversation.",
  className = "",
}) => {
  const {
    messages,
    members,
    messageStatus,
    messagePages,
    realtimeStatus,
    currentUser,
    sendMessage,
    loadMessages,
    subscribeToConversation,
  } = useApp();
  const { push } = useToast();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const bottomRef = useRef(null);
  const loadedRef = useRef(null);

  const thread = useMemo(
    () => messages.filter((message) => message.conversationId === conversationId),
    [messages, conversationId]
  );
  const status = messageStatus[conversationId] || {};
  const page = messagePages[conversationId] || {};
  const connection = CONNECTION_LABELS[realtimeStatus] || CONNECTION_LABELS.idle;

  useEffect(() => {
    if (!conversationId) return undefined;
    return subscribeToConversation(conversationId, () => {});
  }, [conversationId, subscribeToConversation]);

  useEffect(() => {
    if (!conversationId || loadedRef.current === conversationId) return;
    loadedRef.current = conversationId;
    loadMessages(conversationId).catch((err) => {
      push(err.message || "Failed to load messages.", "error");
    });
  }, [conversationId, loadMessages, push]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) {
      push("Type a message before sending.", "error");
      return;
    }
    setSending(true);
    try {
      await sendMessage(conversationId, body);
      setDraft("");
    } catch (err) {
      push(err.message || "Failed to send the message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleLoadOlder = async () => {
    setLoadingOlder(true);
    try {
      await loadMessages(conversationId, (page.page || 0) + 1);
    } catch (err) {
      push(err.message || "Failed to load older messages.", "error");
    } finally {
      setLoadingOlder(false);
    }
  };

  if (!conversationId) {
    return (
      <div className={`rounded-xl border border-[var(--outline-variant)] p-6 text-sm text-[var(--outline)] ${className}`}>
        Open the team chat to read and send messages.
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-[var(--outline-variant)] ${className}`}>
      <div className="border-b border-[var(--outline-variant)] px-5 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquare size={16} />
            {title}
          </h2>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${connection.className}`}
            title={
              realtimeStatus === "connected"
                ? "Messages are delivered to the other members in real time."
                : "Messages are still stored and sent over the API, but live delivery is unavailable."
            }
          >
            {realtimeStatus === "connected" ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connection.text}
          </span>
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--outline)]">{description}</p>
        ) : null}
        {realtimeStatus !== "connected" ? (
          <p className="mt-1 text-xs text-[var(--outline)]">
            Sending and loading messages still work over the API, they are just not pushed live.
          </p>
        ) : null}
      </div>

      <div className="max-h-80 min-h-[12rem] flex-1 space-y-3 overflow-y-auto p-5">
        {status.loading && thread.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-[var(--outline)]">
            <Loader2 size={14} className="animate-spin" />
            Loading messages…
          </p>
        ) : null}

        {status.error ? (
          <p className="rounded-lg bg-[var(--error-container)] px-3 py-2 text-sm text-[var(--on-error-container)]">
            {status.error}
          </p>
        ) : null}

        {page.hasOlder ? (
          <button
            type="button"
            onClick={handleLoadOlder}
            disabled={loadingOlder}
            className="w-full rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-xs text-[var(--outline)] hover:bg-[var(--surface-container)] disabled:opacity-60"
          >
            {loadingOlder ? "Loading…" : "Load older messages"}
          </button>
        ) : null}

        {thread.length === 0 && !status.loading && !status.error ? (
          <p className="text-sm text-[var(--outline)]">{emptyDescription}</p>
        ) : null}

        {thread.map((message) => {
          const mine = message.senderId === currentUser?.id;
          const sender =
            message.senderName ||
            members.find((member) => member.id === message.senderId)?.name ||
            "Unknown";
          return (
            <div key={message.id} className={`max-w-[80%] ${mine ? "ml-auto text-right" : ""}`}>
              <p className="text-xs text-[var(--outline)]">
                {sender} · {formatDateTime(message.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-[var(--surface-container-high)] px-3 py-2 text-sm">
                {message.body}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-[var(--outline-variant)] p-4">
        <label htmlFor={`chat-input-${conversationId}`} className="sr-only">
          Message
        </label>
        <input
          id={`chat-input-${conversationId}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={2000}
          placeholder="Write a message"
          className="flex-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send
        </button>
      </form>
    </div>
  );
};

export default TeamChat;
