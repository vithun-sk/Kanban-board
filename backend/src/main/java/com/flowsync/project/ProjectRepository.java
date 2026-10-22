package com.flowsync.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.createdBy.id = :userId OR m.user.id = :userId ORDER BY p.updatedAt DESC")
    List<Project> findAccessibleProjects(@Param("userId") String userId);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.members m LEFT JOIN FETCH m.user WHERE p.id = :id")
    Optional<Project> findByIdWithMembers(@Param("id") String id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdForUpdate(@Param("id") String id);
}
