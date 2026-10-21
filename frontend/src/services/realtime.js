import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "@/config/env";

/**
 * Thin STOMP client used for live project team messages.
 *
 * The connection is authenticated with the same JWT that the REST API uses. The token is
 * sent in the CONNECT frame, and the server validates the conversation membership before
 * a subscription or a publish is accepted.
 */
class RealtimeClient {
  constructor() {
    this.client = null;
    this.token = null;
    this.status = "idle";
    this.statusListeners = new Set();
    this.subscriptions = new Map();
    this.errorListeners = new Set();
  }

  get socketUrl() {
    // The STOMP endpoint is served from the server root, next to the /api/v1 prefix.
    const base = API_BASE_URL.replace(/^http/i, "ws").replace(/\/api\/v1\/?$/, "");
    return `${base}/ws`;
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
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  emitError(message) {
    this.errorListeners.forEach((listener) => listener(message));
  }

  connect(token) {
    if (!token) return;
    if (this.client && this.token === token && this.client.connected) return;

    this.token = token;
    this.disconnect();

    const client = new Client({
      brokerURL: this.socketUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.setStatus("connected");
        this.resubscribe();
      },
      onWebSocketClose: () => this.setStatus("disconnected"),
      onStompError: (frame) => {
        const message = frame?.headers?.message || "Real-time connection error.";
        this.emitError(message);
        this.setStatus("error");
      },
    });

    this.client = client;
    client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.subscriptions.clear();
    this.setStatus("idle");
  }

  resubscribe() {
    if (!this.client?.connected) return;
    this.subscriptions.forEach((handler, destination) => {
      this.client.subscribe(destination, (message) => {
        try {
          handler(JSON.parse(message.body));
        } catch {
          handler(message.body);
        }
      });
    });
  }

  /**
   * Subscribes to a conversation topic. The returned function removes the subscription.
   */
  subscribe(conversationId, handler) {
    const destination = `/topic/conversations/${conversationId}`;
    this.subscriptions.set(destination, handler);
    if (this.client?.connected) {
      this.client.subscribe(destination, (message) => {
        try {
          handler(JSON.parse(message.body));
        } catch {
          handler(message.body);
        }
      });
    }
    return () => {
      this.subscriptions.delete(destination);
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
