package com.flowsync.message;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ConversationDto {
    private String id;
    private String title;
    private String projectId;
    private List<String> memberIds = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public ConversationDto() {
    }

    public static ConversationDto fromEntity(Conversation c) {
        if (c == null) return null;
        ConversationDto dto = new ConversationDto();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setProjectId(c.getProjectId());
        if (c.getMembers() != null) {
            dto.setMemberIds(c.getMembers().stream()
                    .map(m -> m.getUser().getId())
                    .collect(Collectors.toList()));
        }
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(List<String> memberIds) {
        this.memberIds = memberIds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
