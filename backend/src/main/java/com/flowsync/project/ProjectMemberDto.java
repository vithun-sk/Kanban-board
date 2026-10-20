package com.flowsync.project;

import com.flowsync.user.User;

import java.time.Instant;

public class ProjectMemberDto {
    private String id;
    private String userId;
    private String name;
    private String email;
    private String initials;
    private String role;
    private Instant joinedAt;

    public ProjectMemberDto() {
    }

    public ProjectMemberDto(String id, String userId, String name, String email, String role, Instant joinedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.initials = calculateInitials(name);
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public static ProjectMemberDto fromEntity(ProjectMember pm) {
        if (pm == null) return null;
        User u = pm.getUser();
        return new ProjectMemberDto(
                pm.getId(),
                u != null ? u.getId() : null,
                u != null ? u.getName() : "Unknown",
                u != null ? u.getEmail() : "",
                pm.getRole(),
                pm.getJoinedAt()
        );
    }

    private static String calculateInitials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.initials = calculateInitials(name);
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }
}
