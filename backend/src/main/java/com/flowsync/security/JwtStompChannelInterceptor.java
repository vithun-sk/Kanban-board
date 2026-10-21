package com.flowsync.security;

import com.flowsync.message.MessageService;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Authenticates STOMP connections with the existing JWT and blocks subscriptions or
 * publishes to conversations the user is not a participant of.
 */
@Component
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtStompChannelInterceptor.class);

    private static final Pattern CONVERSATION_DESTINATION =
            Pattern.compile("^/(topic|app)/conversations/([^/]+)(/.*)?$");

    private final JwtService jwtService;
    private final MessageService messageService;

    public JwtStompChannelInterceptor(JwtService jwtService, MessageService messageService) {
        this.jwtService = jwtService;
        this.messageService = messageService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (StompCommand.CONNECT.equals(command)) {
            authenticate(accessor);
        } else if (StompCommand.SUBSCRIBE.equals(command) || StompCommand.SEND.equals(command)) {
            authorize(accessor);
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String token = extractToken(accessor);
        if (token == null || !jwtService.validateToken(token)) {
            log.warn("Rejected WebSocket connection: missing or invalid token.");
            throw new AccessDeniedException("Missing or invalid authentication token.");
        }

        Claims claims = jwtService.parseClaims(token);
        accessor.setUser(new StompPrincipal(
                claims.getSubject(),
                (String) claims.get("name"),
                (String) claims.get("email")
        ));
    }

    private void authorize(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            log.warn("Rejected WebSocket frame: session is not authenticated.");
            throw new AccessDeniedException("Not authenticated.");
        }

        String conversationId = extractConversationId(accessor.getDestination());
        if (conversationId == null) {
            return;
        }

        if (!messageService.isConversationMember(conversationId, principal.getName())) {
            log.warn("Rejected WebSocket access to conversation {} for user {}.", conversationId, principal.getName());
            throw new AccessDeniedException("You are not a participant in this conversation.");
        }
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7).trim();
        }
        String token = accessor.getFirstNativeHeader("token");
        return StringUtils.hasText(token) ? token.trim() : null;
    }

    private String extractConversationId(String destination) {
        if (!StringUtils.hasText(destination)) {
            return null;
        }
        Matcher matcher = CONVERSATION_DESTINATION.matcher(destination);
        return matcher.matches() ? matcher.group(2) : null;
    }
}
