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

    public static final int MAX_MESSAGE_LENGTH = 2000;

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

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(String userId) {
        return conversationRepository.findUserConversations(userId).stream()
                .map(ConversationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(String conversationId, String userId) {
        validateConversationMembership(conversationId, userId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Reverse paginated history: page 0 holds the newest messages, older pages step back
     * through the conversation. Items are always returned in chronological order.
     */
    @Transactional(readOnly = true)
    public MessagePageDto getConversationMessagesPage(String conversationId, String userId, int page, int size) {
        validateConversationMembership(conversationId, userId);

        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        long totalElements = messageRepository.countByConversationId(conversationId);

        List<Message> newestFirst = messageRepository.findLatestByConversationId(
                conversationId,
                org.springframework.data.domain.PageRequest.of(safePage, safeSize)
        );

        List<MessageDto> items = newestFirst.stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
        Collections.reverse(items);

        long totalPages = totalElements == 0 ? 0 : (totalElements + safeSize - 1) / safeSize;
        boolean hasOlder = (long) (safePage + 1) * safeSize < totalElements;
        boolean hasNewer = safePage > 0;

        return new MessagePageDto(items, safePage, safeSize, totalElements, (int) totalPages, hasNewer, hasOlder);
    }

    @Transactional
    public MessageDto sendMessage(String conversationId, SendMessageRequest request, String userId) {
        validateConversationMembership(conversationId, userId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found."));

        String body = request.getBody() != null ? request.getBody().trim() : "";
        if (body.isEmpty()) {
            throw new BadRequestException("Message body cannot be blank.");
        }
        if (body.length() > MAX_MESSAGE_LENGTH) {
            throw new BadRequestException("Message body cannot exceed " + MAX_MESSAGE_LENGTH + " characters.");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Message message = new Message(
                UUID.randomUUID().toString(),
                conversation,
                sender,
                body
        );

        Message saved = messageRepository.save(message);
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return MessageDto.fromEntity(saved);
    }

    /**
     * Creates a direct conversation between the caller and the requested participants.
     * An existing 1:1 conversation is reused so repeated requests never create duplicates.
     */
    @Transactional
    public ConversationDto createConversation(CreateConversationRequest request, String userId) {
        Set<String> participantIds = new LinkedHashSet<>();
        if (request.getParticipantIds() != null) {
            for (String participantId : request.getParticipantIds()) {
                if (participantId != null && !participantId.isBlank() && !participantId.trim().equals(userId)) {
                    participantIds.add(participantId.trim());
                }
            }
        }

        if (participantIds.isEmpty()) {
            throw new BadRequestException("A conversation requires at least two participants.");
        }

        List<User> participants = new ArrayList<>();
        for (String participantId : participantIds) {
            User user = userRepository.findById(participantId)
                    .orElseThrow(() -> new BadRequestException(
                            "No registered FlowSync account found for user id '" + participantId + "'."));
            participants.add(user);
        }

        if (participants.size() == 1) {
            Optional<Conversation> existing = findDirectConversation(userId, participants.get(0).getId());
            if (existing.isPresent()) {
                return ConversationDto.fromEntity(existing.get());
            }
        }

        String title = request.getTitle() != null && !request.getTitle().isBlank()
                ? request.getTitle().trim()
                : participants.stream().map(User::getName).collect(Collectors.joining(", "));
        if (title.isBlank()) {
            title = "Conversation";
        }

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Conversation conversation = new Conversation(UUID.randomUUID().toString(), title);
        conversation.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conversation, creator));
        for (User participant : participants) {
            conversation.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conversation, participant));
        }

        Conversation saved = conversationRepository.save(conversation);
        return ConversationDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public void validateConversationMembership(String conversationId, String userId) {
        boolean isMember = conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId);
        if (!isMember) {
            throw new ForbiddenException("You are not a participant in this conversation.");
        }
    }

    @Transactional(readOnly = true)
    public boolean isConversationMember(String conversationId, String userId) {
        return conversationMemberRepository.existsByConversationIdAndUserId(conversationId, userId);
    }

    private Optional<Conversation> findDirectConversation(String userId, String otherUserId) {
        return conversationRepository.findUserConversations(userId).stream()
                .filter(conversation -> conversation.getProjectId() == null)
                .filter(conversation -> conversation.getMembers() != null && conversation.getMembers().size() == 2)
                .filter(conversation -> conversation.getMembers().stream()
                        .anyMatch(member -> member.getUser() != null && member.getUser().getId().equals(otherUserId)))
                .findFirst();
    }
}
