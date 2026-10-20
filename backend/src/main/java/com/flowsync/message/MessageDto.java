package com.flowsync.message;

import java.time.Instant;

public class MessageDto {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String body;
    private Instant createdAt;

    public MessageDto() {
    }

    public static MessageDto fromEntity(Message m) {
        if (m == null) return null;
        MessageDto dto = new MessageDto();
        dto.setId(m.getId());
        if (m.getConversation() != null) {
            dto.setConversationId(m.getConversation().getId());
        }
        if (m.getSender() != null) {
            dto.setSenderId(m.getSender().getId());
            dto.setSenderName(m.getSender().getName());
        }
        dto.setBody(m.getBody());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
