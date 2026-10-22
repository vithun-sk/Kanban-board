package com.flowsync.message;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Broadcasts a stored message to the conversation topic.
 *
 * The broadcast happens after the sending transaction committed, so every client that
 * receives the message can reload it from the database. The REST endpoint and the STOMP
 * endpoint share this publisher, therefore a message is broadcast exactly once no matter
 * how it was sent, and clients merge the REST response with the broadcast by message id.
 */
@Component
public class MessageBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(MessageBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;

    public MessageBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Order(Ordered.HIGHEST_PRECEDENCE)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void broadcast(MessageSentEvent event) {
        MessageDto message = event.message();
        if (message == null || message.getConversationId() == null) {
            return;
        }
        try {
            messagingTemplate.convertAndSend("/topic/conversations/" + message.getConversationId(), message);
        } catch (RuntimeException ex) {
            log.warn("Could not broadcast message {} to conversation {}: {}",
                    message.getId(), message.getConversationId(), ex.getMessage());
        }
    }
}
