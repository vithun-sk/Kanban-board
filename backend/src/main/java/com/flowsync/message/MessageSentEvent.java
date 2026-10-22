package com.flowsync.message;

/**
 * Raised after a message was persisted. The event is published inside the sending
 * transaction and broadcast once that transaction committed, so a subscriber never
 * receives a message that is not stored yet.
 */
public record MessageSentEvent(MessageDto message) {
}
