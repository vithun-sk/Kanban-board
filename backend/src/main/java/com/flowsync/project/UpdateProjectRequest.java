package com.flowsync.project;

import java.time.LocalDate;

public class UpdateProjectRequest {
    private String name;
    private String description;
    private String status;
    private String visibility;
    private String color;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDate deadline;
    private boolean startDateProvided;
    private boolean dueDateProvided;
    private boolean deadlineProvided;

    public UpdateProjectRequest() {
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
        this.startDateProvided = true;
    }

    public boolean isStartDateProvided() {
        return startDateProvided;
    }

    public LocalDate getEffectiveDueDate() {
        return dueDateProvided ? dueDate : deadline;
    }

    public boolean isEffectiveDueDateProvided() {
        return dueDateProvided || deadlineProvided;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        this.dueDateProvided = true;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
        this.deadlineProvided = true;
    }
}
