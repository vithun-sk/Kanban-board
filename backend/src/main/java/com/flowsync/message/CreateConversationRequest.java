package com.flowsync.message;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateConversationRequest {

    private String title;

    @NotEmpty(message = "Participant IDs cannot be empty.")
    private List<String> participantIds;

    public CreateConversationRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }
}
