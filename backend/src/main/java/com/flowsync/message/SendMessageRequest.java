package com.flowsync.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    @NotBlank(message = "Message body cannot be blank.")
    @Size(max = 2000, message = "Message body cannot exceed 2000 characters.")
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
