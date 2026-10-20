package com.flowsync.task;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskStatus {
    TODO("To Do"),
    IN_PROGRESS("In Progress"),
    IN_REVIEW("In Review"),
    DONE("Done");

    private final String label;

    TaskStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static TaskStatus fromString(String value) {
        if (value == null || value.isBlank()) return TODO;
        String clean = value.trim().toUpperCase().replace(" ", "_");
        for (TaskStatus status : TaskStatus.values()) {
            if (status.name().equalsIgnoreCase(clean) || status.label.equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return TODO;
    }
}
