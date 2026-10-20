package com.flowsync.project;

import com.flowsync.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "project_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "user_id"})
})
public class ProjectMember {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    public ProjectMember() {
    }

    public ProjectMember(String id, Project project, User user, String role) {
        this.id = id;
        this.project = project;
        this.user = user;
        this.role = role != null ? role : "Member";
        this.joinedAt = Instant.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.joinedAt == null) {
            this.joinedAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
