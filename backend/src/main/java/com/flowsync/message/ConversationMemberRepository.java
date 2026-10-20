package com.flowsync.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, String> {
    List<ConversationMember> findByConversationId(String conversationId);
    boolean existsByConversationIdAndUserId(String conversationId, String userId);
}
