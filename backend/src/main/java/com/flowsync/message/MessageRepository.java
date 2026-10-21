package com.flowsync.message;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC, m.id ASC")
    List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") String conversationId);

    @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC, m.id DESC")
    List<Message> findLatestByConversationId(@Param("conversationId") String conversationId, Pageable pageable);

    long countByConversationId(String conversationId);
}
