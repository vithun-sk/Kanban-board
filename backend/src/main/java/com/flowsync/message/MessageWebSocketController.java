package com.flowsync.message;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * Real-time delivery for project team conversations. Every message is persisted first and
 * only then broadcast to the conversation topic, so a reconnecting client never loses
 * messages that were already stored.
 *
 * The broadcast itself is done by {@link MessageBroadcaster} once the sending transaction
 * committed, which keeps the REST endpoint and this endpoint free of duplicate messages.
 */
@Controller
public class MessageWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(MessageWebSocketController.class);

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageWebSocketController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/conversations/{conversationId}/messages")
    public void sendMessage(
            @DestinationVariable String conversationId,
            @Valid @Payload SendMessageRequest request,
            Principal principal
    ) {
        messageService.sendMessage(conversationId, request, principal.getName());
    }

    @MessageExceptionHandler(Exception.class)
    public void handleException(Exception ex, org.springframework.messaging.MessageHeaders headers, Principal principal) {
        log.warn("Rejected WebSocket message: {}", ex.getMessage());

        Map<String, String> payload = Map.of("error", ex.getMessage() == null ? "Message could not be sent." : ex.getMessage());
        if (principal != null) {
            messagingTemplate.convertAndSendToUser(principal.getName(), "/queue/errors", payload);
            return;
        }
        MessageHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(headers, MessageHeaderAccessor.class);
        String sessionId = accessor instanceof SimpMessageHeaderAccessor
                ? ((SimpMessageHeaderAccessor) accessor).getSessionId()
                : null;
        if (sessionId != null) {
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/errors", payload);
        }
    }
}
