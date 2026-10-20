package com.flowsync.task;

import com.flowsync.user.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TaskDto {
    private String id;
    private String projectId;
    private String projectName;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String assigneeId;
    private String assignee;
    private String assigneeInitials;
    private List<String> labels = new ArrayList<>();
    private LocalDate startDate;
    private LocalDate dueDate;
    private boolean overdue;
    private String createdById;
    private Instant createdAt;
    private Instant updatedAt;

    public TaskDto() {
    }

    public static TaskDto fromEntity(Task task) {
        if (task == null) return null;
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus() != null ? task.getStatus().getLabel() : "To Do");
        dto.setPriority(task.getPriority() != null ? task.getPriority().getLabel() : "Medium");

        User a = task.getAssignee();
        if (a != null) {
            dto.setAssigneeId(a.getId());
            dto.setAssignee(a.getName());
            dto.setAssigneeInitials(calculateInitials(a.getName()));
        } else {
            dto.setAssignee("Unassigned");
            dto.setAssigneeInitials("?");
        }

        if (task.getLabels() != null) {
            dto.setLabels(task.getLabels().stream().map(TaskLabel::getLabel).collect(Collectors.toList()));
        }

        dto.setStartDate(task.getStartDate());
        dto.setDueDate(task.getDueDate());

        boolean isDone = task.getStatus() == TaskStatus.DONE;
        boolean isPastDue = task.getDueDate() != null && task.getDueDate().isBefore(LocalDate.now());
        dto.setOverdue(!isDone && isPastDue);

        if (task.getCreatedBy() != null) {
            dto.setCreatedById(task.getCreatedBy().getId());
        }

        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
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

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getAssigneeInitials() {
        return assigneeInitials;
    }

    public void setAssigneeInitials(String assigneeInitials) {
        this.assigneeInitials = assigneeInitials;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
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
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public String getCreatedById() {
        return createdById;
    }

    public void setCreatedById(String createdById) {
        this.createdById = createdById;
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
