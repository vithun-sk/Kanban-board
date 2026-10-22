import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "@/config/env";

/**
 * Thin STOMP client used for live project team messages.
 *
 * The connection is authenticated with the same JWT that the REST API uses. The token is
 * sent in the CONNECT frame, and the server validates the conversation membership before
 * a subscription or a publish is accepted.
 *
 * The client is the single source of truth for the connection status so the UI can show
 * honestly whether live delivery is available. Sending messages always goes through the
 * REST API, which stores the message and lets the server broadcast it to every member.
 */
class RealtimeClient {
  constructor() {
    this.client = null;
    this.token = null;
    this.status = "idle";
    this.statusListeners = new Set();
    this.errorListeners = new Set();
    this.subscriptions = new Map();
    this.stompSubscriptions = new Map();
  }

  get socketUrl() {
    // The STOMP endpoint is served from the server root, next to the /api/v1 prefix.
    const base = API_BASE_URL.replace(/^http/i, "ws").replace(/\/api\/v1\/?$/, "");
    if (!base) return null;
    return `${base}/ws`;
  }

  get isConnected() {
    return Boolean(this.client?.connected);
  }

  onStatus(listener) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  onError(listener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  setStatus(status) {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  emitError(message) {
    this.errorListeners.forEach((listener) => listener(message));
  }

  connect(token) {
    if (!token) return;
    if (this.client && this.token === token && (this.client.connected || this.client.active)) return;

    const socketUrl = this.socketUrl;
    if (!socketUrl) {
      this.setStatus("error");
      this.emitError("The real-time endpoint is not configured.");
      return;
    }

    this.token = token;
    this.teardownClient();

    const client = new Client({
      brokerURL: socketUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.setStatus("connected");
        this.resubscribe();
      },
      onWebSocketOpen: () => this.setStatus("connecting"),
      onWebSocketClose: () => this.setStatus("disconnected"),
      onStompError: (frame) => {
        const message = frame?.headers?.message || "Real-time connection error.";
        this.emitError(message);
        this.setStatus("error");
      },
    });

    this.client = client;
    this.setStatus("connecting");
    client.activate();
  }

  /**
   * Closes the socket but keeps the registered conversation subscriptions, so a later
   * connect() restores them instead of leaving the UI silently unsubscribed.
   */
  teardownClient() {
    this.stompSubscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch {
        // the socket is already gone
      }
    });
    this.stompSubscriptions.clear();
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  disconnect() {
    this.teardownClient();
    this.token = null;
    this.subscriptions.clear();
    this.stompSubscriptions.clear();
    this.setStatus("idle");
  }

  resubscribe() {
    if (!this.client?.connected) return;
    this.stompSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.stompSubscriptions.clear();
    this.subscriptions.forEach((handlers, destination) => {
      const subscription = this.client.subscribe(destination, (message) => {
        let payload = message.body;
        try {
          payload = JSON.parse(message.body);
        } catch {
          payload = message.body;
        }
        handlers.forEach((handler) => handler(payload));
      });
      this.stompSubscriptions.set(destination, subscription);
    });
  }

  /**
   * Subscribes to a conversation topic. The returned function removes the subscription.
   */
  subscribe(conversationId, handler) {
    if (!conversationId || typeof handler !== "function") return () => {};
    const destination = `/topic/conversations/${conversationId}`;

    if (!this.subscriptions.has(destination)) {
      this.subscriptions.set(destination, new Set());
    }
    const handlers = this.subscriptions.get(destination);
    handlers.add(handler);

    if (this.client?.connected) {
      this.resubscribe();
    }

    return () => {
      const current = this.subscriptions.get(destination);
      if (!current) return;
      current.delete(handler);
      if (current.size === 0) {
        this.subscriptions.delete(destination);
      }
    };
  }

  publish(conversationId, body) {
    if (!this.client?.connected) {
      throw new Error("The real-time connection is not available. Messages are sent over the API instead.");
    }
    this.client.publish({
      destination: `/app/conversations/${conversationId}/messages`,
      body: JSON.stringify({ body }),
    });
  }
}

export const realtimeClient = new RealtimeClient();
