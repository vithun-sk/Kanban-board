package com.flowsync.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    List<Task> findByProjectId(String projectId);

    int countByProjectId(String projectId);

    int countByProjectIdAndStatus(String projectId, TaskStatus status);

    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.labels l WHERE t.project.id = :projectId ORDER BY t.createdAt DESC")
    List<Task> findByProjectIdWithLabels(@Param("projectId") String projectId);

    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN t.labels l WHERE t.project.createdBy.id = :userId OR EXISTS (SELECT m FROM ProjectMember m WHERE m.project.id = t.project.id AND m.user.id = :userId) ORDER BY t.createdAt DESC")
    List<Task> findAccessibleTasks(@Param("userId") String userId);

    @Query("SELECT DISTINCT t FROM Task t WHERE t.dueDate IS NOT NULL AND t.dueDate BETWEEN :startDate AND :endDate AND (t.project.createdBy.id = :userId OR EXISTS (SELECT m FROM ProjectMember m WHERE m.project.id = t.project.id AND m.user.id = :userId)) ORDER BY t.dueDate ASC")
    List<Task> findTasksInDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
