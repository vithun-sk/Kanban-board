package com.flowsync.notification;

import java.time.Instant;

public class NotificationDto {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private String relatedType;
    private String relatedId;
    private boolean read;
    private Instant createdAt;

    public NotificationDto() {
    }

    public static NotificationDto fromEntity(Notification notification) {
        if (notification == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        if (notification.getUser() != null) {
            dto.setUserId(notification.getUser().getId());
        }
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRelatedType(notification.getRelatedType());
        dto.setRelatedId(notification.getRelatedId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRelatedType() {
        return relatedType;
    }

    public void setRelatedType(String relatedType) {
        this.relatedType = relatedType;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
