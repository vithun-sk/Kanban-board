package com.flowsync.invitation;

import jakarta.validation.constraints.NotBlank;

public class CreateProjectInvitationRequest {
    @NotBlank(message = "Invitee user id is required.")
    private String inviteeId;

    public String getInviteeId() { return inviteeId; }
    public void setInviteeId(String inviteeId) { this.inviteeId = inviteeId; }
}
