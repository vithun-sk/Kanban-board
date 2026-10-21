package com.flowsync.message;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        List<ConversationDto> list = messageService.getUserConversations(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationDto>> createConversation(
            @Valid @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ConversationDto created = messageService.createConversation(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Conversation created successfully.", created));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(
            @PathVariable String conversationId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<MessageDto> messages = messageService.getConversationMessages(conversationId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    @GetMapping("/{conversationId}/messages/page")
    public ResponseEntity<ApiResponse<MessagePageDto>> getMessagePage(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MessagePageDto messages = messageService.getConversationMessagesPage(conversationId, principal.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        MessageDto sent = messageService.sendMessage(conversationId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent successfully.", sent));
    }
}
