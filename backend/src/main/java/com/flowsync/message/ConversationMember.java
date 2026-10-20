package com.flowsync.message;

import com.flowsync.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "conversation_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"conversation_id", "user_id"})
})
public class ConversationMember {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public ConversationMember() {
    }

    public ConversationMember(String id, Conversation conversation, User user) {
        this.id = id;
        this.conversation = conversation;
        this.user = user;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
