package com.flowsync.message;

import com.flowsync.exception.BadRequestException;
import com.flowsync.exception.ForbiddenException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            MessageRepository messageRepository,
            UserRepository userRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<ConversationDto> getUserConversations(String userId) {
        return conversationRepository.findUserConversations(userId).stream()
                .map(ConversationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MessageDto> getConversationMessages(String conversationId, String userId) {
        validateConversationMembership(conversationId, userId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(String conversationId, SendMessageRequest request, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found."));

        validateConversationMembership(conversationId, userId);

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Message message = new Message(
                UUID.randomUUID().toString(),
                conversation,
                sender,
                request.getBody().trim()
        );

        Message saved = messageRepository.save(message);
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return MessageDto.fromEntity(saved);
    }

    @Transactional
    public ConversationDto createConversation(CreateConversationRequest request, String userId) {
        Set<String> memberIds = new HashSet<>();
        memberIds.add(userId);
        if (request.getParticipantIds() != null) {
            memberIds.addAll(request.getParticipantIds());
        }

        if (memberIds.size() < 2) {
            throw new BadRequestException("A conversation requires at least two participants.");
        }

        // If title not provided, derive from participants
        String title = request.getTitle();
        List<User> members = new ArrayList<>();
        for (String mId : memberIds) {
            userRepository.findById(mId).ifPresent(members::add);
        }

        if (title == null || title.isBlank()) {
            title = members.stream()
                    .filter(u -> !u.getId().equals(userId))
                    .map(User::getName)
                    .collect(Collectors.joining(", "));
            if (title.isBlank()) title = "Conversation";
        }

        Conversation conversation = new Conversation(UUID.randomUUID().toString(), title);

        for (User user : members) {
            ConversationMember cm = new ConversationMember(
                    UUID.randomUUID().toString(),
                    conversation,
                    user
            );
            conversation.getMembers().add(cm);
        }

        Conversation saved = conversationRepository.save(conversation);
        return ConversationDto.fromEntity(saved);
    }

    public void validateConversationMembership(String conversationId, String userId) {
        boolean isMember = conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId);
        if (!isMember) {
            throw new ForbiddenException("You are not a participant in this conversation.");
        }
    }
}
