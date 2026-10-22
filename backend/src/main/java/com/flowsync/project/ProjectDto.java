package com.flowsync.project;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ProjectDto {
    private String id;
    private String name;
    private String description;
    private String status;
    private String visibility;
    private String color;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDate deadline;
    private String createdById;
    private String createdByName;
    private int members;
    private List<String> memberIds = new ArrayList<>();
    private List<ProjectMemberDto> memberList = new ArrayList<>();
    private int tasks;
    private int progress;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectDto() {
    }

    public static ProjectDto fromEntity(Project project, int taskCount, int completedCount) {
        if (project == null) return null;
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription() != null ? project.getDescription() : "");
        dto.setStatus(project.getStatus());
        dto.setVisibility(project.getVisibility());
        dto.setColor(project.getColor());
        dto.setStartDate(project.getStartDate());
        dto.setDueDate(project.getDueDate());
        dto.setDeadline(project.getDueDate());
        if (project.getCreatedBy() != null) {
            dto.setCreatedById(project.getCreatedBy().getId());
            dto.setCreatedByName(project.getCreatedBy().getName());
        }

        List<ProjectMemberDto> memberDtos = project.getMembers() != null
                ? project.getMembers().stream().map(ProjectMemberDto::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();
        dto.setMemberList(memberDtos);
        dto.setMembers(memberDtos.size());
        dto.setMemberIds(memberDtos.stream().map(ProjectMemberDto::getUserId).collect(Collectors.toList()));

        dto.setTasks(taskCount);
        dto.setProgress(taskCount > 0 ? (int) Math.round(((double) completedCount / taskCount) * 100) : 0);

        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        this.deadline = dueDate;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
        this.dueDate = deadline;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public int getMembers() {
        return members;
    }

    public void setMembers(int members) {
        this.members = members;
    }

    public List<String> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(List<String> memberIds) {
        this.memberIds = memberIds;
    }

    public List<ProjectMemberDto> getMemberList() {
        return memberList;
    }

    public void setMemberList(List<ProjectMemberDto> memberList) {
        this.memberList = memberList;
    }

    public int getTasks() {
        return tasks;
    }

    public void setTasks(int tasks) {
        this.tasks = tasks;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
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
