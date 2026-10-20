package com.flowsync.message;

import jakarta.validation.constraints.NotBlank;

public class SendMessageRequest {

    @NotBlank(message = "Message body cannot be blank.")
    private String body;

    public SendMessageRequest() {
    }

    public SendMessageRequest(String body) {
        this.body = body;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
