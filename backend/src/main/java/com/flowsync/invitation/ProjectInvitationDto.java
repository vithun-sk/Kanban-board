package com.flowsync.invitation;

import java.time.Instant;

public class ProjectInvitationDto {
    private String id;
    private String projectId;
    private String projectName;
    private String inviterId;
    private String inviterName;
    private String inviteeId;
    private String inviteeName;
    private String inviteeEmail;
    private String status;
    private Instant createdAt;

    public static ProjectInvitationDto fromEntity(ProjectInvitation invitation) {
        ProjectInvitationDto dto = new ProjectInvitationDto();
        dto.id = invitation.getId();
        dto.projectId = invitation.getProject().getId();
        dto.projectName = invitation.getProject().getName();
        dto.inviterId = invitation.getInviter().getId();
        dto.inviterName = invitation.getInviter().getName();
        dto.inviteeId = invitation.getInvitee().getId();
        dto.inviteeName = invitation.getInvitee().getName();
        dto.inviteeEmail = invitation.getInvitee().getEmail();
        dto.status = invitation.getStatus().name();
        dto.createdAt = invitation.getCreatedAt();
        return dto;
    }

    public String getId() { return id; }
    public String getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public String getInviterId() { return inviterId; }
    public String getInviterName() { return inviterName; }
    public String getInviteeId() { return inviteeId; }
    public String getInviteeName() { return inviteeName; }
    public String getInviteeEmail() { return inviteeEmail; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
