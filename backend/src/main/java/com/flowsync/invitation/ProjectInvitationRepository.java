package com.flowsync.invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, String> {
    List<ProjectInvitation> findByInviteeIdOrderByCreatedAtDesc(String inviteeId);
    List<ProjectInvitation> findByProjectIdOrderByCreatedAtDesc(String projectId);
    boolean existsByProjectIdAndInviteeIdAndStatus(
            String projectId, String inviteeId, InvitationStatus status);

    @Modifying(flushAutomatically = true)
    @Query("UPDATE ProjectInvitation i SET i.status = :nextStatus WHERE i.id = :id AND i.status = :currentStatus")
    int transitionPending(
            @Param("id") String id,
            @Param("currentStatus") InvitationStatus currentStatus,
            @Param("nextStatus") InvitationStatus nextStatus
    );
}
