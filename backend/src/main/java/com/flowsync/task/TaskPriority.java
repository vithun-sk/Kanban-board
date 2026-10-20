package com.flowsync.task;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskPriority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent");

    private final String label;

    TaskPriority(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static TaskPriority fromString(String value) {
        if (value == null || value.isBlank()) return MEDIUM;
        for (TaskPriority priority : TaskPriority.values()) {
            if (priority.name().equalsIgnoreCase(value.trim()) || priority.label.equalsIgnoreCase(value.trim())) {
                return priority;
            }
        }
        return MEDIUM;
    }
}
