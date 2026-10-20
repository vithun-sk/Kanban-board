package com.flowsync.task;

import jakarta.persistence.*;

@Entity
@Table(name = "task_labels")
public class TaskLabel {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(nullable = false, length = 50)
    private String label;

    public TaskLabel() {
    }

    public TaskLabel(String id, Task task, String label) {
        this.id = id;
        this.task = task;
        this.label = label;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
