package com.flowsync.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLabelRepository extends JpaRepository<TaskLabel, String> {
    List<TaskLabel> findByTaskId(String taskId);
    void deleteByTaskId(String taskId);
}
